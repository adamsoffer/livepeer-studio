let dev = process.env.NODE_ENV !== "production";

const settings = {
  url: dev
    ? "https://livepeer-studio.localtunnel.me"
    : "https://livepeer.studio",
  graphAPI:
    "https://api.thegraph.com/subgraphs/name/adamsoffer/livepeer-canary",
  alertsTemplateID: dev
    ? "d-a8b3a54c545a46e2ba7205dbab07ce8a"
    : "d-87642cf59bb0447a860d6b7fdd79f768",
  unbondedTemplateID: dev
    ? "d-c703e5ba590a46a4b078ce491fe35369"
    : "d-5b8d14de939147a08a6579b4c0e42051",
  confirmationTemplateID: dev
    ? "d-bf0cb17ed98a46048c0dc6486a02d9e1"
    : "d-b3812189ecf74b92aefe1d98b34ec054",
  paused: false
};

export default settings;
