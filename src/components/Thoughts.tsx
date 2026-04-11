import { useState, useEffect, useRef, useCallback } from "react";
import { adminThoughts } from "../data/admin-thoughts";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { trackEvent } from "../lib/analytics";

const THOUGHT_PANEL_SUPPRESS_KEY = "__thoughtPanelSuppressOpenUntil";
const THOUGHT_PANEL_MIN_WIDTH = 380;
const THOUGHT_PANEL_MAX_WIDTH = 1080;

function getDefaultThoughtPanelWidth(viewportWidth: number) {
  if (viewportWidth < 768) return viewportWidth;
  if (viewportWidth >= 1800) {
    return Math.min(1040, Math.max(820, Math.round(viewportWidth * 0.5)));
  }
  if (viewportWidth >= 1600) {
    return Math.min(920, Math.max(720, Math.round(viewportWidth * 0.46)));
  }
  if (viewportWidth >= 1440) {
    return Math.min(920, Math.max(740, Math.round(viewportWidth * 0.48)));
  }
  if (viewportWidth >= 1280) {
    return Math.min(820, Math.max(700, Math.round(viewportWidth * 0.46)));
  }
  return Math.min(720, Math.max(560, Math.round(viewportWidth * 0.4)));
}

function getThoughtContentMaxWidth(panelWidth: number) {
  if (panelWidth >= 980) return 780;
  if (panelWidth >= 860) return 680;
  if (panelWidth >= 720) return 620;
  return 544;
}

// Returns 'screen' for dark thumbnail backgrounds, 'multiply' for light ones
function logoBlendForBg(hex?: string): "screen" | "multiply" {
  if (!hex) return "multiply";
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  const luminance = (r * 299 + g * 587 + b * 114) / 1000;
  return luminance < 128 ? "screen" : "multiply";
}

interface Thought {
  id: number;
  date: string;
  title: string;
  body: string;
  tags: string[];
  logos?: string[];
  thumbBg?: string;
  image: string | null;
  fullContent?: string;
  contentType?: 'markdown' | 'html';
  heroImage?: string;
  thumbnailPosition?: string;
  hideHeroInPanel?: boolean;
  cardLayout?: "stacked" | "side";
  link?: { label: string; source?: string; url: string };
  group?: "building" | "design";
  openExternally?: boolean;
}

type ThoughtGroup = NonNullable<Thought["group"]>;

