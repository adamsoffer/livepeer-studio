import client from "@sendgrid/client";
import url from "url";
import moment from "moment";
import agenda from "../agenda";
import settings from "../settings";
import { Response, Request } from "express";

require("now-env");

client.setApiKey(process.env.SENDGRID_API_KEY);
client.setDefaultHeader("User-Agent", "token-alert/1.0.0");

const optIn = "opt-in";

// Send confirmation email to contact with link to confirm email
export const sendConfirmation = async (req: Request, res: Response) => {
  let emailBody = req.body;
  try {
    let [response] = await client.request({
      method: "POST",
      url: "/v3/mail/send",
      body: prepareConfirmationEmail(emailBody)
    });
    res.status(response.statusCode).send(response);
  } catch (e) {
    res.status(400).send(e);
  }
};

export const dispatch = async function(req: Request, res: Response) {
  if (req.query.accessToken !== process.env.SENDGRID_API_KEY) {
    return res.sendStatus(401);
  }

  let { action } = url.parse(req.body[0]["url"], true).query;

  switch (action) {
    case "unsubscribe":
      await unsubscribe({ ...req.body[0] });
      break;
    case "confirm":
      await addUser({ ...req.body[0] });
      break;
    default:
      return;
  }
  res.sendStatus(200);
};

async function cancelJob({ frequency, email, delegatorAddress }) {
  try {
    // delete job
    await agenda.cancel({
      name: "email",
      "data.frequency": frequency,
      "data.email": email,
      "data.delegatorAddress": delegatorAddress
    });
  } catch (e) {
    console.log(e);
  }
}

async function unsubscribe({ frequency, email, delegatorAddress }) {
  try {
    let recipient_id = await getRecipientId(email);
    let list_id = await getListId({
      recipient_id,
      frequency,
      delegatorAddress
    });

    await deleteRecipientFromList({ list_id, recipient_id });
    await cancelJob({ frequency, email, delegatorAddress });
  } catch (e) {
    console.log(e);
  }
}

// Create new contact and add contact to given list
async function addUser({
  frequency,
  email,
  delegatorAddress,
  senderEmail,
  senderName,
  unsubscribeRedirect,
  type,
  timeSent
}) {
  try {
    let contactID = await createRecipient({
      type,
      timeSent,
      email
    });
    if (contactID) {
      await addRecipientToList({ contactID, delegatorAddress, frequency });
      await createEmailJob({
        frequency,
        email,
        delegatorAddress,
        senderEmail,
        senderName,
        unsubscribeRedirect
      });
    }
  } catch (e) {
    console.log(e);
  }
}

async function createEmailJob({
  frequency,
  email,
  delegatorAddress,
  senderEmail,
  senderName,
  unsubscribeRedirect
}) {
  try {
    let everyFridayAt7am = "0 7 * * 5";
    let firstOfEveryMonthAt7am = "0 7 1 * *";
    let job = await agenda.create("email", {
      frequency,
      email,
      delegatorAddress,
      senderEmail,
      senderName,
      unsubscribeRedirect
    });
    job.unique({ frequency, email, delegatorAddress });
    job.repeatEvery(
      `${frequency == "weekly" ? everyFridayAt7am : firstOfEveryMonthAt7am}`,
      { skipImmediate: true, timezone: "America/New_York" }
    );
    job.save();
  } catch (e) {
    console.log(e);
  }
}

async function getRecipientId(email) {
  try {
    let [response] = await client.request({
      method: "GET",
      url: `/v3/contactdb/recipients/search?email=${email}`
    });
    return response.body.recipients[0].id;
  } catch (e) {
    console.log(e);
  }
}

async function getListId({ recipient_id, frequency, delegatorAddress }) {
  try {
    let [response] = await client.request({
      method: "GET",
      url: `/v3/contactdb/recipients/${recipient_id}/lists`
    });
    let listId = response.body.lists.filter(
      (list: any) => list.name == `${delegatorAddress} - ${frequency}`
    )[0].id;
    return listId.toString();
  } catch (e) {
    console.log(e);
  }
}

async function deleteRecipientFromList({ list_id, recipient_id }) {
  try {
    let [response] = await client.request({
      method: "DELETE",
      url: `/v3/contactdb/lists/${list_id}/recipients/${recipient_id}`
    });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return true;
    } else {
      return false;
    }
  } catch (e) {
    console.log(e);
  }
}

function prepareConfirmationEmail(reqBody) {
  let subject = "Please Confirm Your Email Address";
  let confirmationLink = `${
    settings.url
  }/staking-alerts?action=confirm&frequency=${reqBody.frequency}${
    reqBody.optInRedirect ? `&redirect=${reqBody.optInRedirect}` : ""
  }`;
  let todaysDate = moment()
    .tz("America/New_York")
    .format("MMM D, YYYY");

  let emailBody = {
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
        },
        dynamic_template_data: {
          todaysDate,
          confirmationLink,
          frequency: reqBody.frequency,
          delegatorAddress: reqBody.delegatorAddress
        }
      }
    ],
    from: {
      email: reqBody.senderEmail
        ? reqBody.senderEmail
        : "no-reply@livepeer.studio",
      name: reqBody.senderName ? reqBody.senderName : "Livepeer Studio"
    },
    reply_to: {
      email: reqBody.senderEmail
        ? reqBody.senderEmail
        : "no-reply@livepeer.studio",
      name: reqBody.senderName ? reqBody.senderName : "Livepeer Studio"
    },
    template_id: settings.confirmationTemplateID
  };

  for (let key in reqBody) {
    if ({}.hasOwnProperty.call(reqBody, key)) {
      emailBody.personalizations[0].custom_args[key] = reqBody[key];
    }
  }

  return emailBody;
}

async function createRecipient({ type, timeSent, email }) {
  let secondsInDay = 86400;
  let timeElapsed = (Date.now() - Number(timeSent)) / 1000;

  // Confirm email type is opt in and link has been clicked within 1 day
  if (type === optIn && timeElapsed < secondsInDay) {
    // Create recipient
    let [response] = await client.request({
      method: "POST",
      url: "/v3/contactdb/recipients",
      body: [
        {
          email
        }
      ]
    });
    if (response.statusCode >= 200 && response.statusCode < 300) {
      return response.body.persisted_recipients[0];
    } else {
      return false;
    }
  }
}

async function addRecipientToList({ contactID, delegatorAddress, frequency }) {
  let [, body] = await client.request({
    method: "GET",
    url: "/v3/contactdb/lists"
  });

  let list = body.lists.filter(
    (list: any) => list.name == `${delegatorAddress} - ${frequency}`
  )[0];

  // If list doesn't exist, create it
  if (!list) {
    [, list] = await client.request({
      method: "POST",
      url: "/v3/contactdb/lists",
      body: { name: `${delegatorAddress} - ${frequency}` }
    });
  }

  // add contact to list
  await client.request({
    method: "POST",
    url: "/v3/contactdb/lists/" + list.id + "/recipients/" + contactID
  });
}
