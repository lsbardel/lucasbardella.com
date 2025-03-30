import "dotenv/config";
import pkg from "../package.json" with { type: "json" };

const config = {
  ...pkg,
  ga: {
    measurementId: process.env.GA_MEASUREMENT_ID,
    propertyId: process.env.GA_PROPERTY_ID,
    clientEmail: process.env.GA_CLIENT_EMAIL,
    privateKey: (process.env.GA_PRIVATE_KEY || "").replace(/\\n/g, "\n"), // Replace escaped newlines,
  },
};

export default config;
