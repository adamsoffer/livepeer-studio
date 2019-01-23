import client from '@sendgrid/client'
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
  console.log('env', process.env.SENDGRID_API_KEY)
  const emailBody = req.body
  const listID = emailBody['account']
  const contactID = await createRecipient(emailBody)
  await addRecipientToList(contactID, listID)
  createEmailJob()
  res.sendStatus(200)
}

async function createEmailJob() {
  await agenda
    .create('email', { to: 'adam@soffer.space' })
    .unique({ email: 'adam@soffer.space' })
    .repeatEvery('1 week')
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
      const contactID = response.body.persisted_recipients[0]
      return contactID
    } else {
      // throw an error
    }
  }
}

async function addRecipientToList(contactID: number, account: string) {
  const [, body] = await client.request({
    method: 'GET',
    url: '/v3/contactdb/lists'
  })

  let list = body.lists.filter((list: any) => list.name == account)[0]

  // If list doesn't exist, create it
  if (!list) {
    ;[, list] = await client.request({
      method: 'POST',
      url: '/v3/contactdb/lists',
      body: { name: account }
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
