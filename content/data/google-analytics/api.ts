import {BetaAnalyticsDataClient} from "@google-analytics/data";
import config from "@ls/config";

const analyticsClient = new BetaAnalyticsDataClient({
  credentials: {
    client_email: config.ga.clientEmail,
    private_key: config.ga.privateKey,
  }
});

const defaultProperty = `properties/${config.ga.propertyId}`;


export async function runReport({
  property = defaultProperty,
  ...options
} = {}) {
  const [response] = await analyticsClient.runReport({property, ...options});
  return response;
}