export const hardcodedThoughts: Thought[] = [
  {
    id: 1,
    date: "Mar 2026",
    title: "How I use Claude to keep my Obsidian vault actually useful",
    body: "I've tried every note-taking system. The problem was never the tool — it was that organizing notes takes as much energy as taking them. Claude Work changed that for me.",
    tags: ["Productivity", "AI"],
    logos: ["/claude-logo.png", "https://www.google.com/s2/favicons?sz=64&domain=obsidian.md"],
    thumbBg: "#F0EFED",
    image: null,
    fullContent: `My notes lived everywhere. Each tool had a different reason. Apple Notes for quick captures. Google Docs for cloud storage. Notion for work, since it supports multiple formats. Obsidian for simple markdown, since it's cleaner and more flexible.

Two problems came from this. First, no centralized place. I kept forgetting where I put things. Second, I couldn't generate any insights because everything was too scattered to organize.

Then I found Claude Cowork. I used it to organize my computer files and folders and found it very useful. So I thought: what if I tried something similar with my notes?

I tested it first with Apple Notes and Google Docs. Both hit a wall. The platform controls your files, so Claude can't edit or move them around. There's only a limited set of things it can do.

Obsidian is different. It's just plain markdown files on your computer. You control them. That means Claude can actually edit and manipulate them.

**What I can do now that I couldn't before:**

- Describe a goal in plain language, and Claude creates the file structure
- Say "make it simpler" and five planning docs become one
- Iterate by just talking, not dragging and dropping

For my quarterly planning, I used to create five different versions and slowly abandon each one. Instead, I described my goals to Claude. It created the files. I said I wanted it simpler. It merged everything into one clean file in seconds.

I wasn't managing files anymore. I was just describing what I wanted.`,
  },
  {
    id: 2,
    date: "Feb 2026",
    title: "What I learned shipping my first PR with Cursor",
    body: "The first real thing I shipped with Cursor was a loading state for an AI agent. It sounds small. But going from idea to merged PR solo taught me more about AI-assisted dev than any tutorial.",
    tags: ["Cursor", "Engineering"],
    logos: ["https://www.google.com/s2/favicons?sz=64&domain=cursor.sh"],
    thumbBg: "#E8ECF2",
    image: null,
    heroImage: "/uploads/cursor-first-pr-hero.png",
    thumbnailPosition: "center 12%",
    hideHeroInPanel: true,
    fullContent: `The first real thing I shipped with Cursor was a loading state for an AI agent. It sounds small. But going from idea to merged PR solo taught me more about AI-assisted development than any tutorial.

Before Cursor, I'd avoid touching unfamiliar parts of the codebase. Too much context to hold in my head, too easy to break something subtle. Cursor removed that anxiety. I could ask questions about the code inline, get explanations without leaving my editor, and iterate on implementations without the usual back-and-forth with documentation.

The loading state PR specifically: I needed to handle async agent states in a way that felt responsive without being noisy. Cursor helped me understand the existing patterns in the codebase, suggested an approach that fit the architecture, and caught a race condition I would have missed.

The bigger lesson wasn't about the code. It was about confidence. AI-assisted development doesn't make you a better engineer overnight — but it makes the gap between "I could probably do this" and "I actually did this" much smaller.`,
  },
  {
    id: 3,
    date: "Jan 2026",
    title: "Vibe-coded a demo that felt already shipped",
    body: "We needed to validate a complex workflow before a single line of production code was written. Figma Make let us build something that felt real enough to actually test.",
    tags: ["Figma", "Design"],
    logos: ["https://www.google.com/s2/favicons?sz=64&domain=figma.com"],
    thumbBg: "#F0F0FF",
    image: null,
    heroImage: "/uploads/figma-make-hero.png",
    hideHeroInPanel: true,
    fullContent: `We needed to validate a complex workflow before a single line of production code was written. Figma Make let us build something that felt real enough to actually test.

The project had a hard deadline — engineering would start implementation in two months and we couldn't afford to discover fundamental UX problems mid-build. The traditional approach would have been high-fidelity Figma prototypes. But for this workflow, static prototypes weren't enough. Users needed to actually move through multi-step processes with real-feeling state.

Figma Make filled that gap. We built a functional demo environment — not production-ready, but close enough that users forgot they were in a prototype. We ran sessions, uncovered three significant flow problems, and redesigned before engineering ever got involved.

The ROI was obvious in retrospect. Two months of design iteration is dramatically cheaper than two months of engineering rework. But the bigger insight was about confidence: when engineering started, they were implementing something that had already been stress-tested. No surprises.`,
  },
  {
    id: 4,
    date: "Dec 2025",
    title: "Using Lovable to explore 10 versions in an afternoon",
    body: "The bottleneck in early product design isn't ideas — it's the cost of making ideas visible. Lovable collapses that cost so much that my entire process changed.",
    tags: ["Prototyping", "AI"],
    logos: ["https://www.google.com/s2/favicons?sz=64&domain=lovable.dev"],
    thumbBg: "#FFF1F2",
    image: null,
    fullContent: `The bottleneck in early product design isn't ideas — it's the cost of making ideas visible. Lovable collapses that cost so much that my entire process changed.

Before, prototyping meant committing to a direction early. You'd pick the idea that seemed most promising and build it out, because building took time. You'd show one version in a review and iterate from there.

Now I explore many. In a single afternoon I can spin up multiple distinct versions of an idea — different layouts, different interaction models, different visual directions — and put real links in front of people. Not static screens. Actual working interfaces they can click through.

The quality of feedback changes completely when people can interact with something. They stop reacting to how it looks and start reacting to how it feels. That's a much more honest signal.

I plan to share some of these explorations here — the versions that didn't make it, the surprising pivots, and what the comparison taught me. The messy middle of design process is where the real learning happens.`,
  },
  {
    id: 5,
    group: "design" as const,
    date: "Jul 2024",
    title: "Conversational UI",
    body: "I wrote this after spending months designing an HR AI assistant. The hardest part wasn't the AI. It was helping users form questions they didn't know how to ask.",
    tags: ["UI", "AI"],
    logos: ["https://www.google.com/s2/favicons?sz=64&domain=smashingmagazine.com"],
    thumbBg: "#F2DDD9",
    image: null,
    heroImage: "/uploads/conversational-ui-hero.png",
    cardLayout: "stacked",
    openExternally: true,
    link: {
      label: "How to Design Effective Conversational AI Experiences: A Guide",
      source: "Smashing Magazine",
      url: "https://www.smashingmagazine.com/2024/07/how-design-effective-conversational-ai-experiences-guide/",
    },
    fullContent: `I spent months designing an HR AI assistant. Users needed to ask questions about complex HR data: policies, benefits, compliance. Watching them struggle taught me more about conversational AI design than any framework.

The hardest part wasn't the AI. It was everything around it. How do you help someone ask a question they can't quite articulate? How do you show results that build trust? What happens when users want to refine but don't know where to start?

That experience led me to write this piece for Smashing Magazine. The article breaks the experience into three phases.

**Query formulation.** Users struggle to express what they want. Good design helps them get there through suggested prompts and guided inputs, without overwhelming them.

**Results exploration.** How you present answers matters as much as the answers themselves. Format, citations, and the ability to adjust tone all affect whether the output feels useful.

**Re-formulation.** The most overlooked phase. What helps users refine instead of giving up? Transparency, showing sources and reasoning, is what makes a system feel trustworthy rather than opaque.

Each phase has its own failure modes, and most AI products only design for one of them. The full article goes deeper into each with specific patterns. Worth reading if you're designing anything in this space.`,
  },
  {
    id: 6,
    group: "design" as const,
    date: "May 2024",
    title: "5 UX patterns for better generative AI search",
    body: "Chat-based search is great for simple questions. But when queries get complex, users struggle — not because the AI is bad, but because they don't know how to ask. I wrote about five patterns that help close that gap.",
    tags: ["UX", "Patterns"],
    logos: ["https://www.google.com/s2/favicons?sz=64&domain=medium.com"],
    thumbBg: "#E8E5E1",
    image: null,
    heroImage: "/uploads/medium-ux-patterns-hero.png",
    thumbnailPosition: "center 18%",
    cardLayout: "stacked",
    openExternally: true,
    link: {
      label: "5 UX Patterns for Better Generative AI Search",
      source: "Medium",
      url: "https://medium.com/design-bootcamp/5-ux-patterns-for-better-generative-ai-search-6fecb37142a1",
    },
    fullContent: `Chat-based search is great for simple questions. But when queries get complex, users struggle — not because the AI is bad, but because they don't know how to ask well enough.

The core problem: users often don't include enough detail in their prompts. They're not sure what context to add, so they stay broad, and the results feel generic. This isn't a model problem — it's a design problem.

I looked at how leading GenAI products are addressing this and found five recurring patterns worth paying attention to.

Scoped search narrows the use case upfront, setting clear expectations for what the system can and can't do. Contextual suggestions surface relevant prompt additions in the moment, without requiring users to learn anything in advance. Guided prompt templates give structure when the task is specific — writing, image generation, research — and make the system's capabilities visible.

Prompt refinement recommendations go a step further: instead of waiting for a bad result, the interface actively helps users rephrase or add detail before they submit.

The fifth pattern is about continuity — helping users build on previous queries rather than starting from scratch each time.

The design space here is still wide open. These patterns are early signals, not settled conventions. That's what makes it interesting.`,
  },
];

