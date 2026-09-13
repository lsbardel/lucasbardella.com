import {BetaAnalyticsDataClient} from "@google-analytics/data";

// Read straight from the environment. This used to come from lsts/config.ts via
// the `@ls/config` alias, which went with the Observable site; CI passes these
// as secrets, and locally they come from .env.
const analyticsClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: process.env.GA_CLIENT_EMAIL,
    private_key: (process.env.GA_PRIVATE_KEY || "").replace(/\\n/g, "\n"),
  }
});

const defaultProperty = `properties/${process.env.GA_PROPERTY_ID}`;


export async function runReport({
  property = defaultProperty,
  ...options
} = {}) {
  const [response] = await analyticsClient.runReport({property, ...options});
  return response;
}
