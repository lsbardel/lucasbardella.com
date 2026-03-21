import * as Plot from "npm:@observablehq/plot";
import * as React from "npm:react";

interface DownloadRecord {
  date: string;
  downloads: number;
  provider: string;
}

interface ParsedRecord {
  date: Date;
  downloads: number;
  provider: string;
}

interface GitHubRecord {
  provider: string;
  language: string;
  repo: string;
  stars: number;
}

interface Data {
  npm: DownloadRecord[];
  pypi: DownloadRecord[];
  github: GitHubRecord[];
}

interface Props {
  data: Data;
}

type View = "npm" | "pypi" | "combined";

const PROVIDERS = ["OpenAI", "Anthropic", "Google", "Mistral", "Groq"];

const parse = (records: DownloadRecord[]): ParsedRecord[] =>
  records.map((d) => ({ ...d, date: new Date(d.date) }));

const buildCombined = (npm: DownloadRecord[], pypi: DownloadRecord[]): ParsedRecord[] => {
  const monthKey = (provider: string, date: Date) =>
    `${provider}|${date.getFullYear()}-${date.getMonth()}`;

  const sources = new Map<string, { date: Date; downloads: number; provider: string; count: number }>();

  const addRecords = (records: DownloadRecord[]) => {
    for (const r of records) {
      const month = new Date(r.date);
      month.setDate(1);
      const k = monthKey(r.provider, month);
      const existing = sources.get(k);
      if (existing) {
        existing.downloads += r.downloads;
        existing.count += 1;
      } else {
        sources.set(k, { date: month, downloads: r.downloads, provider: r.provider, count: 1 });
      }
    }
  };

  addRecords(npm);
  addRecords(pypi);

  const pypiStart = parse(pypi).reduce((min, d) => d.date < min ? d.date : min, new Date());

  return Array.from(sources.values())
    .filter((d) => d.date >= pypiStart)
    .map(({ date, downloads, provider }) => ({ date, downloads, provider }))
    .sort((a, b) => a.date.getTime() - b.date.getTime());
};

const makeChart = (
  el: HTMLElement,
  data: ParsedRecord[],
  title: string
): SVGSVGElement | HTMLElement =>
  Plot.plot({
    title,
    width: el.offsetWidth,
    height: 380,
    marginLeft: 70,
    style: { fontSize: "14px" },
    x: { type: "utc", label: null },
    y: { label: "Downloads", grid: true, tickFormat: (d: number) => `${(d / 1e6).toFixed(1)}M` },
    color: { legend: true, domain: PROVIDERS },
    marks: [
      Plot.lineY(data, {
        x: "date",
        y: "downloads",
        stroke: "provider",
        strokeWidth: 2,
      }),
      Plot.tip(data, Plot.pointerX({
        x: "date",
        y: "downloads",
        stroke: "provider",
        title: (d: ParsedRecord) => `${d.provider}\n${(d.downloads / 1e6).toFixed(1)}M`,
      })),
    ],
  });

const BUTTON_BASE: React.CSSProperties = {
  padding: "0.3rem 1.1rem",
  border: "1px solid var(--theme-foreground-muted, #666)",
  borderRadius: "4px",
  cursor: "pointer",
  fontSize: "0.85rem",
  background: "transparent",
  color: "inherit",
  marginRight: "0.5rem",
};

const BUTTON_ACTIVE: React.CSSProperties = {
  ...BUTTON_BASE,
  background: "var(--theme-foreground-focus, #3b82f6)",
  color: "#fff",
  borderColor: "var(--theme-foreground-focus, #3b82f6)",
  fontWeight: 600,
};

const LABELS: Record<View, string> = { npm: "NPM", pypi: "PyPI", combined: "Combined" };

const AiSdkDownloads = ({ data }: Props) => {
  const chartRef = React.useRef<HTMLDivElement>(null);
  const [view, setView] = React.useState<View>("combined");

  React.useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    let records: ParsedRecord[];
    let title: string;

    if (view === "npm") {
      records = parse(data.npm);
      title = "NPM — weekly downloads";
    } else if (view === "pypi") {
      records = parse(data.pypi);
      title = "PyPI — monthly downloads";
    } else {
      records = buildCombined(data.npm, data.pypi);
      title = "Combined NPM + PyPI — monthly downloads";
    }

    const plot = makeChart(el, records, title);
    el.innerHTML = "";
    el.appendChild(plot);
  }, [data, view]);

  return (
    <div>
      <div style={{ marginBottom: "1.2rem" }}>
        {(Object.keys(LABELS) as View[]).map((v) => (
          <button key={v} onClick={() => setView(v)} style={view === v ? BUTTON_ACTIVE : BUTTON_BASE}>
            {LABELS[v]}
          </button>
        ))}
      </div>
      <div ref={chartRef} />
    </div>
  );
};

export const GitHubStars = ({ data }: Props) => {
  const chartRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    const el = chartRef.current;
    if (!el) return;

    const plot = Plot.plot({
      title: "GitHub Stars — official SDKs",
      width: el.offsetWidth,
      height: 250,
      marginLeft: 80,
      style: { fontSize: "14px" },
      x: { label: "Stars", grid: true, tickFormat: (d: number) => `${(d / 1e3).toFixed(0)}k` },
      y: { label: null, domain: ["OpenAI", "Anthropic", "Google", "Mistral", "Groq"] },
      color: { legend: true, domain: ["Python", "JavaScript"] },
      marks: [
        Plot.barX(data.github, {
          x: "stars",
          y: "provider",
          fill: "language",
          rx: 8,
        }),
        Plot.tip(data.github, Plot.pointerY({
          x: "stars",
          y: "provider",
          title: (d: GitHubRecord) => `${d.provider} (${d.language})\n${d.stars.toLocaleString()} stars`,
        })),
      ],
    });

    el.innerHTML = "";
    el.appendChild(plot);
  }, [data]);

  return <div ref={chartRef} />;
};

export default AiSdkDownloads;
