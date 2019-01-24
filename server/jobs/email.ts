import sgMail from '@sendgrid/mail'

require('dotenv').load()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports = async function(agenda) {
  agenda.define('email', () => {
    const msg = {
      to: 'adam.soffer@digitalsurgeons.com',
      from: 'ads1018@gmail.com',
      subject: 'Hello world',
      text: 'Hello plain world!',
      html: '<p>Hello HTML world!!asdf</p>',
      templateId: 'd-87642cf59bb0447a860d6b7fdd79f768',
      dynamic_template_data: {
        subject: 'Testing Templates',
        Sender_Name: 'Livepeer',
        first_name: 'Adam',
        last_name: 'Adam'
      }
    }
    sgMail.send(msg)
  })
}
