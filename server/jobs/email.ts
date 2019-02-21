import client from '@sendgrid/client'
import axios from 'axios'
import moment from 'moment'
import * as Utils from 'web3-utils'
import bigInt from 'big-integer'

require('dotenv').load()

client.setApiKey(process.env.SENDGRID_API_KEY)
client.setDefaultHeader('User-Agent', 'token-alert/1.0.0')

async function formatData(_frequency, { delegator, rounds }) {
  let currentRound = +rounds[0].id
  let { shares, delegate } = delegator
  let { pools } = delegate

  let dateFrom = moment
    .utc()
    .startOf('day')
    .subtract(9, 'd')
    .unix()

  let dateTo = moment
    .utc()
    .endOf('day')
    .subtract(3, 'd')
    .unix()

  // Get all the delegator's shares between the time frame specified (daily vs weekly)
  let sharesBetweenDates = shares.filter(function(share) {
    return (
      +share.round.id !== currentRound && +share.round.timestamp >= dateFrom
    )
  })

  // Add up all the delegator's reward tokens earned during that time frame
  let shareRewardTokens = parseFloat(
    Utils.fromWei(
      sharesBetweenDates
        .reduce(function(acc, obj) {
          return bigInt(acc).plus(obj.rewardTokens ? obj.rewardTokens : 0)
        }, 0)
        .toString(),
      'ether'
    )
  ).toFixed(2)

  // Add up all the delegator's fees earned during that time frame
  let shareFees = parseFloat(
    Utils.fromWei(
      sharesBetweenDates
        .reduce(function(acc, obj) {
          return bigInt(acc).plus(obj.fees ? obj.fees : 0)
        }, 0)
        .toString(),
      'ether'
    )
  ).toFixed(2)

  // Get all the delegate's pools between the time frame specified (daily vs weekly)
  let poolsBetweenDates = pools.filter(function(pool) {
    return +pool.round.id !== currentRound && +pool.round.timestamp >= dateFrom
  })

  let missedRewardCalls = poolsBetweenDates.filter(
    pool => pool.rewardTokens === null
  ).length

  // Add up all the delegate's claimed reward tokens in the pools during that time frame
  let poolRewardTokens = parseFloat(
    Utils.fromWei(
      poolsBetweenDates
        .reduce(function(acc, obj) {
          return bigInt(acc).plus(obj.rewardTokens ? obj.rewardTokens : 0)
        }, 0)
        .toString(),
      'ether'
    )
  ).toFixed(2)

  // Add up all the delegate's claimed fees in the pools during that time frame
  let poolFees = parseFloat(
    Utils.fromWei(
      poolsBetweenDates
        .reduce(function(acc, obj) {
          return bigInt(acc).plus(obj.fees ? obj.fees : 0)
        }, 0)
        .toString(),
      'ether'
    )
  ).toFixed(2)

  let roundFrom = sharesBetweenDates.reduce(
    (min, p) => (+p.round.id < +min ? +p.round.id : +min),
    +sharesBetweenDates[0].round.id
  )

  let roundTo = sharesBetweenDates.reduce(
    (max, p) => (+p.round.id > +max ? +p.round.id : +max),
    +sharesBetweenDates[0].round.id
  )

  return {
    dateFrom,
    dateTo,
    roundFrom,
    roundTo,
    missedRewardCalls,
    pools: poolsBetweenDates,
    shares: sharesBetweenDates,
    poolRewardTokens,
    poolFees: poolFees,
    shareRewardTokens,
    shareFees,
    delegatorAddress: delegator.id,
    delegateAddress: delegate.id
  }
}