const monthOrder: Record<string, number> = {
  Jan: 1, Feb: 2, Mar: 3, Apr: 4, May: 5, Jun: 6,
  Jul: 7, Aug: 8, Sep: 9, Oct: 10, Nov: 11, Dec: 12,
};
function parseDateValue(dateStr: string): number {
  const [month, year] = dateStr.split(" ");
  return parseInt(year) * 100 + (monthOrder[month] || 0);
}

const hardcodedThoughtById = new Map(hardcodedThoughts.map((thought) => [thought.id, thought]));
const mergedAdminThoughts = (adminThoughts as unknown as Partial<Thought>[]).map((thought) => ({
  ...hardcodedThoughtById.get(thought.id ?? -1),
  ...thought,
})) as Thought[];
const adminIds = new Set(mergedAdminThoughts.map((thought) => thought.id));
const hiddenThoughtIds = new Set<number>([1]);
const thoughts: Thought[] = [
  ...mergedAdminThoughts.filter((thought) => !hiddenThoughtIds.has(thought.id)),
  ...hardcodedThoughts.filter(t => !adminIds.has(t.id) && !hiddenThoughtIds.has(t.id)),
].sort((a, b) => parseDateValue(b.date) - parseDateValue(a.date));

const THOUGHT_TABS: Array<{ id: ThoughtGroup; label: string }> = [
  { id: "building", label: "Design with AI" },
  { id: "design", label: "Design thinking" },
];

