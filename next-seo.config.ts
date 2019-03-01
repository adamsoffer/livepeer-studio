import settings from "./server/settings";

export default {
  title: "Livepeer Studio",
  description: "Building products & tools for the Livepeer ecosystem.",
  openGraph: {
    type: "website",
    locale: "en_IE",
    url: settings.url,
    title: "Livepeer Studio",
    description: "Building products & tools for the Livepeer ecosystem.",
    defaultImageWidth: 1200,
    defaultImageHeight: 1200,
    // Multiple Open Graph images is only available in version `7.0.0-canary.0`+ of next (see note top of README.md)
    images: [
      {
        url: `${settings.url}/static/img/livepeer-card.png`,
        width: 800,
        height: 600,
        alt: "Livepeer"
      }
    ],
    site_name: "Livepeer Studio"
  }
};
