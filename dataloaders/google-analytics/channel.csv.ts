import { csvFormat } from "d3-dsv";
import { runReport } from "./api.js";
import { startDate, formatInputDate } from "./date.js";

const response = await runReport({
  dateRanges: [{ startDate: formatInputDate(startDate), endDate: "today" }],
  dimensions: [{ name: "firstUserDefaultChannelGroup" }, { name: "newVsReturning" }],
  metrics: [{ name: "active28DayUsers" }],
  orderBys: [
    { dimension: { dimensionName: "firstUserDefaultChannelGroup" } },
    { dimension: { dimensionName: "newVsReturning" } },
  ],
});

const types = new Set(["new", "returning"]);

process.stdout.write(
  csvFormat(
    response.rows.map((d) => ({
      channelGroup: d.dimensionValues[0].value,
      type: types.has(d.dimensionValues[1].value) ? d.dimensionValues[1].value : "Unknown",
      active28d: d.metricValues[0].value,
    })),
  ),
);
