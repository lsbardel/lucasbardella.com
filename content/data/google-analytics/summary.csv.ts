import { csvFormat } from "d3-dsv";
import { timeFormat } from "d3-time-format";
import { runReport } from "./api.js";

const formatInputDate = timeFormat("%Y-%m-%d");

const startDate = new Date();
startDate.setDate(startDate.getDate() - 28);

const response = await runReport({
  dateRanges: [{ startDate: formatInputDate(startDate), endDate: "today" }],
  dimensions: [{ name: "date" }],
  metrics: [
    { name: "activeUsers" },
    { name: "engagementRate" },
    { name: "wauPerMau" },
    { name: "engagedSessions" },
  ],
  orderBys: [{dimension: {dimensionName: "date"}}],
});


process.stdout.write(
  csvFormat(
    response.rows.map((d) => ({
      date: formatDate(d.dimensionValues[0].value),
      active: d.metricValues[0].value,
      engagementRate: d.metricValues[1].value,
      wauPerMau: d.metricValues[2].value,
      engagedSessions: d.metricValues[3].value,
    })),
  ),
);

function formatDate(date) {
  return `${date.slice(0, 4)}-${date.slice(4, 6)}-${date.slice(6, 8)}`;
}
