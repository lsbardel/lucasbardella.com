import * as React from "react";

// Anthropic's funding as a two level Mermaid chart. The overview shows only who
// is connected to Anthropic; clicking a company renders the chart of its deals
// underneath. Every figure here is sourced in the post that uses the component.

type Detail = "amazon" | "google" | "microsoft" | "amd" | "akamai";

interface DetailChart {
  title: string;
  source: string;
}

// Overview node id to the detail chart it opens. Microsoft and Nvidia signed
// one joint deal with Anthropic, so both open the same chart.
const NODES: Record<string, Detail> = {
  AMZ: "amazon",
  GOO: "google",
  MSF: "microsoft",
  NVD: "microsoft",
  AMD: "amd",
  AKM: "akamai",
};

// Solid arrows are money or equity into Anthropic, thick arrows are Anthropic's
// compute commitments, dotted arrows are conditional money or gains on the stake.
const DETAILS: Record<Detail, DetailChart> = {
  amazon: {
    title: "Amazon and AWS",
    source: `flowchart TB
    AMZ[Amazon / AWS]
    ANT((Anthropic))
    AMZ -->|"$8B convertible notes<br/>2023 to 2025"| ANT
    AMZ -->|"$5B Series G and $5B Series H<br/>nonvoting preferred stock"| ANT
    AMZ -.->|"financing facility, opens as<br/>AWS delivers compute"| ANT
    ANT ==>|"over $100B over ten years<br/>Trainium, up to 5 GW"| AMZ
    ANT -.->|"$62.8B of gains<br/>first half of 2026"| AMZ`,
  },
  google: {
    title: "Google and Broadcom",
    source: `flowchart TB
    AVG[Broadcom]
    GOO[Google / Google Cloud]
    ANT((Anthropic))
    AVG -->|"builds TPUs"| GOO
    GOO -->|"up to $2B convertible note<br/>2023"| ANT
    GOO -->|"up to $40B in cash and compute<br/>2026"| ANT
    ANT ==>|"up to one million TPUs<br/>2025"| GOO
    ANT ==>|"multiple GW of TPUs<br/>from 2027"| AVG`,
  },
  microsoft: {
    title: "Microsoft and Nvidia",
    source: `flowchart TB
    MSF[Microsoft / Azure]
    NVD[Nvidia]
    ANT((Anthropic))
    MSF -->|"up to $5B"| ANT
    NVD -->|"up to $10B"| ANT
    ANT ==>|"$30B of Azure compute"| MSF
    ANT ==>|"up to 1 GW of<br/>Nvidia systems"| NVD
    MSF -->|"GPU purchases"| NVD`,
  },
  amd: {
    title: "AMD",
    source: `flowchart TB
    AMD[AMD]
    ANT((Anthropic))
    AMD -.->|"up to $5B of equity<br/>committed for the future"| ANT
    ANT ==>|"up to 2 GW of MI450<br/>from 2027"| AMD`,
  },
  akamai: {
    title: "Akamai",
    source: `flowchart TB
    AKM[Akamai]
    ANT((Anthropic))
    AKM -->|"warrant for about 5%<br/>of Akamai stock"| ANT
    ANT ==>|"$11.6B over seven years"| AKM`,
  },
};

// Links into Anthropic place a company above it, links out of it below, which
// keeps the overview to three companies a row.
const overview = (selected: Detail | null): string => {
  const lines = [
    "flowchart TB",
    "    AMZ[Amazon / AWS]",
    "    GOO[Google / Google Cloud]",
    "    MSF[Microsoft / Azure]",
    "    NVD[Nvidia]",
    "    AMD[AMD]",
    "    AKM[Akamai]",
    "    ANT((Anthropic))",
    "    AMZ <==> ANT",
    "    GOO <==> ANT",
    "    AMD <==> ANT",
    "    ANT <==> MSF",
    "    ANT <==> NVD",
    "    ANT <==> AKM",
    "    classDef company cursor:pointer",
    "    classDef selected cursor:pointer,stroke-width:3px",
  ];
  for (const [id, detail] of Object.entries(NODES)) {
    lines.push(`    class ${id} ${detail === selected ? "selected" : "company"}`);
  }
  return lines.join("\n");
};

type Mermaid = typeof import("mermaid").default;

let mermaidModule: Promise<Mermaid> | null = null;
let renderCount = 0;

// The same theme choice as the layout script that renders the markdown diagrams.
const loadMermaid = (): Promise<Mermaid> => {
  if (!mermaidModule) {
    mermaidModule = import("mermaid").then(({ default: mermaid }) => {
      const root = document.documentElement;
      const dark = root.dataset.theme
        ? root.dataset.theme === "dark"
        : window.matchMedia("(prefers-color-scheme: dark)").matches;
      mermaid.initialize({ startOnLoad: false, look: "classic", theme: dark ? "dark" : "neutral" });
      return mermaid;
    });
  }
  return mermaidModule;
};

interface ChartProps {
  source: string;
  onNodeClick?: (nodeId: string) => void;
}

const MermaidChart = ({ source, onNodeClick }: ChartProps) => {
  const ref = React.useRef<HTMLElement>(null);

  React.useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let cancelled = false;
    const listeners: Array<[Element, () => void]> = [];

    loadMermaid().then(async (mermaid) => {
      const id = `funding-graph-${++renderCount}`;
      const { svg } = await mermaid.render(id, source);
      if (cancelled) return;
      el.innerHTML = svg;
      if (!onNodeClick) return;
      // Mermaid names each node `<render id>-flowchart-<node id>-<n>`.
      for (const node of el.querySelectorAll("g.node")) {
        const match = node.id.match(/-flowchart-(.+)-\d+$/);
        if (!match) continue;
        const handler = () => onNodeClick(match[1]);
        node.addEventListener("click", handler);
        listeners.push([node, handler]);
      }
    });

    return () => {
      cancelled = true;
      for (const [node, handler] of listeners) node.removeEventListener("click", handler);
    };
  }, [source, onNodeClick]);

  return <figure ref={ref} className="mermaid" />;
};

const FundingGraph = () => {
  const [selected, setSelected] = React.useState<Detail | null>(null);

  // Clicking a company opens its chart, clicking it again or Anthropic closes it.
  const onNodeClick = React.useCallback((nodeId: string) => {
    const detail = NODES[nodeId] ?? null;
    setSelected((current) => (detail === current ? null : detail));
  }, []);

  const chart = selected ? DETAILS[selected] : null;

  return (
    <div>
      <MermaidChart source={overview(selected)} onNodeClick={onNodeClick} />
      {chart ? (
        <div>
          <p>
            <strong>{chart.title}</strong>{" "}
            <button
              type="button"
              onClick={() => setSelected(null)}
              className="ml-2 px-3 py-1 rounded border border-[var(--foreground-fainter)] bg-[var(--surface)] cursor-pointer"
            >
              Close
            </button>
          </p>
          <MermaidChart source={chart.source} />
        </div>
      ) : (
        <p className="description">Click a company to see its deals with Anthropic.</p>
      )}
    </div>
  );
};

export default FundingGraph;
