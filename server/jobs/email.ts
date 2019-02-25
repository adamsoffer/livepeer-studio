import client from '@sendgrid/client'
import axios from 'axios'
import moment from 'moment'
import * as Utils from 'web3-utils'
import bigInt from 'big-integer'
import settings from '../settings'

require('now-env')

client.setApiKey(process.env.SENDGRID_API_KEY)
client.setDefaultHeader('User-Agent', 'token-alert/1.0.0')

function getDates(frequency) {
  let beginningOfMonth = moment
    .utc()
    .subtract(1, 'months')
    .date(1)
    .unix()

  let endOfMonth = moment
    .utc()
    .subtract(1, 'months')
    .endOf('month')
    .unix()

  let beginningOfWeek = moment
    .utc()
    .endOf('day')
    .subtract(7, 'd')
    .unix()

  let endOfWeek = moment
    .utc()
    .endOf('day')
    .subtract(0, 'd')
    .unix()

  let dateFrom = frequency == 'weekly' ? beginningOfWeek : beginningOfMonth
  let dateTo = frequency == 'weekly' ? endOfWeek : endOfMonth

  return {
    dateFrom,
    dateTo
  }
}

async function formatData(data) {
  let sharesBetweenDates = []
  let poolsBetweenDates = []
  let roundsBetweenDates = []
  let missedRewardCalls: number
  let roundFrom: number
  let roundTo: number
  let totalRounds: number
  let shareRewardTokens: string
  let shareFees: string
  let averageShareRewardTokens: string
  let averageShareFees: string
  let poolRewardTokens: string
  let poolFees: string
  let delegatorAddress: string
  let delegateAddress: string
  let truncatedDelegateAddress: string
  let currentRound = +data.rounds[0].id
  let status = data.delegator && data.delegator.delegate ? 'Bonded' : 'Unbonded'
  let { dateFrom, dateTo } = getDates(data.frequency)
  let formattedDates = formatDates({ dateFrom, dateTo })

  if (data.rounds.length) {
    roundsBetweenDates = data.rounds.filter((round: any) => {
      return (
        +round.id !== currentRound &&
        +round.timestamp >= dateFrom &&
        +round.timestamp <= dateTo
      )
    })
    roundFrom = roundsBetweenDates.reduce(
      (min, p) => (+p.id < +min ? +p.id : +min),
      +roundsBetweenDates[0].id
    )

    roundTo = roundsBetweenDates.reduce(
      (max, p) => (+p.id > +max ? +p.id : +max),
      +roundsBetweenDates[0].id
    )

    totalRounds = roundTo - roundFrom + 1
  }

  if (data.delegator) {
    delegatorAddress = data.delegator.id
  }

  if (status == 'Bonded') {
    delegateAddress = data.delegator.delegate.id
    truncatedDelegateAddress = delegateAddress.replace(
      delegateAddress.slice(5, -3),
      '...'
    )
  }

  // Get all the delegator's shares between the time frame specified (weekly vs monthly)
  if (data.delegator && data.delegator.shares.length) {
    sharesBetweenDates = data.delegator.shares.filter((share: any) => {
      return (
        +share.round.id !== currentRound &&
        +share.round.timestamp >= dateFrom &&
        +share.round.timestamp <= dateTo
      )
    })
    // Add up all the delegator's reward tokens earned during that time frame
    shareRewardTokens = parseFloat(
      Utils.fromWei(
        sharesBetweenDates
          .reduce((acc: any, obj: any) => {
            return bigInt(acc).plus(obj.rewardTokens ? obj.rewardTokens : 0)
          }, 0)
          .toString(),
        'ether'
      )
    ).toFixed(2)

    // Add up all the delegator's fees earned during that time frame
    shareFees = parseFloat(
      Utils.fromWei(
        sharesBetweenDates
          .reduce((acc: any, obj: any) => {
            return bigInt(acc).plus(obj.fees ? obj.fees : 0)
          }, 0)
          .toString(),
        'ether'
      )
    ).toFixed(2)

    averageShareRewardTokens = (+shareRewardTokens / totalRounds).toFixed(2)
    averageShareFees = (+shareFees / totalRounds).toFixed(2)
  }

  // Get all the delegate's pools between the time frame specified (daily vs weekly)
  if (
    data.delegator &&
    data.delegator.delegate &&
    data.delegator.delegate.pools.length
  ) {
    poolsBetweenDates = data.delegator.delegate.pools.filter(pool => {
      return (
        +pool.round.id !== currentRound &&
        +pool.round.timestamp >= dateFrom &&
        +pool.round.timestamp <= dateTo
      )
    })
    missedRewardCalls = poolsBetweenDates.filter(
      pool => pool.rewardTokens === null
    ).length

    // Add up all the delegate's claimed reward tokens in the pools during that time frame
    poolRewardTokens = parseFloat(
      Utils.fromWei(
        poolsBetweenDates
          .reduce((acc: any, obj: any) => {
            return bigInt(acc).plus(obj.rewardTokens ? obj.rewardTokens : 0)
          }, 0)
          .toString(),
        'ether'
      )
    ).toFixed(2)

    // Add up all the delegate's claimed fees in the pools during that time frame
    poolFees = parseFloat(
      Utils.fromWei(
        poolsBetweenDates
          .reduce((acc: any, obj: any) => {
            return bigInt(acc).plus(obj.fees ? obj.fees : 0)
          }, 0)
          .toString(),
        'ether'
      )
    ).toFixed(2)
  }

  return {
    roundFrom,
    roundTo,
    totalRounds,
    missedRewardCalls,
    pools: poolsBetweenDates,
    shares: sharesBetweenDates,
    averageShareRewardTokens,
    averageShareFees,
    poolRewardTokens,
    poolFees: poolFees,
    shareRewardTokens,
    shareFees,
    status,
    delegatorAddress,
    delegateAddress,
    truncatedDelegateAddress,
    ...formattedDates
  }
}

