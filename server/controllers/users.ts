import client from '@sendgrid/client'
import axios from 'axios'
import moment from 'moment'
import * as Utils from 'web3-utils'
import bigInt from 'big-integer'
import agenda from '../agenda'

require('dotenv').load()

client.setApiKey(process.env.SENDGRID_API_KEY)
client.setDefaultHeader('User-Agent', 'staking-digest/1.0.0')

const Settings = require('../settings')
const optIn = 'opt-in'

interface Email {
  personalizations: any[]
  from: object
  content: object[]
  template_id?: object
  time_sent?: string
  type?: string
  [key: string]: any
}

async function formatData(frequency, { delegator, rounds }) {
  console.log(frequency)
  const currentRound = +rounds[0].id
  const { shares } = delegator

  const dateFrom = moment
    .utc()
    .startOf('day')
    .subtract(9, 'd')
    .unix()

  const dateTo = moment
    .utc()
    .endOf('day')
    .subtract(2, 'd')
    .unix()

  const filteredShares = shares.filter(function(share) {
    return (
      +share.round.id !== currentRound && +share.round.timestamp >= dateFrom
    )
  })

  const totalRewardTokens = Utils.fromWei(
    filteredShares
      .reduce(function(acc, obj) {
        return bigInt(acc).plus(obj.rewardTokens ? obj.rewardTokens : 0)
      }, 0)
      .toString(),
    'ether'
  )

  const totalFees = Utils.fromWei(
    filteredShares
      .reduce(function(acc, obj) {
        return bigInt(acc).plus(obj.fees ? obj.fees : 0)
      }, 0)
      .toString(),
    'ether'
  )

  const roundFrom = filteredShares.reduce(
    (min, p) => (+p.round.id < +min ? +p.round.id : +min),
    +filteredShares[0].round.id
  )

  const roundTo = filteredShares.reduce(
    (max, p) => (+p.round.id > +max ? +p.round.id : +max),
    +filteredShares[0].round.id
  )

  return {
    dateFrom,
    dateTo,
    roundFrom,
    roundTo,
    totalRewardTokens,
    totalFees
  }
}

