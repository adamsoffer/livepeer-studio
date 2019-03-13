# ✧･ﾟ Livepeer Studio ･ﾟ ✧

Products & tools for the Livepeer ecosystem.

---

## Staking Alerts Tool Integration

If you'd like to offer Livepeer staking alerts inside your application simply post a form to this public endpoint: `https://livepeer.studio/confirmEmail`

### Required form fields:

| Field              | Description                                                                                                                                                      |
| ------------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| email\*            | A valid email address                                                                                                                                            |
| delegatorAddress\* | A valid ethereum address                                                                                                                                         |
| frequency\*        | Value should be either 'weekly' or 'monthly'. The weekly option gets sent every Friday at 7am ET and monthly option get sent on the 1st of every month at 7am ET |

### Optional form fields (should be hidden):

| Field               | Description                                |
| ------------------- | ------------------------------------------ |
| senderEmail         | Defaults to no-reply@livepeer.studio       |
| senderName          | Defaults to Livepeer Studio                |
| optInRedirect       | Defaults to livepeer.studio/staking-alerts?action=confirm |
| unsubscribeRedirect | Defaults to livepeer.studio/staking-alerts?action=unsubscribe |

### Example:

```html
<form action="https://livepeer.studio/confirmEmail">
  <input type="email" name="email" placeholder="Email Address" />
  <input type="text" name="delegatorAddress" placeholder="Ethereum Address" />
  <input type="text" name="frequency" placeholder="Frequency" />
  <input
    type="hidden"
    value="senderEmail"
    placeholder="no-reply@livepeer.org"
  />
  <input type="hidden" name="senderName" value="Livepeer" />
  <input
    type="hidden"
    name="optInRedirect"
    value="https://explorer.livepeer.org?action=confirm"
  />
  <input
    type="hidden"
    name="unsubscribeRedirect"
    value="https://explorer.livepeer.org?action=unsubscribe"
  />
</form>
```