function thoughtOpensExternally(thought: Thought): boolean {
  return Boolean(thought.openExternally && thought.link?.url);
}

// ── Demo content parser ──────────────────────────────────────────────────────

type ContentSegment = { type: 'html'; content: string } | { type: 'demo'; url: string };

function parseContentSegments(html: string): ContentSegment[] {
  const segments: ContentSegment[] = [];
  const pat = /<div[^>]*class="demo-card"[^>]*data-demo-url="([^"]*)"[^>]*>\s*<\/div>/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;
  while ((match = pat.exec(html)) !== null) {
    if (match.index > lastIndex) segments.push({ type: 'html', content: html.slice(lastIndex, match.index) });
    segments.push({ type: 'demo', url: match[1] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < html.length) segments.push({ type: 'html', content: html.slice(lastIndex) });
  return segments.length > 0 ? segments : [{ type: 'html', content: html }];
}

function getThoughtThumbnailSrc(thought: Thought): string | null {
  if (thought.heroImage) return thought.heroImage;
  if (thought.image) return thought.image;
  if (thought.contentType === "html" && thought.fullContent) {
    const match = thought.fullContent.match(/<img[^>]+src="([^"]+)"/i);
    if (match?.[1]) return match[1];
  }
  return null;
}

function ThoughtListThumbnail({ thought, variant = "side" }: { thought: Thought; variant?: "side" | "stacked" }) {
  const src = getThoughtThumbnailSrc(thought);
  const isStacked = variant === "stacked";

  return (
    <div
      className={`${src ? "" : "article-thumb-muted "}${isStacked ? "" : "flex-shrink-0 "}overflow-hidden flex items-center justify-center gap-2`}
      style={{
        width: isStacked ? "100%" : 124,
        aspectRatio: isStacked ? "2.25 / 1" : "4 / 3",
        background: isStacked && src ? "transparent" : (thought.thumbBg || "hsl(var(--muted))"),
        border: isStacked ? "none" : "1px solid hsl(var(--border))",
        borderRadius: isStacked ? 2 : 12,
      }}
    >
      {src ? (
        <img
          src={src}
          alt=""
          className={`${isStacked ? "article-thumb-muted " : ""}w-full h-full object-cover transition-transform duration-300 ease-out group-hover/article:scale-[1.05] group-focus-within/article:scale-[1.05]`}
          style={{ objectPosition: thought.thumbnailPosition ?? "center" }}
        />
      ) : thought.logos?.length ? (
        <div className="flex items-center justify-center gap-2 px-3">
          {thought.logos.slice(0, 2).map((logo, index) => (
            <img
              key={index}
              src={logo}
              alt=""
              className="w-8 h-8 object-contain rounded-[8px]"
              style={{ mixBlendMode: logoBlendForBg(thought.thumbBg) }}
            />
          ))}
        </div>
      ) : null}
    </div>
  );
}

// ── Side Panel ──────────────────────────────────────────────────────────────

function ThumbRail({ allThoughts, activeId, onSelect }: { allThoughts: Thought[]; activeId: number; onSelect: (t: Thought) => void }) {
  const [tooltip, setTooltip] = useState<{ thought: Thought; x: number; y: number } | null>(null);

  return (
    <>
      <div
        className="flex-shrink-0 flex flex-col items-start gap-2 overflow-y-auto scrollbar-hide py-5 pl-3 pr-2"
        style={{ width: 72, borderRight: "1px solid hsl(var(--border))" }}
      >
        {allThoughts.map((t) => {
          const isActive = t.id === activeId;
          return (
            <button
              key={t.id}
              onClick={() => onSelect(t)}
              onMouseEnter={(e) => {
                const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
                setTooltip({ thought: t, x: rect.right + 10, y: rect.top });
              }}
              onMouseLeave={() => setTooltip(null)}
              className="flex-shrink-0 rounded-[8px] overflow-hidden flex items-center justify-center gap-1 transition-all duration-200"
              style={{
                width: 48,
                height: 48,
                background: t.thumbBg || "hsl(var(--muted))",
                outline: isActive ? "2px solid hsl(var(--foreground))" : "2px solid transparent",
                outlineOffset: 2,
                opacity: isActive ? 1 : 0.45,
              }}
            >
              {t.logos
                ? t.logos.slice(0, 1).map((src, i) => (
                    <img key={i} src={src} alt="" className="w-6 h-6 object-contain rounded-[4px]" style={{ mixBlendMode: logoBlendForBg(t.thumbBg) }} />
                  ))
                : t.image
                ? <img src={t.image} alt="" className="w-full h-full object-cover" />
                : null}
            </button>
          );
        })}
      </div>

      {/* Rich tooltip */}
      {tooltip && createPortal(
        <div
          className="fixed pointer-events-none z-[200]"
          style={{ left: tooltip.x, top: tooltip.y }}
        >
          <motion.div
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.12 }}
            className="rounded-xl px-3 py-2.5 shadow-lg"
            style={{
              background: "hsl(var(--foreground))",
              color: "hsl(var(--background))",
              maxWidth: 220,
              boxShadow: "0 4px 20px rgba(0,0,0,0.18)",
            }}
          >
            <p className="text-xs font-semibold leading-snug mb-1">{tooltip.thought.title}</p>
            <p className="text-[10px] opacity-50 mb-1">{tooltip.thought.date}</p>
            <p className="text-[11px] leading-relaxed opacity-70 line-clamp-2">{tooltip.thought.body}</p>
          </motion.div>
        </div>,
        document.body
      )}
    </>
  );
}

