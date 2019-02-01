import sgMail from '@sendgrid/mail'

require('dotenv').load()

sgMail.setApiKey(process.env.SENDGRID_API_KEY)

module.exports = async function(agenda) {
  agenda.define('email', async (job, done) => {
    const { to, delegatorAddress } = job.attrs.data
    const query = `{
      delegator(id: "${delegatorAddress}") {
        shares {
          rewardTokens
          round {
            timestamp
            id
          }
        }
      }
    }`;
    const response = await fetch(
      process.env.GRAPH_API,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json"
        },
        body: JSON.stringify({ query })
      }
    );
    const data = await response.json();
    const msg = {
      to,
      from: 'no-reply@livepeer.org',
      subject: `Staking digest for ${delegatorAddress}`,
      templateId: 'd-87642cf59bb0447a860d6b7fdd79f768',
      dynamic_template_data: {
        ...data
      }
    }
    sgMail.send(msg)
    done()
  })
}