export const getCurrentRound = async function() {
  const query = `{
    rounds(first: 1, orderDirection: desc, orderBy: timestamp) {
      id
      timestamp
    }
  }`

  try {
    const { data } = await axios.post(
      process.env.GRAPH_API,
      {
        query: query
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return +data.data.rounds[0].id
  } catch (e) {
    console.log(e)
  }
}

export const queryGraph = async function(frequency, delegatorAddress) {
  const currentRound = await getCurrentRound()
  // Get delegators most recent 40 shares
  const limit = 40
  // Constructs where clause for graphql query
  const id_in = Array.from(
    { length: limit },
    (_v, k) => `"${delegatorAddress}-${k + (currentRound - limit)}"`
  ).join()

  const query = `{
    rounds(first: 1, orderDirection: desc, orderBy: timestamp) {
      id
      timestamp
    }
    delegator(id: "${delegatorAddress}") {
      id
      delegate {
        id
      }
      shares(where: { id_in: [${id_in}] } ) {
        fees
        rewardTokens
        round {
          timestamp
          id
        }
      }
    }
  }`

  try {
    const { data } = await axios.post(
      process.env.GRAPH_API,
      {
        query: query
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    console.log(data)
    return formatData(frequency, data.data)
  } catch (e) {
    console.log(e)
  }
}

export const sendEmail = async function(_req: any, res: any) {
  const delegatorAddress = '0x22b544d19ffe43c6083327271d9f39020da30c65'
  const frequency = 'weekly'
  const data = await queryGraph(frequency, delegatorAddress)
  res.setHeader('Content-Type', 'application/json')
  res.send(JSON.stringify(data))
  // const msg = {
  //   to,
  //   from: 'no-reply@livepeer.org',
  //   subject: `Staking digest for ${delegatorAddress}`,
  //   templateId: 'd-87642cf59bb0447a860d6b7fdd79f768',
  //   dynamic_template_data: {
  //     ...data
  //   }
  // }
  // sgMail.send(msg)
}

// Send confirmation email to contact with link to confirm email
export const sendConfirmation = async (req, res) => {
  const emailBody = req.body
  const [response] = await client.request({
    method: 'POST',
    url: '/v3/mail/send',
    body: prepareConfirmationEmail(emailBody)
  })
  res.sendStatus(response.statusCode)
}

// Create new contact and add contact to given list
export const addUser = async function(req: any, res: any) {
  const emailBody = req.body
  const listID = emailBody['account']
  const frequency = emailBody['frequency']
  const contactID = await createRecipient(emailBody)

  if (contactID) {
    await addRecipientToList(contactID, listID, frequency)
    createEmailJob()
  }
  res.sendStatus(200)
}

// TODO: schedule based on user preference (daily, weekly, or monthly)
async function createEmailJob() {
  await agenda
    .create('email', { to: 'adam@soffer.space' })
    .unique({ email: 'adam@soffer.space' })
    .repeatEvery('week', { skipImmediate: true })
    .save()
}

function prepareConfirmationEmail(reqBody: any) {
  const subject = 'Please Confirm Your Email Address'
  const url = formatUrl(Settings.url) + '/success'
  const link = "<a href='" + url + "'>this link</a>"
  const mailText =
    'Thanks for signing up! Click ' +
    link +
    ' to sign up!  This link will be active for 24 hours.'

  let emailBody: Email = {
    personalizations: [
      {
        to: [
          {
            email: reqBody.email
          }
        ],
        subject: subject,
        custom_args: {
          type: optIn,
          time_sent: String(Date.now())
        },
        substitutions: {
          link_insert: link
        }
      }
    ],
    from: {
      email: Settings.senderEmail,
      name: Settings.senderName
    },
    content: [
      {
        type: 'text/html',
        value: mailText
      }
    ]
  }

  const templateId = Settings.templateId
  if (templateId) {
    emailBody.template_id = templateId
  }

  for (let key in reqBody) {
    if ({}.hasOwnProperty.call(reqBody, key)) {
      emailBody.personalizations[0].custom_args[key] = reqBody[key]
    }
  }

  return emailBody
}

async function createRecipient(emailBody: Email) {
  const emailType = emailBody.type
  const timestamp = emailBody.time_sent
  const secondsInDay = 86400
  const timeElapsed = (Date.now() - Number(timestamp)) / 1000

  // Confirm email type is opt in and link has been clicked within 1 day
  if (emailType === optIn && timeElapsed < secondsInDay) {
    // Create recipient
    const [response] = await client.request({
      method: 'POST',
      url: '/v3/contactdb/recipients',
      body: [
        {
          email: emailBody['email'],
          account: emailBody['account'],
          frequency: emailBody['frequency']
        }
      ]
    })
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.body.persisted_recipients[0]
    } else {
      return false
    }
  }
}

async function addRecipientToList(
  contactID: number,
  account: string,
  frequency: string
) {
  const [, body] = await client.request({
    method: 'GET',
    url: '/v3/contactdb/lists'
  })

  let list = body.lists.filter(
    (list: any) => list.name == `${account} - ${frequency}`
  )[0]

  // If list doesn't exist, create it
  if (!list) {
    ;[, list] = await client.request({
      method: 'POST',
      url: '/v3/contactdb/lists',
      body: { name: `${account} - ${frequency}` }
    })
  }

  // add contact to list
  await client.request({
    method: 'POST',
    url: '/v3/contactdb/lists/' + list.id + '/recipients/' + contactID
  })
}

function formatUrl(url: string) {
  if (url.substr(-1) === '/') {
    return url.substring(0, url.length - 1)
  }
  return url
}