function ThoughtPanel({
  thought,
  allThoughts,
  onClose,
  onSelect,
}: {
  thought: Thought | null;
  allThoughts: Thought[];
  onClose: () => void;
  onSelect: (t: Thought) => void;
}) {
  const [panelWidth, setPanelWidth] = useState(() => getDefaultThoughtPanelWidth(window.innerWidth));
  const [demoUrl, setDemoUrl] = useState<string | null>(null);
  const isDragging = useRef(false);
  const hasManualResize = useRef(false);
  const startX = useRef(0);
  const startWidth = useRef(0);
  const contentRef = useRef<HTMLDivElement>(null);
  const contentMaxWidth = getThoughtContentMaxWidth(panelWidth);

  useEffect(() => {
    if (thought) contentRef.current?.scrollTo({ top: 0 });
    setDemoUrl(null);
  }, [thought?.id]);

  const onDragStart = useCallback((e: React.MouseEvent) => {
    isDragging.current = true;
    hasManualResize.current = true;
    startX.current = e.clientX;
    startWidth.current = panelWidth;
    document.body.style.cursor = "ew-resize";
    document.body.style.userSelect = "none";
  }, [panelWidth]);

  useEffect(() => {
    const onResize = () => {
      setPanelWidth((currentWidth) => {
        if (window.innerWidth < 768) return window.innerWidth;
        if (!hasManualResize.current) return getDefaultThoughtPanelWidth(window.innerWidth);
        return Math.min(THOUGHT_PANEL_MAX_WIDTH, Math.max(THOUGHT_PANEL_MIN_WIDTH, currentWidth));
      });
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!isDragging.current) return;
      const delta = startX.current - e.clientX;
      const next = Math.min(THOUGHT_PANEL_MAX_WIDTH, Math.max(THOUGHT_PANEL_MIN_WIDTH, startWidth.current + delta));
      setPanelWidth(next);
    };
    const onUp = () => {
      isDragging.current = false;
      document.body.style.cursor = "";
      document.body.style.userSelect = "";
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  const renderInline = (text: string) => {
    const parts = text.split(/(\*\*[^*]+\*\*|\*[^*]+\*)/g);
    return parts.map((part, j) => {
      if (part.startsWith("**") && part.endsWith("**"))
        return <strong key={j}>{part.slice(2, -2)}</strong>;
      if (part.startsWith("*") && part.endsWith("*"))
        return <em key={j}>{part.slice(1, -1)}</em>;
      return part;
    });
  };

  const panel = createPortal(
    <AnimatePresence>
      {thought && (
      <div
        key="thought-panel"
        className="fixed inset-0 z-50 flex justify-end"
      >
        {/* Backdrop */}
        <motion.div
          className="absolute inset-0"
          style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          onPointerDown={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onClose();
          }}
        />

        {/* Panel — left thumbnail rail + right content */}
        <motion.div
          className="relative z-10 h-full flex"
          style={{
            width: `min(${panelWidth}px, 100vw)`,
            background: "hsl(var(--card))",
            borderLeft: "1px solid hsl(var(--border))",
          }}
          initial={{ x: "100%" }}
          animate={{ x: 0, transition: { type: "spring", damping: 30, stiffness: 300 } }}
          exit={{ x: "100%", transition: { duration: 0.18, ease: "easeIn" } }}
        >
          {/* Drag handle */}
          <div
            onMouseDown={onDragStart}
            className="absolute left-0 top-0 h-full z-20 group"
            style={{ width: 8, cursor: "ew-resize" }}
          >
            <div
              className="absolute left-[3px] top-0 h-full w-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-150 rounded-full"
              style={{ background: "hsl(var(--foreground) / 0.2)" }}
            />
          </div>

          {/* Left: thumbnail navigation rail */}
          <ThumbRail allThoughts={allThoughts} activeId={thought.id} onSelect={onSelect} />

          {/* Right: article content */}
          <div ref={contentRef} className="flex-1 h-full overflow-y-auto scrollbar-hide flex flex-col" style={{ padding: 32 }}>
            {/* Close button */}
            <button
              onClick={onClose}
              className="absolute top-5 right-5 z-30 flex items-center justify-center rounded-lg transition-colors"
              style={{
                width: 32, height: 32,
                border: "1px solid hsl(var(--border))",
                background: "hsl(var(--card) / 0.92)",
                color: "hsl(var(--foreground) / 0.75)",
                boxShadow: "0 6px 18px rgba(0,0,0,0.12)",
                backdropFilter: "blur(10px)",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--card))")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--card) / 0.92)")}
            >
              <X size={14} />
            </button>

            {/* Hero image — full-bleed with gradient overlay, title + date baked in */}
            {thought.heroImage && !thought.hideHeroInPanel ? (
              <div
                className="flex-shrink-0 relative overflow-hidden"
                style={{
                  margin: "-32px -32px 28px -32px",
                  height: 260,
                }}
              >
                <img
                  src={thought.heroImage}
                  alt=""
                  className="w-full h-full object-cover"
                />
                {/* gradient overlay */}
                <div
                  className="absolute inset-0"
                  style={{
                    background: "linear-gradient(to bottom, transparent 30%, rgba(0,0,0,0.72) 100%)",
                  }}
                />
                {/* text on top of gradient */}
                <div className="absolute bottom-0 left-0 right-0" style={{ padding: "20px 28px 22px" }}>
                  <span className="block text-xs mb-1.5" style={{ color: "rgba(255,255,255,0.6)" }}>
                    {thought.date}
                  </span>
                  <h2
                    className="font-display leading-snug"
                    style={{ fontSize: "1.35rem", fontWeight: 700, color: "#fff", margin: 0 }}
                  >
                    {thought.title}
                  </h2>
                </div>
              </div>
            ) : (
              <div style={{ maxWidth: contentMaxWidth, width: "100%", margin: "0 auto" }}>
                {/* Date */}
                <span className="text-xs mb-3 block" style={{ color: "hsl(var(--muted-foreground))" }}>
                  {thought.date}
                </span>
                {/* Title */}
                <h2
                  className="font-display leading-snug mb-4"
                  style={{ fontSize: "1.4rem", fontWeight: 700, color: "hsl(var(--foreground))" }}
                >
                  {thought.title}
                </h2>
              </div>
            )}

            {/* Constrained reading width — source link + body */}
            <div style={{ maxWidth: contentMaxWidth, width: "100%", margin: "0 auto" }}>
            {/* Source link */}
            {thought.link && (
              <a
                href={thought.link.url}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-2 mb-6 transition-opacity hover:opacity-60"
                style={{ textDecoration: "none" }}
              >
                {thought.link.source && (
                  <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                    Published on {thought.link.source}
                  </span>
                )}
                <span className="text-xs" style={{ color: "hsl(var(--border))" }}>·</span>
                <span className="text-xs" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Read full article ↗
                </span>
              </a>
            )}

            {/* Body */}
            <div className="flex flex-col gap-3 flex-1">
              {thought.contentType === 'html' ? (
                <>
                  {parseContentSegments(thought.fullContent ?? thought.body).map((seg, si) =>
                    seg.type === 'demo' ? (
                      <div
                        key={si}
                        className="relative rounded-xl overflow-hidden my-4 cursor-pointer group"
                        onClick={() => setDemoUrl(seg.url)}
                      >
                        <img src="/Plays.png" alt="Interactive Demo" className="w-full block" />
                        <div
                          className="absolute inset-0 flex items-center justify-center transition-colors"
                          style={{ background: "rgba(0,0,0,0.18)" }}
                          onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.28)")}
                          onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.18)")}
                        >
                          <span
                            className="pointer-events-none flex items-center gap-2"
                            style={{
                              padding: "9px 20px",
                              fontSize: 13,
                              fontWeight: 600,
                              color: "#5a3e00",
                              background: "#fef3c7",
                              border: "1.5px solid #f59e0b",
                              borderRadius: 999,
                              letterSpacing: "0.01em",
                              boxShadow: "0 2px 0 #f59e0b",
                            }}
                          >
                            Try Interactive Demo
                          </span>
                        </div>
                      </div>
                    ) : (
                      <div
                        key={si}
                        className="[&_p]:mb-3 [&_p:last-child]:mb-0 [&_figure]:my-8 [&_figure_img]:rounded-[8px] [&_figure_img]:w-full [&_figure_img]:border [&_figure_img]:border-black/[0.08] [&_figcaption]:text-center [&_figcaption]:text-xs [&_figcaption]:mt-2 [&_figcaption]:italic [&_figcaption]:opacity-60 [&_figcaption:empty]:hidden"
                        style={{ fontSize: "0.875rem", color: "hsl(var(--foreground))", lineHeight: 1.75 }}
                        dangerouslySetInnerHTML={{ __html: seg.content }}
                      />
                    )
                  )}
                </>
              ) : (
                (thought.fullContent || thought.body).split("\n\n").map((para, i) => {
                  const lines = para.split("\n");
                  const isList = lines.every(l => l.trimStart().startsWith("- "));

                  if (isList) {
                    return (
                      <ul key={i} className="flex flex-col gap-1 pl-4 list-disc" style={{ fontSize: "0.875rem", color: "hsl(var(--foreground))" }}>
                        {lines.map((l, j) => (
                          <li key={j}>{renderInline(l.replace(/^- /, ""))}</li>
                        ))}
                      </ul>
                    );
                  }

                  return (
                    <p key={i} className="leading-relaxed" style={{ fontSize: "0.875rem", color: "hsl(var(--foreground))" }}>
                      {renderInline(para)}
                    </p>
                  );
                })
              )}
            </div>
            </div>{/* end constrained reading width */}
          </div>
        </motion.div>
      </div>
      )}
    </AnimatePresence>,
    document.body
  );

  return (
    <>
      {panel}
      {demoUrl && createPortal(
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)", padding: "40px 32px" }}
          onClick={() => setDemoUrl(null)}
        >
          <div
            className="relative w-full flex flex-col"
            style={{ maxWidth: "min(1280px, 92vw)" }}
            onClick={e => e.stopPropagation()}
          >
            <button
              onClick={() => setDemoUrl(null)}
              className="self-end mb-3 text-xs font-medium transition-opacity hover:opacity-60"
              style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}
            >
              ✕ Close
            </button>
            <div style={{ width: "100%", height: "80vh" }}>
              <iframe
                src={demoUrl}
                style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
                allowFullScreen
              />
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────

export function Thoughts() {
  const [selected, setSelected] = useState<Thought | null>(null);
  const [activeGroup, setActiveGroup] = useState<ThoughtGroup>("building");
  const [blockList, setBlockList] = useState(false);
  const suppressOpenUntilRef = useRef(0);
  const thoughtGroups: Record<ThoughtGroup, Thought[]> = {
    building: thoughts.filter((thought) => thought.group !== "design"),
    design: thoughts.filter((thought) => thought.group === "design"),
  };
  const panelThoughtGroups: Record<ThoughtGroup, Thought[]> = {
    building: thoughtGroups.building.filter((thought) => !thoughtOpensExternally(thought)),
    design: thoughtGroups.design.filter((thought) => !thoughtOpensExternally(thought)),
  };
  const visibleThoughts = thoughtGroups[activeGroup];
  const panelThoughts = selected
    ? panelThoughtGroups[selected.group === "design" ? "design" : "building"]
    : panelThoughtGroups[activeGroup];
  const availableTabs = THOUGHT_TABS.filter((tab) => thoughtGroups[tab.id].length > 0);

  const selectThought = useCallback((thought: Thought) => {
    setActiveGroup(thought.group === "design" ? "design" : "building");
    if (thoughtOpensExternally(thought)) {
      trackEvent("thought_opened_external", {
        thought_title: thought.title,
        ui_location: "thoughts_list",
        link_url: thought.link?.url,
      });
      window.open(thought.link?.url, "_blank", "noopener,noreferrer");
      return;
    }
    trackEvent("thought_opened", {
      thought_title: thought.title,
      ui_location: "thoughts_list",
      group: thought.group,
    });
    setSelected(thought);
  }, []);

  const handleClose = useCallback(() => {
    const suppressUntil = Date.now() + 450;
    suppressOpenUntilRef.current = suppressUntil;
    (window as Window & { [THOUGHT_PANEL_SUPPRESS_KEY]?: number })[THOUGHT_PANEL_SUPPRESS_KEY] = suppressUntil;
    setBlockList(true);
    setSelected(null);
    setTimeout(() => setBlockList(false), 400);
  }, []);

  useEffect(() => {
    const handler = (e: Event) => {
      if (Date.now() < suppressOpenUntilRef.current) return;
      const id = (e as CustomEvent<{ id: number }>).detail.id;
      const t = thoughts.find(th => th.id === id);
      if (t) selectThought(t);
    };
    window.addEventListener('open-thought', handler);
    return () => window.removeEventListener('open-thought', handler);
  }, [selectThought]);

  return (
    <>
      <div className="bento-block h-full flex flex-col">
        <div
          className="mb-5 flex-shrink-0"
          style={{ paddingLeft: 10, paddingRight: 10, marginLeft: -10, marginRight: -10 }}
        >
          <div
            className="flex items-center gap-5 border-b"
            style={{ borderColor: "hsl(var(--border))" }}
          >
            {availableTabs.map((tab) => {
              const isActive = activeGroup === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => {
                    trackEvent("thought_group_selected", {
                      group: tab.id,
                      ui_location: "thoughts_tabs",
                    });
                    setActiveGroup(tab.id);
                  }}
                  className="border-b px-0 pb-3 text-[0.82rem] font-medium transition-colors"
                  style={{
                    color: isActive ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                    borderColor: isActive ? "hsl(var(--foreground) / 0.22)" : "transparent",
                    marginBottom: -1,
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex-1 overflow-y-auto scrollbar-hide min-h-0" style={{ paddingLeft: 10, paddingRight: 10, marginLeft: -10, marginRight: -10 }}>
          {(() => {
            const renderItem = (thought: Thought, index: number, items: Thought[]) => {
              const isStacked = thought.cardLayout === "stacked" || thought.group === "building";

              return (
                <div key={thought.id}>
                  <div
                    className={`${isStacked ? "flex flex-col gap-2.5" : "flex items-start gap-4"} cursor-pointer group/article`}
                    onClick={() => selectThought(thought)}
                    style={{ margin: "0 -10px", padding: "6px 10px" }}
                  >
                    {isStacked ? <ThoughtListThumbnail thought={thought} variant="stacked" /> : null}

                    <div className="min-w-0 flex-1">
                      <span className="text-xs block mb-1" style={{ color: "hsl(var(--muted-foreground))" }}>
                        {thought.date}
                      </span>
                      <h3
                        className="font-medium font-display leading-snug mb-1.5 line-clamp-2 group-hover/article:underline group-focus-within/article:underline underline-offset-2"
                        style={{ fontSize: "0.875rem", color: "hsl(var(--foreground))" }}
                      >
                        {thought.title}
                      </h3>
                      <p
                        className={`text-xs leading-relaxed ${isStacked ? "line-clamp-1" : "line-clamp-3"}`}
                        style={{ color: "hsl(var(--muted-foreground))" }}
                      >
                        {thought.body}
                      </p>
                    </div>
                    {!isStacked ? <ThoughtListThumbnail thought={thought} /> : null}
                  </div>

                  {index < items.length - 1 && (
                    <div className="mt-5 border-t border-dashed" style={{ borderColor: "hsl(var(--border))" }} />
                  )}
                </div>
              );
            };

            return (
              <div className="flex flex-col pb-4" style={{ pointerEvents: selected || blockList ? "none" : "auto" }}>
                <div className="flex flex-col gap-5">
                  {visibleThoughts.map((thought, index) => renderItem(thought, index, visibleThoughts))}
                </div>
              </div>
            );
          })()}
        </div>
      </div>

      {/* Side panel — always mounted so portal AnimatePresence can play exit animation */}
      <ThoughtPanel
        thought={selected}
        allThoughts={panelThoughts}
        onClose={handleClose}
        onSelect={selectThought}
      />
    </>
  );
}
