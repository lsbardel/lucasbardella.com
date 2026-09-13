import { csvFormat } from "d3-dsv";
import { runReport } from "./api.js";
import { formatDate, startDate, formatInputDate } from "./date.js";

const response = await runReport({
  dateRanges: [{ startDate: formatInputDate(startDate), endDate: "today" }],
  dimensions: [{ name: "date" }],
  metrics: [
    { name: "active28DayUsers" },
    { name: "engagementRate" },
    { name: "wauPerMau" },
    { name: "engagedSessions" },
  ],
  orderBys: [{ dimension: { dimensionName: "date" } }],
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
