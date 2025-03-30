```ts
const summary = FileAttachment("data/google-analytics/summary.csv").csv({ typed: true });
```

```js
import { trendNumber, lineChart } from "./components/google-analytics.js";
```

# Site Analytics

```js
// Like Generators.input, but works with resize, and adds a default value.
function generateValue(target, defaultValue) {
  return Generators.observe((notify) => {
    const changed = ({ target }) => notify(target.value ?? defaultValue);
    if (defaultValue !== undefined) notify(defaultValue);
    target.addEventListener("input", changed);
    return () => target.removeEventListener("input", changed);
  });
}

const activeUsersChart = resize((width) => lineChart(summary, { width, y: "active" }));
const engagementRateChart = resize((width) =>
  lineChart(summary, { width, y: "engagementRate", percent: true }),
);
const wauPerMauChart = resize((width) =>
  lineChart(summary, { width, y: "wauPerMau", percent: true }),
);
const engagedSessionsChart = resize((width) => lineChart(summary, { width, y: "engagedSessions" }));

const activeUsers = generateValue(activeUsersChart, summary[summary.length - 1]);
const engagementRate = generateValue(engagementRateChart, summary[summary.length - 1]);
const wauPerMau = generateValue(wauPerMauChart, summary[summary.length - 1]);
const engagedSessions = generateValue(engagedSessionsChart, summary[summary.length - 1]);
```

<div class="grid grid-cols-4">
  <div class="card crop">
    <h2>Active users</h2>
    <span class="big">${activeUsers.active.toLocaleString("en-US")}</span>
    ${trendNumber(summary, {focus: activeUsers, value: "active"})}
    ${activeUsersChart}
  </div>
  <div class="card crop">
    <h2>Engagement rate</h2>
    <span class="big">${engagementRate.engagementRate.toLocaleString("en-US", {style: "percent"})}</span>
    ${trendNumber(summary, {focus: engagementRate, value: "engagementRate", format: {style: "percent"}})}
    ${engagementRateChart}
  </div>
  <div class="card crop">
    <h2>WAU/MAU ratio</h2>
    <span class="big">${wauPerMau.wauPerMau.toLocaleString("en-US", {style: "percent"})}</span>
    ${trendNumber(summary, {focus: wauPerMau, value: "wauPerMau", format: {style: "percent"}})}
    ${wauPerMauChart}
  </div>
  <div class="card crop">
    <h2>Engaged sessions</h2>
    <span class="big">${engagedSessions.engagedSessions.toLocaleString("en-US")}</span>
    ${trendNumber(summary, {focus: engagedSessions, value: "engagedSessions"})}
    ${engagedSessionsChart}
  </div>
</div>
