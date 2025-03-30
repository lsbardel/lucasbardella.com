import {html} from "npm:htl";
import * as Plot from "npm:@observablehq/plot";

export function lineChart(data, {width, height = 94, x = "date", y, percent} = {}) {
  return Plot.plot({
    width,
    height,
    axis: null,
    margin: 0,
    insetTop: 10,
    insetLeft: -17,
    insetRight: -17,
    y: {zero: true, percent, domain: percent ? [0, 100] : undefined},
    marks: [Plot.areaY(data, {x, y, fillOpacity: 0.2}), Plot.lineY(data, {x, y, tip: true})]
  });
}

export function trendNumber(data, {focus, value, ...options} = {}) {
  const focusIndex = data.findIndex((d) => d === focus);
  return formatTrend(focus[value] - data[focusIndex - 1]?.[value], options);
}

export function formatTrend(
  value,
  {
    locale,
    format = {},
    positive = "green",
    negative = "red",
    base = "muted",
    positiveSuffix = " ↗︎",
    negativeSuffix = " ↘︎",
    baseSuffix = ""
  } = {}
) {
  if (format.signDisplay === undefined) format = {...format, signDisplay: "always"};
  return html`<span class="small ${value > 0 ? positive : value < 0 ? negative : base}">${value.toLocaleString(
    locale,
    format
  )}${value > 0 ? positiveSuffix : value < 0 ? negativeSuffix : baseSuffix}`;
}
