let dev = process.env.NODE_ENV !== 'production'

const settings = {
  url: dev
    ? 'https://livepeer.localtunnel.me'
    : 'https://livepeer-staking-alerts.now.sh',
  graphAPI:
    'https://api.thegraph.com/subgraphs/name/adamsoffer/livepeer-canary',
  alertsTemplateID: 'd-87642cf59bb0447a860d6b7fdd79f768',
  unbondedTemplateID: 'd-5b8d14de939147a08a6579b4c0e42051',
  confirmationTemplateID: 'd-b3812189ecf74b92aefe1d98b34ec054'
}

export default settings
