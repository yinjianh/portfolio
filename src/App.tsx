import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { AboutMe, Testimonials } from "./components/AboutMe";
import { HighlightedWork } from "./components/HighlightedWork";
import { Thoughts } from "./components/Thoughts";
import { ThemeProvider } from "./contexts/ThemeContext";
import { Admin } from "./components/Admin";
import { ThemeSelector } from "./components/ThemeSelector";

const GAP = 12;
const showTestimonials = true;
const DESKTOP_MEDIA_QUERY = "(min-width: 768px)";

// Column min-widths — based on 20/20/40/20 at ~1200px viewport
const COL = { about: 400, work: 860, thoughts: 400, testimonials: 520 };

type Tab = "home" | "work" | "thoughts" | "testimonials";

const TABS: { id: Tab; label: string }[] = [
  { id: "home", label: "About" },
  { id: "work", label: "Work" },
  { id: "thoughts", label: "Design with AI" },
  { id: "testimonials", label: "Testimonials" },
];

function NavTabs({
  activeTab,
  onSelect,
  interactive = true,
  tabs = TABS,
}: {
  activeTab?: Tab;
  onSelect?: (tab: Tab) => void;
  interactive?: boolean;
  tabs?: { id: Tab; label: string }[];
}) {
  return (
    <div
      className="flex items-center gap-1 p-1 rounded-3xl"
      style={{ background: "hsl(var(--muted))" }}
    >
      {tabs.map(({ id, label }) => {
        const active = activeTab === id;
        return (
          <button
            key={id}
            type="button"
            onClick={() => interactive && onSelect?.(id)}
            disabled={!interactive}
            className="px-3 py-2 rounded-lg text-xs font-medium transition-all leading-none m-0 disabled:cursor-default"
            style={{
              background: active ? "hsl(var(--card))" : "transparent",
              color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
              boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
            }}
          >
            {label}
          </button>
        );
      })}
      <div
        style={{
          width: 1,
          height: 20,
          background: "hsl(var(--border))",
          margin: "0 2px",
          flexShrink: 0,
        }}
      />
      <ThemeSelector />
    </div>
  );
}