export const getInitialData = async function(delegatorAddress) {
  let query = `{
    rounds(first: 1, orderDirection: desc, orderBy: timestamp) {
      id
    }
    delegator(id: "${delegatorAddress}") {
      delegate {
        id
      }
    }
  }`

  try {
    let { data } = await axios.post(
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
    return {
      currentRound: +data.data.rounds[0].id,
      delegateAddress: data.data.delegator.delegate.id
    }
  } catch (e) {
    console.log(e)
  }
}

export const queryGraph = async function(frequency, delegatorAddress) {
  let { currentRound, delegateAddress } = await getInitialData(delegatorAddress)

  // Get delegators most recent 40 shares
  let limit = 40

  // Construct where clause for shares fragment
  let id_in_shares = Array.from(
    { length: limit },
    (_v, k) => `"${delegatorAddress}-${k + (currentRound - limit)}"`
  ).join()

  // Construct where clause for pools fragment
  let id_in_pools = Array.from(
    { length: limit },
    (_v, k) => `"${delegateAddress}-${k + (currentRound - limit)}"`
  ).join()

  let query = `{
    rounds(first: 1, orderDirection: desc, orderBy: timestamp) {
      id
      timestamp
    }
    delegator(id: "${delegatorAddress}") {
      id
      delegate {
        id
        pools(where: { id_in: [${id_in_pools}] } ) {
          rewardTokens
          fees
          round {
            id
            timestamp
          }
        }
      }
      shares(where: { id_in: [${id_in_shares}] } ) {
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
    let { data } = await axios.post(
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
    return formatData(frequency, data.data)
  } catch (e) {
    console.log(e)
  }
}

export const sendEmail = async function({
  frequency,
  email,
  delegatorAddress
}) {
  let data = await queryGraph(frequency, delegatorAddress)
  let monthFrom = moment.unix(data.dateFrom).format('MMMM')
  let monthTo = moment.unix(data.dateTo).format('MMMM')
  let abbrMonthFrom = moment.unix(data.dateFrom).format('MMM')
  let abbrMonthTo = moment.unix(data.dateTo).format('MMM')
  let dateFrom = moment.unix(data.dateFrom).format('D')
  let dateTo = moment.unix(data.dateTo).format('D')
  let ordinalDateFrom = moment.unix(data.dateFrom).format('Do')
  let ordinalDateTo = moment.unix(data.dateTo).format('Do')
  let year = moment.unix(data.dateTo).format('YYYY')
  let todaysDate = moment().format('MMM D, YYYY')
  let totalRounds = data.roundTo - data.roundFrom + 1
  let averageShareRewardTokens = (
    +data.shareRewardTokens / totalRounds
  ).toFixed(2)
  let averageShareFees = (+data.shareFees / totalRounds).toFixed(2)
  let truncatedDelegateAddress = data.delegateAddress.replace(
    data.delegateAddress.slice(5, -3),
    '...'
  )
  let title = `Staking Digest (${frequency.charAt(0).toUpperCase() +
    frequency.slice(1)})`
  let rewardCallText = data.missedRewardCalls
    ? `Transcoder ${data.delegateAddress} did not call reward during ${
        data.missedRewardCalls
      } of the last ${totalRounds} rounds. Head to the forum and hold it accountable!`
    : `Transcoder ${
        data.delegateAddress
      } called reward during each of the last ${totalRounds} rounds, maximizing your earnings potential.`

  let mailData = {
    personalizations: [
      {
        to: [
          {
            email
          }
        ],
        custom_args: {
          frequency,
          delegatorAddress,
          timeSent: String(Date.now())
        },
        dynamic_template_data: {
          title,
          subject: `Livepeer Token Alert for ${delegatorAddress}`,
          url: process.env.URL,
          frequency,
          monthFrom,
          monthTo,
          abbrMonthFrom,
          abbrMonthTo,
          dateFrom,
          dateTo,
          ordinalDateFrom,
          ordinalDateTo,
          year,
          todaysDate,
          totalRounds,
          averageShareRewardTokens,
          averageShareFees,
          delegatorAddress,
          roundFrom: data.roundFrom,
          roundTo: data.roundTo,
          shareRewardTokens: data.shareRewardTokens,
          shareFees: data.shareFees,
          poolRewardTokens: data.poolRewardTokens,
          poolFees: data.poolFees,
          missedRewardCalls: data.missedRewardCalls,
          delegateAddress: data.delegateAddress,
          truncatedDelegateAddress,
          rewardCallText
        }
      }
    ],
    from: {
      email: 'noreply@livepeer.org',
      name: 'Livepeer'
    },
    reply_to: {
      email: 'noreply@livepeer.org',
      name: 'Livepeer'
    },
    template_id: 'd-87642cf59bb0447a860d6b7fdd79f768'
  }

  try {
    await client.request({
      body: mailData,
      method: 'POST',
      url: '/v3/mail/send'
    })
  } catch (e) {
    console.log(e)
  }
}

module.exports = async function(agenda) {
  agenda.define('email', async (job, done) => {
    let { frequency, email, delegatorAddress } = job.attrs.data
    await sendEmail({ frequency, email, delegatorAddress })
    done()
  })
}
