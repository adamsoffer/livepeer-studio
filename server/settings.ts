let dev = process.env.NODE_ENV !== 'production'

const settings = {
  url: dev
    ? 'https://livepeer.localtunnel.me'
    : 'https://livepeer-staking-alerts.now.sh',
  graphAPI: 'https://api.thegraph.com/subgraphs/name/adamsoffer/livepeer-canary'
}

export default settings