async function getInitialData(delegatorAddress) {
  let query = `{
    rounds(first: 1, orderDirection: desc, orderBy: timestamp) {
      id
    }
    delegator(id: "${delegatorAddress}") {
      id
      delegate {
        id
      }
    }
  }`

  try {
    let { data } = await axios.post(
      settings.graphAPI,
      {
        query
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return data
  } catch (e) {
    console.log(e)
  }
}

async function getDelegatorData(frequency, delegatorAddress) {
  let { data } = await getInitialData(delegatorAddress)
  let delegateAddress =
    data.delegator && data.delegator.delegate ? data.delegator.delegate.id : ''
  let currentRound = +data.rounds[0].id
  delegatorAddress = data.delegator ? data.delegator.id : ''

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
    rounds(first: 40, orderDirection: desc, orderBy: timestamp) {
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
      settings.graphAPI,
      {
        query: query
      },
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )
    return formatData({ frequency, ...data.data })
  } catch (e) {
    console.log(e)
  }
}

function formatDates({ dateFrom, dateTo }) {
  let monthFrom = moment.unix(dateFrom).format('MMMM')
  let monthTo = moment.unix(dateTo).format('MMMM')
  let abbrMonthFrom = moment.unix(dateFrom).format('MMM')
  let abbrMonthTo = moment.unix(dateTo).format('MMM')
  let numberDateFrom = moment.unix(dateFrom).format('D')
  let numberDateTo = moment.unix(dateTo).format('D')
  let ordinalDateFrom = moment.unix(dateFrom).format('Do')
  let ordinalDateTo = moment.unix(dateTo).format('Do')
  let year = moment.unix(dateTo).format('YYYY')
  let todaysDate = moment().format('MMM D, YYYY')

  return {
    monthFrom,
    monthTo,
    abbrMonthFrom,
    abbrMonthTo,
    ordinalDateFrom,
    ordinalDateTo,
    year,
    todaysDate,
    dateFrom: numberDateFrom,
    dateTo: numberDateTo
  }
}

async function sendEmail({ frequency, email, delegatorAddress }) {
  let data: any = await getDelegatorData(frequency, delegatorAddress)
  let title = `Staking Digest (${frequency.charAt(0).toUpperCase() +
    frequency.slice(1)})`

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
          subject: `Livepeer Staking Alert for ${delegatorAddress}`,
          url: settings.url,
          frequency,
          ...data
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
    template_id:
      data.status == 'Bonded'
        ? settings.alertsTemplateID
        : settings.unbondedTemplateID
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
