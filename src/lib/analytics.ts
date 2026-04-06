declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: (...args: unknown[]) => void;
    __portfolioAnalyticsClicksBound?: boolean;
  }
}

type AnalyticsParams = Record<string, string | number | boolean | undefined>;

const measurementId = import.meta.env.VITE_GA_MEASUREMENT_ID?.trim();

function isEnabled() {
  return Boolean(measurementId);
}

export function trackEvent(eventName: string, params: AnalyticsParams = {}) {
  if (!isEnabled() || typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}

export function initAnalytics() {
  if (!isEnabled() || typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  if (!document.querySelector(`script[data-ga-id="${measurementId}"]`)) {
    const script = document.createElement("script");
    script.async = true;
    script.src = `https://www.googletagmanager.com/gtag/js?id=${measurementId}`;
    script.dataset.gaId = measurementId;
    document.head.appendChild(script);
  }

  window.dataLayer = window.dataLayer || [];
  window.gtag =
    window.gtag ||
    function gtag(...args: unknown[]) {
      window.dataLayer.push(args);
    };

  window.gtag("js", new Date());
  window.gtag("config", measurementId, { send_page_view: true });

  if (window.__portfolioAnalyticsClicksBound) return;
  window.__portfolioAnalyticsClicksBound = true;

  document.addEventListener("click", (event) => {
    const target = event.target;
    if (!(target instanceof Element)) return;

    const tracked = target.closest<HTMLElement>("[data-analytics-event]");
    if (!tracked) return;

    const href = tracked instanceof HTMLAnchorElement ? tracked.href : tracked.dataset.analyticsUrl;

    trackEvent(tracked.dataset.analyticsEvent || "click", {
      ui_location: tracked.dataset.analyticsLocation,
      label: tracked.dataset.analyticsLabel,
      link_url: href,
      text: tracked.dataset.analyticsText || tracked.textContent?.trim().slice(0, 120),
    });
  });
}