function DesktopLayout() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const colHomeRef = useRef<HTMLDivElement>(null);
  const colWorkRef = useRef<HTMLDivElement>(null);
  const colThoughtsRef = useRef<HTMLDivElement>(null);
  const colTestimonialsRef = useRef<HTMLDivElement>(null);
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [hasHorizontalOverflow, setHasHorizontalOverflow] = useState(true);

  useEffect(() => {
    const container = scrollRef.current;
    if (!container) return;

    const updateScrollState = () => {
      const { scrollLeft, scrollWidth, clientWidth } = container;
      const maxScrollLeft = Math.max(0, scrollWidth - clientWidth);

      setHasHorizontalOverflow(maxScrollLeft > 8);

      if (maxScrollLeft <= 8) {
        setActiveTab("home");
        return;
      }

      const paddingLeft = Number.parseFloat(window.getComputedStyle(container).paddingLeft) || 0;
      const viewportStart = scrollLeft + paddingLeft;
      const positions: Array<{ tab: Tab; left: number | undefined }> = [
        { tab: "home", left: colHomeRef.current?.offsetLeft },
        { tab: "work", left: colWorkRef.current?.offsetLeft },
        { tab: "thoughts", left: colThoughtsRef.current?.offsetLeft },
        { tab: "testimonials", left: colTestimonialsRef.current?.offsetLeft },
      ];

      const closest = positions
        .filter((item): item is { tab: Tab; left: number } => typeof item.left === "number")
        .reduce((best, item) => {
          if (!best) return item;
          return Math.abs(item.left - viewportStart) < Math.abs(best.left - viewportStart) ? item : best;
        }, null as { tab: Tab; left: number } | null);

      if (closest) setActiveTab(closest.tab);
    };

    updateScrollState();

    container.addEventListener("scroll", updateScrollState, { passive: true });
    window.addEventListener("resize", updateScrollState);

    return () => {
      container.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, []);

  const scrollToCol = (ref: React.RefObject<HTMLDivElement | null>) => {
    ref.current?.scrollIntoView({ behavior: "smooth", block: "nearest", inline: "start" });
  };

  const handleTab = (tab: Tab) => {
    if (!hasHorizontalOverflow) return;
    setActiveTab(tab);
    if (tab === "home") scrollToCol(colHomeRef);
    if (tab === "work") scrollToCol(colWorkRef);
    if (tab === "thoughts") scrollToCol(colThoughtsRef);
    if (tab === "testimonials") scrollToCol(colTestimonialsRef);
  };

  const scroll = (dir: "left" | "right") => {
    scrollRef.current?.scrollBy({ left: dir === "right" ? 400 : -400, behavior: "smooth" });
  };

  return (
    <div className="h-full flex flex-col" style={{ background: "hsl(var(--canvas))" }}>
      {/* Top bar */}
      <div
        className="flex justify-between flex-shrink-0"
        style={{ padding: "16px 16px" }}
      >
        <NavTabs
          activeTab={hasHorizontalOverflow ? activeTab : "home"}
          onSelect={handleTab}
          interactive={hasHorizontalOverflow}
          tabs={hasHorizontalOverflow ? TABS : [{ id: "home", label: "Home" }]}
        />

        {hasHorizontalOverflow && (
          <div className="flex items-center gap-3">
            <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>Scroll → to see more</span>
            <div className="flex gap-1">
              {(["left", "right"] as const).map((dir) => (
                <button
                  key={dir}
                  onClick={() => scroll(dir)}
                  className="flex items-center justify-center rounded-lg transition-colors"
                  style={{
                    width: 32, height: 32,
                    border: "1px solid hsl(var(--border))",
                    background: "hsl(var(--card))",
                    color: "hsl(var(--foreground))",
                  }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
                  onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--card))")}
                >
                  {dir === "left" ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Scrollable columns */}
      <div
        ref={scrollRef}
        className="flex-1 flex overflow-x-auto overflow-y-hidden scrollbar-hide"
        style={{ gap: GAP, padding: GAP, paddingTop: 0, paddingBottom: 16 }}
      >
        {/* Col 1: About Me */}
        <div
          ref={colHomeRef}
          className="h-full flex flex-col"
          style={{ flex: `0 0 ${COL.about}px`, width: COL.about, minWidth: COL.about }}
        >
          <div style={{ flex: 1, minHeight: 0 }}><AboutMe /></div>
        </div>

        {/* Col 2: Highlighted Work */}
        <div ref={colWorkRef} className="h-full flex-shrink-0" style={{ width: COL.work }}>
          <HighlightedWork />
        </div>

        {/* Col 3: Thoughts */}
        <div
          ref={colThoughtsRef}
          className="h-full flex-shrink-0"
          style={{ width: COL.thoughts, minWidth: COL.thoughts }}
        >
          <Thoughts />
        </div>

        {/* Col 4: Testimonials */}
        {showTestimonials && (
          <div
            ref={colTestimonialsRef}
            className="h-full flex-shrink-0"
            style={{ width: COL.testimonials, minWidth: COL.testimonials }}
          >
            <Testimonials />
          </div>
        )}

      </div>
    </div>
  );
}

function MobileLayout() {
  const [activeTab, setActiveTab] = useState<Tab>("home");
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const updateScrollState = () => setIsScrolled(window.scrollY > 0);

    updateScrollState();
    window.addEventListener("scroll", updateScrollState, { passive: true });

    return () => window.removeEventListener("scroll", updateScrollState);
  }, []);

  const handleTab = (tab: Tab) => {
    setActiveTab(tab);
    const idMap: Record<Tab, string> = {
      home: "mobile-about",
      work: "mobile-work",
      thoughts: "mobile-thoughts",
      testimonials: "mobile-testimonials",
    };
    document.getElementById(idMap[tab])?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div style={{ background: "hsl(var(--canvas))" }}>
      {/* Sticky nav */}
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 50,
          background: "hsl(var(--canvas))",
          borderBottom: isScrolled ? "1px solid hsl(var(--border))" : "1px solid transparent",
          padding: "16px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <NavTabs activeTab={activeTab} onSelect={handleTab} />
      </div>

      {/* Sections */}
      <div className="flex flex-col" style={{ gap: GAP, padding: `0 ${GAP}px ${GAP}px` }}>
        <div id="mobile-about">
          <AboutMe />
        </div>
        <div id="mobile-work">
          <HighlightedWork />
        </div>
        <div id="mobile-thoughts">
          <Thoughts />
        </div>
        {showTestimonials && (
          <div id="mobile-testimonials">
            <Testimonials />
          </div>
        )}
      </div>
    </div>
  );
}

const isAdmin = window.location.pathname === '/admin';

function useIsDesktopLayout() {
  const [isDesktop, setIsDesktop] = useState(() => window.matchMedia(DESKTOP_MEDIA_QUERY).matches);

  useEffect(() => {
    const mediaQuery = window.matchMedia(DESKTOP_MEDIA_QUERY);
    const updateLayout = (event?: MediaQueryListEvent) => {
      setIsDesktop(event ? event.matches : mediaQuery.matches);
    };

    updateLayout();
    mediaQuery.addEventListener("change", updateLayout);

    return () => mediaQuery.removeEventListener("change", updateLayout);
  }, []);

  return isDesktop;
}

function PortfolioApp() {
  const isDesktopLayout = useIsDesktopLayout();

  return (
    <ThemeProvider>
      <div className="w-full h-full">
        {isDesktopLayout ? <DesktopLayout /> : <MobileLayout />}
      </div>
    </ThemeProvider>
  );
}

export default function App() {
  if (isAdmin) return <Admin />;

  return <PortfolioApp />;
}
