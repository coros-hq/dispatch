import { Joyride, STATUS } from "react-joyride";
import type { TooltipRenderProps, Step } from "react-joyride";
import { useState, useEffect } from "react";
import { ArrowRight, ArrowLeft } from "lucide-react";

const TOUR_KEY = "mailshot-tour-complete";

const steps: Step[] = [
  {
    target: '[data-tour="infinite-canvas"]',
    content:
      "Let's take a quick tour to get you started building beautiful newsletters.",
    title: "Welcome to MailShot ✉",
    placement: "center" as const,
    skipBeacon: true,
    hideOverlay: true,
  },
  {
    target: '[data-tour="block-panel"]',
    content:
      "Add a section first — full width, two or three columns. Then drag blocks like Text, Image and Button into your columns.",
    title: "Sections & Blocks",
    placement: "right" as const,
    skipBeacon: true,
  },
  {
    target: '[data-tour="infinite-canvas"]',
    content:
      "Click a variant frame to select it before editing. Switch newsletter pages using the Pages bar at the very bottom.",
    title: "Infinite Canvas",
    placement: "center" as const,
    skipBeacon: true,
    hideOverlay: true,
  },
  {
    target: '[data-tour="variant-tabs"]',
    content:
      "Each page can hold multiple A/B variants shown side by side. Rename or add variants here.",
    title: "Variants (A/B)",
    placement: "top" as const,
    skipBeacon: true,
  },
  {
    target: '[data-tour="page-tabs"]',
    content:
      "Each project can include multiple pages (e.g. cover, articles, CTA). Switch pages here, double-click to rename, or use + to add another.",
    title: "Pages in your project",
    placement: "top" as const,
    skipBeacon: true,
  },
  {
    target: '[data-tour="add-canvas"]',
    content:
      "Add another variant from the zoom bar. New newsletter pages are added from the Pages row below.",
    title: "Add a variant",
    placement: "top" as const,
    skipBeacon: true,
  },
  {
    target: '[data-tour="toolbar-save"]',
    content:
      "Save your project with Cmd+S or the Save button. Work auto-saves every 30 seconds.",
    title: "Save Your Work",
    placement: "bottom" as const,
    skipBeacon: true,
  },
  //   {
  //     target: '[data-tour="right-panel"]',
  //     content:
  //       "Edit block properties, view live React Email code, and check compatibility across Gmail, Outlook and Apple Mail.",
  //     title: "Properties & Compatibility",
  //     placement: "left" as const,
  //     skipBeacon: true,
  //   },
];

function CustomTooltip({
  backProps,
  index,
  isLastStep,
  primaryProps,
  size,
  skipProps,
  step,
  tooltipProps,
}: TooltipRenderProps) {
  return (
    <div
      {...tooltipProps}
      style={{
        backgroundColor: "#1a1a1a",
        border: "1px solid #2a2a2a",
        borderRadius: 16,
        boxShadow: "0 24px 48px rgba(0,0,0,0.6)",
        padding: 24,
        maxWidth: 360,
        width: 360,
        animation: "tourFadeIn 0.25s ease",
        position: "relative",
        zIndex: 10001,
      }}
    >
      {/* Progress dots */}
      <div style={{ display: "flex", gap: 4, marginBottom: 16 }}>
        {Array.from({ length: size }).map((_, i) => (
          <div
            key={i}
            style={{
              width: i === index ? 20 : 6,
              height: 6,
              borderRadius: 99,
              backgroundColor: i === index ? "#ffffff" : "#333333",
              transition: "all 0.3s ease",
            }}
          />
        ))}
      </div>

      {step.title && (
        <h3
          style={{
            margin: "0 0 8px",
            fontSize: 16,
            fontWeight: 600,
            color: "#ffffff",
          }}
        >
          {step.title as string}
        </h3>
      )}

      <p
        style={{
          margin: "0 0 20px",
          fontSize: 13,
          lineHeight: 1.6,
          color: "#888888",
        }}
      >
        {step.content as string}
      </p>

      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <button
          {...skipProps}
          style={{
            background: "none",
            border: "none",
            fontSize: 12,
            color: "#666666",
            cursor: "pointer",
            padding: 0,
          }}
        >
          Skip tour
        </button>
        <div style={{ display: "flex", gap: 8 }}>
          {index > 0 && (
            <button
              {...backProps}
              style={{
                background: "none",
                border: "1px solid #333333",
                borderRadius: 8,
                color: "#ffffff",
                cursor: "pointer",
                padding: "6px 12px",
                fontSize: 13,
                display: "flex",
                alignItems: "center",
                gap: 4,
              }}
            >
              <ArrowLeft size={13} /> Back
            </button>
          )}
          <button
            {...primaryProps}
            style={{
              backgroundColor: "#ffffff",
              border: "none",
              borderRadius: 8,
              color: "#000000",
              cursor: "pointer",
              padding: "6px 16px",
              fontSize: 13,
              fontWeight: 500,
              display: "flex",
              alignItems: "center",
              gap: 4,
            }}
          >
            {isLastStep ? (
              "Done"
            ) : (
              <>
                <span>Next</span> <ArrowRight size={13} />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Tour() {
  const [run, setRun] = useState(false);

  useEffect(() => {
    const done = localStorage.getItem(TOUR_KEY);
    if (!done) setTimeout(() => setRun(true), 1000);

    const style = document.createElement("style");
    style.textContent = `
      @keyframes tourFadeIn {
        from { opacity: 0; transform: translateY(8px) scale(0.97); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
    `;
    document.head.appendChild(style);
    return () => {
      document.head.removeChild(style);
    };
  }, []);

  //   useEffect(() => {
  //     const done = localStorage.getItem(TOUR_KEY);
  //     console.log("tour done:", done);
  //     if (!done) {
  //       console.log("starting tour...");
  //       setTimeout(() => {
  //         console.log("setting run to true");
  //         setRun(true);
  //       }, 1000);
  //     }
  //   }, []);

  return (
    <Joyride
      steps={steps}
      run={run}
      continuous
      scrollToFirstStep
      tooltipComponent={CustomTooltip}
      floatingOptions={{
        middleware: [],
      }}
      //   portalElement="#root"
      onEvent={(data) => {
        if ([STATUS.FINISHED, STATUS.SKIPPED].includes(data.status as any)) {
          localStorage.setItem(TOUR_KEY, "true");
          setRun(false);
        }
      }}
      options={{
        zIndex: 9999,
        overlayColor: "rgba(0,0,0,0.6)",
        spotlightRadius: 12,
      }}
    />
  );
}
