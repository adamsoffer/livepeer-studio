import client from '@sendgrid/client'
import axios from 'axios'
import moment from 'moment'
import * as Utils from 'web3-utils'
import bigInt from 'big-integer'

require('dotenv').load()

client.setApiKey(process.env.SENDGRID_API_KEY)
client.setDefaultHeader('User-Agent', 'staking-digest/1.0.0')

async function formatData(_frequency, { delegator, rounds }) {
  const currentRound = +rounds[0].id
  const { shares, delegate } = delegator
  const { pools } = delegate

  const dateFrom = moment
    .utc()
    .startOf('day')
    .subtract(9, 'd')
    .unix()

  const dateTo = moment
    .utc()
    .endOf('day')
    .subtract(3, 'd')
    .unix()

  // Get all the delegator's shares between the time frame specified (daily vs weekly)
  const sharesBetweenDates = shares.filter(function(share) {
    return (
      +share.round.id !== currentRound && +share.round.timestamp >= dateFrom
    )
  })

  // Add up all the delegator's reward tokens earned during that time frame
  const shareRewardTokens = parseFloat(
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
  const shareFees = parseFloat(
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
  const poolsBetweenDates = pools.filter(function(pool) {
    return +pool.round.id !== currentRound && +pool.round.timestamp >= dateFrom
  })

  const missedRewardCalls = poolsBetweenDates.filter(
    pool => pool.rewardTokens === null
  ).length

  // Add up all the delegate's claimed reward tokens in the pools during that time frame
  const poolRewardTokens = parseFloat(
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
  const poolFees = parseFloat(
    Utils.fromWei(
      poolsBetweenDates
        .reduce(function(acc, obj) {
          return bigInt(acc).plus(obj.fees ? obj.fees : 0)
        }, 0)
        .toString(),
      'ether'
    )
  ).toFixed(2)

  const roundFrom = sharesBetweenDates.reduce(
    (min, p) => (+p.round.id < +min ? +p.round.id : +min),
    +sharesBetweenDates[0].round.id
  )

  const roundTo = sharesBetweenDates.reduce(
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
  const query = `{
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
    return {
      currentRound: +data.data.rounds[0].id,
      delegateAddress: data.data.delegator.delegate.id
    }
  } catch (e) {
    console.log(e)
  }
}

export const queryGraph = async function(frequency, delegatorAddress) {
  console.log('whatttt', frequency, delegatorAddress)
  const { currentRound, delegateAddress } = await getInitialData(
    delegatorAddress
  )

  // Get delegators most recent 40 shares
  const limit = 40

  // Construct where clause for shares fragment
  const id_in_shares = Array.from(
    { length: limit },
    (_v, k) => `"${delegatorAddress}-${k + (currentRound - limit)}"`
  ).join()

  // Construct where clause for pools fragment
  const id_in_pools = Array.from(
    { length: limit },
    (_v, k) => `"${delegateAddress}-${k + (currentRound - limit)}"`
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
  const data = await queryGraph(frequency, delegatorAddress)
  const monthFrom = moment.unix(data.dateFrom).format('MMMM')
  const monthTo = moment.unix(data.dateTo).format('MMMM')
  const abbrMonthFrom = moment.unix(data.dateFrom).format('MMM')
  const abbrMonthTo = moment.unix(data.dateTo).format('MMM')
  const dateFrom = moment.unix(data.dateFrom).format('D')
  const dateTo = moment.unix(data.dateTo).format('D')
  const ordinalDateFrom = moment.unix(data.dateFrom).format('Do')
  const ordinalDateTo = moment.unix(data.dateTo).format('Do')
  const year = moment.unix(data.dateTo).format('YYYY')
  const todaysDate = moment().format('MMM D, YYYY')
  const totalRounds = data.roundTo - data.roundFrom + 1
  const averageShareRewardTokens = (
    +data.shareRewardTokens / totalRounds
  ).toFixed(2)
  const averageShareFees = (+data.shareFees / totalRounds).toFixed(2)
  const truncatedDelegateAddress = data.delegateAddress.replace(
    data.delegateAddress.slice(5, -3),
    '...'
  )
  const title = `Staking Digest (${frequency.charAt(0).toUpperCase() +
    frequency.slice(1)})`
  const mailData = {
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
          subject: `Livepeer Staking Digest for ${delegatorAddress}`,
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
          truncatedDelegateAddress
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
    const { frequency, email, delegatorAddress } = job.attrs.data
    console.log('hmm', job.attrs.data)
    await sendEmail({ frequency, email, delegatorAddress })
    done()
  })
}
