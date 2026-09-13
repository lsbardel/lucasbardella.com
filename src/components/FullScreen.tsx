import * as React from "react";

/**
 * Wraps a demo so it can be expanded to fill the screen.
 *
 * The lab canvases read `el.offsetWidth` / `el.offsetHeight` once inside their
 * `useEffect` and size a canvas from it, and none of them list those dimensions
 * as dependencies. Resizing the box on its own therefore leaves the canvas at
 * its old pixel size, so this component remounts its children whenever the
 * fullscreen state flips, which re-runs the effect against the new box.
 *
 * Children are a render prop because the size a demo should take differs
 * between the two states. Inline it keeps its own aspect ratio; full screen it
 * should match the viewport, so `aspectRatio` is handed down as the padding-top
 * percentage those components already accept.
 */

/** Vendor prefixed members Safari still needs, typed rather than cast away. */
type FullScreenElement = HTMLDivElement & {
  webkitRequestFullscreen?: () => Promise<void> | void;
};

type FullScreenDocument = Document & {
  webkitFullscreenElement?: Element | null;
  webkitExitFullscreen?: () => Promise<void> | void;
};

export interface FullScreenState {
  isFullScreen: boolean;
  /**
   * Viewport aspect as a padding-top percentage while full screen, and
   * undefined otherwise so the child falls back to its own default.
   */
  aspectRatio?: string;
}

interface Props {
  children: (state: FullScreenState) => React.ReactNode;
  /** Accessible name for the button, for pages with more than one demo. */
  label?: string;
}

const current = (): Element | null => {
  const doc = document as FullScreenDocument;
  return doc.fullscreenElement ?? doc.webkitFullscreenElement ?? null;
};

const FullScreen = ({ children, label = "visualisation" }: Props) => {
  const ref = React.useRef<HTMLDivElement>(null);
  const [isFullScreen, setIsFullScreen] = React.useState(false);
  const [aspectRatio, setAspectRatio] = React.useState<string>();
  // The API is missing on iOS Safari for non-video elements, so the button is
  // only rendered once support is confirmed on the client.
  const [supported, setSupported] = React.useState(false);

  React.useEffect(() => {
    const el = ref.current as FullScreenElement | null;
    if (!el) return;
    setSupported(Boolean(el.requestFullscreen ?? el.webkitRequestFullscreen));

    const measure = () =>
      setAspectRatio(`${((window.innerHeight / window.innerWidth) * 100).toFixed(3)}%`);

    // Fires for the button and for Escape alike, so it is the only place the
    // state is set. Nothing here assumes the change was ours.
    const onChange = () => {
      const active = current() === el;
      setIsFullScreen(active);
      if (active) measure();
      else setAspectRatio(undefined);
    };

    document.addEventListener("fullscreenchange", onChange);
    document.addEventListener("webkitfullscreenchange", onChange);
    window.addEventListener("resize", measure);
    return () => {
      document.removeEventListener("fullscreenchange", onChange);
      document.removeEventListener("webkitfullscreenchange", onChange);
      window.removeEventListener("resize", measure);
    };
  }, []);

  const toggle = () => {
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

  const style = isFullScreen
    ? { background: "var(--background)", width: "100vw", height: "100vh" }
    : undefined;

  return (
    <div ref={ref} className="relative" style={style}>
      {supported && (
        <button
          type="button"
          onClick={toggle}
          title={isFullScreen ? "Exit full screen" : "Full screen"}
          aria-label={`${isFullScreen ? "Exit full screen" : "Show full screen"}: ${label}`}
          aria-pressed={isFullScreen}
          className="absolute top-2 right-2 z-20 p-1.5 rounded border border-[var(--foreground-fainter)] bg-[var(--surface)] text-[var(--foreground-faint)] cursor-pointer opacity-60 hover:opacity-100"
        >
          <FullScreenIcon exit={isFullScreen} />
        </button>
      )}
      {/* The key is the remount that makes the canvases re-measure. */}
      <div key={isFullScreen ? "full" : "inline"}>
        {children({ isFullScreen, aspectRatio })}
      </div>
    </div>
  );
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
