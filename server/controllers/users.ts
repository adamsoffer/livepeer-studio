import client from '@sendgrid/client'
import agenda from '../agenda'
import settings from '../settings'
import url from 'url'

require('dotenv').load()

client.setApiKey(process.env.SENDGRID_API_KEY)
client.setDefaultHeader('User-Agent', 'staking-digest/1.0.0')

const optIn = 'opt-in'

interface Email {
  personalizations: any[]
  from: object
  content: object[]
  template_id?: string
  time_sent?: string
  type?: string
  [key: string]: any
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

// TODO: unsubscribe logic
export const unsubscribe = async function({
  frequency,
  email,
  delegatorAddress
}) {
  console.log('unsubscribe', frequency, email, delegatorAddress)
}

// Create new contact and add contact to given list
export const addUser = async function({
  frequency,
  email,
  delegatorAddress,
  type,
  timeSent
}) {
  const contactID = await createRecipient({
    type,
    timeSent,
    email
  })
  if (contactID) {
    await addRecipientToList({ contactID, delegatorAddress, frequency })
    createEmailJob({ frequency, email, delegatorAddress })
  }
}

async function createEmailJob({ frequency, email, delegatorAddress }) {
  const job = await agenda.create('email', {
    frequency,
    email,
    delegatorAddress
  })
  job.unique({ frequency, email, delegatorAddress })
  job.save()
}

export const dispatch = async function(req: any, res: any) {
  if (req.query.accessToken !== process.env.SENDGRID_API_KEY) {
    return res.sendStatus(401)
  }

  const emailBody = req.body[0]
  const parsedUrl = url.parse(emailBody['url'], true)

  switch (parsedUrl.pathname) {
    case '/unsubscribe':
      await unsubscribe({ ...emailBody })
      break
    case '/success':
      await addUser({ ...emailBody })
      break
    default:
      return
  }
  res.sendStatus(200)
}

function prepareConfirmationEmail(reqBody: any) {
  const subject = 'Please Confirm Your Email Address'
  const link = `<a href="${settings.url}/success">this link</a>`
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
          timeSent: String(Date.now())
        }
      }
    ],
    from: {
      email: settings.senderEmail,
      name: settings.senderName
    },
    content: [
      {
        type: 'text/html',
        value: mailText
      }
    ]
  }

  for (let key in reqBody) {
    if ({}.hasOwnProperty.call(reqBody, key)) {
      emailBody.personalizations[0].custom_args[key] = reqBody[key]
    }
  }

  return emailBody
}

async function createRecipient({ type, timeSent, email }) {
  const secondsInDay = 86400
  const timeElapsed = (Date.now() - Number(timeSent)) / 1000

  // Confirm email type is opt in and link has been clicked within 1 day
  if (type === optIn && timeElapsed < secondsInDay) {
    // Create recipient
    const [response] = await client.request({
      method: 'POST',
      url: '/v3/contactdb/recipients',
      body: [
        {
          email
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

async function addRecipientToList({ contactID, delegatorAddress, frequency }) {
  const [, body] = await client.request({
    method: 'GET',
    url: '/v3/contactdb/lists'
  })

  let list = body.lists.filter(
    (list: any) => list.name == `${delegatorAddress} - ${frequency}`
  )[0]

  // If list doesn't exist, create it
  if (!list) {
    ;[, list] = await client.request({
      method: 'POST',
      url: '/v3/contactdb/lists',
      body: { name: `${delegatorAddress} - ${frequency}` }
    })
  }

  // add contact to list
  await client.request({
    method: 'POST',
    url: '/v3/contactdb/lists/' + list.id + '/recipients/' + contactID
  })
}
