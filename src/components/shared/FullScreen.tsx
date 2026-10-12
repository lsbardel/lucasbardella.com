import * as React from "react";

/**
 * Wraps a demo so it can be expanded to fill the screen.
 *
 * The demo keeps its own proportions. A screen is wider than any of these
 * plots, so filling it edge to edge would reshape the drawing rather than
 * enlarge it, which is the opposite of what a full screen view is for. Instead
 * the content is capped at the largest width whose natural height still fits,
 * and centred, so it grows as much as the screen allows and no more.
 *
 * That is why `ratio` is asked for rather than measured. Measuring the child
 * would catch the controls stacked above it inline, which do not sit in the
 * flow once they float over the plot, so the number would be wrong in exactly
 * the state it matters.
 *
 * The lab canvases read `el.offsetWidth` / `el.offsetHeight` once inside their
 * `useEffect` and size a canvas from it, and none of them list those
 * dimensions as dependencies. Resizing the box on its own therefore leaves the
 * canvas at its old pixel size, so children are remounted whenever the fitted
 * width changes, which re-runs the effect against the new box.
 */

/** Vendor prefixed members Safari still needs, typed rather than cast away. */
type FullScreenElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullScreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

interface Props {
  children: (state: { isFullScreen: boolean }) => React.ReactNode;
  /**
   * Height divided by width of the wrapped demo, matching the `aspectRatio`
   * it renders with: 0.7 for the 70% cylinder, 0.69 for the Mandelbrot set.
   */
  ratio: number;
  /** Accessible name for the button, for pages with more than one demo. */
  label?: string;
}

const current = (): Element | null => {
  const doc = document as FullScreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
};

const FullScreen = ({ children, ratio, label = "visualisation" }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  /** Fitted content width in pixels while full screen, and 0 inline. */
  const [width, setWidth] = React.useState(0);
  // The API is missing on iOS Safari for non-video elements, so the button is
  // only rendered once support is confirmed on the client.
  const [supported, setSupported] = React.useState(false);
  // The observer fires in both states and needs to know which it is in without
  // being torn down and rebuilt on every change.
  const active = React.useRef(false);

  React.useEffect(() => {
    const el = ref.current as FullScreenElement | null;
    if (!el) return;
    setSupported(Boolean(el.requestFullscreen ?? el.webkitRequestFullscreen));

    const fit = () => {
      const box = el.getBoundingClientRect();
      // The larger of the two constraints wins: a tall screen runs out of
      // width first, a wide one runs out of height.
      setWidth(Math.round(Math.min(box.width, box.height / ratio)));
    };

    // Inline, this element's height comes from its children, so measuring it
    // and feeding a width back would be a loop. Only full screen, where the box
    // is the screen and nothing inside can change it, is tracked.
    const observer = new ResizeObserver(() => {
      if (active.current) fit();
    });
    observer.observe(el);

    // Fires for the button and for Escape alike, so it is the only place the
    // state is set. Nothing here assumes the change was ours.
    const onChange = () => {
      const now = current() === el;
      active.current = now;
      setIsFullScreen(now);
      if (!now) {
        setWidth(0);
        return;
      }
      // `fullscreenchange` runs before the viewport has finished resizing, so
      // this is measured on the next frame. If that is still the old box the
      // observer corrects it when the resize lands.
      requestAnimationFrame(() => {
        if (active.current) fit();
      });
    };

    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    return () => {
      observer.disconnect();
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
    };
  }, [ratio]);

  const style = isFullScreen
    ? {
        background: "var(--background)",
        width: "100%",
        height: "100%",
        display: "flex" as const,
        alignItems: "center" as const,
        justifyContent: "center" as const,
      }
    : undefined;

  return (
    <div ref={ref} className="relative" style={style}>
      {supported && (
        <button
          type="button"
          onClick={toggleOn(ref)}
          title={isFullScreen ? "Exit full screen" : "Full screen"}
          aria-label={`${isFullScreen ? "Exit full screen" : "Show full screen"}: ${label}`}
          aria-pressed={isFullScreen}
          className="absolute top-2 right-2 z-20 p-1.5 rounded border border-[var(--foreground-fainter)] bg-[var(--surface)] text-[var(--foreground-faint)] cursor-pointer opacity-60 hover:opacity-100"
        >
          <FullScreenIcon exit={isFullScreen} />
        </button>
      )}
      {/* Keyed on the fitted width: the remount is what makes a canvas
          re-measure, so it has to happen on the resize, not just the toggle. */}
      <div key={width > 0 ? `full-${width}` : "inline"} style={width > 0 ? { width } : undefined}>
        {children({ isFullScreen })}
      </div>
    </div>
  );
};

/** Enter or leave, whichever this element is not already in. */
const toggleOn = (ref: React.RefObject<HTMLDivElement | null>) => () => {
  const el = ref.current as FullScreenElement | null;
  if (!el) return;
  const doc = document as FullScreenDocument;
  const request = el.requestFullscreen ?? el.webkitRequestFullscreen;
  const exit = doc.exitFullscreen ?? doc.webkitExitFullscreen;
  // Both can reject, on a permissions policy or a gesture the browser did not
  // accept. The state is driven by the event, so a rejection just means the
  // demo stays as it is.
  const result = current() === el ? exit?.call(doc) : request?.call(el);
  if (result instanceof Promise) result.catch(() => undefined);
};

/** Corner brackets, pointing out to expand and in to collapse. */
const FullScreenIcon = ({ exit }: { exit: boolean }) => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 16 16"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    aria-hidden="true"
  >
    {exit ? (
      <path d="M6.5 2v4.5H2M9.5 2v4.5H14M6.5 14V9.5H2M9.5 14V9.5H14" />
    ) : (
      <path d="M2 6V2h4M14 6V2h-4M2 10v4h4M14 10v4h-4" />
    )}
  </svg>
);

export default FullScreen;
