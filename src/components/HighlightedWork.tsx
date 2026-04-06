import { useState, useEffect, useRef } from "react";
import { adminCaseStudies } from "../data/admin-case-studies";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";

// ── Data ──────────────────────────────────────────────────────────────────────

export interface CaseStudy {
  id: number;
  title: string;
  company?: string;
  timeline?: string;
  description: string;
  tags: string[];
  heroMedia?: string;
  heroBg?: string;
  heroFit?: "cover" | "contain";
  heroPosition?: string;
  heroPaddingX?: number;
  heroRadius?: number;
  iframeDemo?: string;
  fullContent?: string;
  deleted?: boolean;
}

export const hardcodedCaseStudies: CaseStudy[] = [
  {
    id: 0,
    title: "Nooks AI Platform",
    company: "Nooks",
    timeline: "2025–2026",
    description: "Lead designer for the AI platform. I took it from early concept to shipped product, defined the design direction, shaped the interaction model, and partnered closely with engineering to deliver across the entire system.",
    tags: ["AI", "0→1", "Product Design"],
    heroMedia: "/Nooks.png?v=3",
    heroBg: "#C8C3BB",
    fullContent: `Nooks is an AI-powered sales platform that helps teams prospect, engage, and close deals faster. As the product scaled, AI evolved from a feature into the core layer underlying nearly every workflow.

**The challenge**
How do you build an AI platform that feels tailored in every context, while remaining consistent enough that users can understand and control it, and engineers can scale it without rebuilding each time?

**What I focused on**
1. Defining how AI shows up across contexts
2. Establishing a clear mental model for AI
3. Designing ownership and configuration at scale
4. Maintaining user control in long-running AI workflows

**Impact**
This work established the foundation for Nooks' AI platform — transforming AI from a set of fragmented features into a coherent, scalable system. It enabled faster feature development, improved usability across workflows, and created a consistent mental model that both users and engineers could build on.

**Shipped**
· Global Assistant: supports research, prospecting, email generation, and plan mode. High adoption across the team.
· Plays: full end-to-end automation for creating campaigns, including research, prospecting, email, and trigger-based sequencing. High adoption.
· Signals: LLM researched signals to identify account and prospect intent.
· Agent Emails: personalized individual and bulk email generation. 50% of all emails sent through Nooks are now AI-generated.
· AI Activity Summary in Dialer: compact call digest that surfaces what matters without interrupting rep flow. 80% of reps check the summary on every call.`,
  },
  {
    id: 1,
    title: "Nooks Plays",
    company: "Nooks",
    timeline: "2025",
    description: "Led the 0→1 design of Nooks Plays — a workflow automation builder that let sales teams automate any repeatable process. Built the interactive demo two months before engineering shipped it.",
    tags: ["0→1", "Automation", "AI", "B2B"],
    heroMedia: "/Plays-Cover.png",
    heroBg: "#E8EDF5",
    heroFit: "contain",
    heroPosition: "center",
    heroPaddingX: 16,
    heroRadius: 10,
    iframeDemo: "https://plays.nooks.in/",
    fullContent: `Lead designer · 2025 · Team: PM, 2 engineers

**The Problem**
Sales teams had repeatable workflows they wanted to automate inside Nooks: researching accounts, sending outreach, following up on signals. But there was no way to do it. Every rep was doing the same work manually, over and over.

**Outcome**
Built the product from zero to one. Multiple enterprise companies adopted it shortly after launch. Plays also became the foundational infrastructure for other parts of the product: the global assistant and other automation features now reuse the same underlying system. If anyone at Nooks wants to automate something, Plays is the layer they build on.

**What I Did**
**1. Led the design from zero to one**: defined the end-to-end interaction model for the workflow builder, from how users create and configure nodes to how they understand what the automation is doing at each step.
**2. Built an interactive demo two months before engineering shipped**: used Figma Make to prototype the full Plays experience so we could demo it to enterprise customers while the product was still being built.
**3. Ongoing design as we scale**: continued iterating on the product as more customers onboarded, refining the builder, testing flow, and run history based on real usage.

**Shipped**
· Workflow builder: a node-based canvas where users assemble a play from different node types, including triggers, AI research steps, email actions, and conditional logic, each with its own configuration panel
· Testing flow: users can select specific accounts and contacts to run a live test of the play, seeing exactly how each node executes and what output it produces before activating it for real
· Run history: a full log of every play execution, with per-item results showing what happened at each step for each individual record, used by reps to review outcomes and by the team for internal reporting and debugging`,
  },
  {
    id: 2,
    title: "Praisidio AI Assistant",
    company: "Praisidio",
    timeline: "2023–2025",
    description: "As founding designer, I led the company pivot from traditional HR analytics to an AI platform, drove activation from 10% to 90%, and scaled the product to enterprise.",
    tags: ["0→1", "LLM", "AI SaaS", "B2B"],
    heroMedia: "https://cdn.prod.website-files.com/5ec6f4fa68c9b0c447d860d8/67182cd19bb291058823b1d9_Demo.gif",
    heroBg: "#C8C3BB",
    fullContent: `Sole designer · Mar 2023 – Mar 2025 · Team: CEO, CTO, 3 engineers

**The Problem**
Praisidio's original product was a traditional employee retention tool. The market was moving toward AI fast. The product had no clear differentiation and the company was at risk of becoming irrelevant.

**Outcome**
Activation from 10% to 90%. Enterprise customers grew 10×. Average user saves one week of work per month. G2 rating 4.9 out of 5.

**What I Did**
**1. Led the company pivot** — facilitated a week-long workshop generating 200+ insights. A prototype generated interest from 50+ clients within one week and secured new funding.
**2. Found product-market fit** — talked to 100+ target users across 25+ interviews. Synthesized research into 6 themes that shaped the MVP. Reached product-market fit within one year.
**3. Drove AI adoption from 10% to 90%** — three design interventions over 8 months targeting trust, data control, and trainability.
**4. Scaled to enterprise** — permission controls, view-based dashboards, team collaboration, and org-wide settings. Enterprise customers grew 10×. Accounts expanded 4× within existing customers.

**Shipped**
· AI Assistant: natural language queries with instant structured outputs, charts, and tables
· Progressive Explanations: on-demand calculation breakdowns, reducing explanation time by 80%
· Dynamic Exclusion Filters: real-time data scope adjustment within queries, reducing rework by 20%
· Prompt Training: custom term definitions and structured feedback loops, eliminating 40+ hrs/week of manual engineering corrections
· Collections & Reports: save, share, schedule, and export AI-generated reports
· Role-based Access: granular permissions and compliance controls for enterprise scale`,
  },
  {
    id: 3,
    title: "CRM Dashboard Redesign",
    company: "hireEZ",
    timeline: "Oct 2021 – Mar 2022",
    description: "I redesigned hireEZ's core recruiter dashboard — ran research with 5 users, rebuilt the layout around real workflows, and introduced an AI To-Do system across 6 product teams.",
    tags: ["Redesign", "User Research", "Cross-functional"],
    heroMedia: "https://cdn.prod.website-files.com/5ec6f4fa68c9b0c447d860d8/67df63defb74c739afbab691_New%20dashboard.png",
    heroBg: "#C8C3BB",
    fullContent: `hireEZ's home dashboard was the first thing every recruiter saw — and it was cluttered, confusing, and making the product look worse than it was. Five user interviews revealed information overload, unclear actions, and scattered navigation. I led a 5-month redesign: unified the nav, rebuilt the layout around real workflows, introduced an AI-powered To-do system, and made a strategic CTA call backed by user testing and CEO sign-off.

**What was broken**
New users found the dashboard overwhelming; existing users had learned to ignore it. I ran interviews with 5 recruiters and a broader survey. Three things emerged: too much on screen with no hierarchy, navigation that required too many steps, and daily tasks scattered across the product with no central access point.

**The call I made on the primary CTA**
Five out of five recruiters asked for better search. I didn't make search the primary CTA. HireEZ's search couldn't support the Boolean capabilities users expected. And creating a project unlocked everything downstream — email campaigns, candidate tracking, collaboration. I brought this framing to leadership. We aligned on making 'Create Project' the primary CTA — not because users asked for it, but because it was the path to what they actually needed.

**The To-Do feature — driven across 6 teams**
Recruiters arrived at the dashboard with no sense of what to do next. I proposed an AI-powered To-Do feature to surface personalized next actions. The home dashboard is shared real estate — making this work required coordination across 6 PMs. It shipped and became one of the top 5 most adopted features on the platform.

**Outcome**
· 50% increase in dashboard visits
· 15 min saved per user daily
· AI To-do became a top 5 adopted feature
· Coordinated across 6 PMs with CEO alignment on primary CTA`,
  },
  {
    id: 4,
    title: "Job Marketplace for Visa Seekers",
    company: "AiTou Technology",
    timeline: "2020–2021",
    description: "Sole product designer for a 0→1 job marketplace built for international applicants — surfacing H-1B and OPT sponsor visibility that existing platforms completely ignored.",
    tags: ["0→1", "User Research", "Product Design"],
    heroMedia: "https://cdn.prod.website-files.com/5ec6f4fa68c9b0c447d860d8/6033d43f1429861a80858a6b_Frame%2073.jpg",
    heroBg: "#C8C3BB",
    fullContent: `Sole designer · 2020–2021

**The Problem**
International applicants face an invisible wall in job searching: most platforms do not surface whether a company sponsors H-1B or OPT extensions. That meant users had to dig through descriptions, cross-check multiple sources, and still make decisions with incomplete information.

**Impact**
Led the product from 0 to 1 and launched it in 2021. The product received a 4.6 out of 5.0 user satisfaction score, and the company was selected for the Columbia Startup Lab cohort.

**What I Did**
**1. Built the product from scratch**: took the marketplace from research and concept through usability testing and shipped UI as the sole designer.
**2. Ran research with the target users**: conducted usability testing with 12 international applicants in 30–45 minute sessions. Two key pain points were confirmed: the time cost of hunting sponsorship information and confusion around H-1B vs. OPT eligibility differences.
**3. Turned the job card into a trust signal**: designed the information architecture so every element removed a real step from the applicant's workflow, and iterated on filtering from a buried modal approach to inline filter chips.

**Shipped**
· H-1B and OPT-extension sponsor badges surfaced directly on job cards
· Sponsor history panel inside each posting showing past H-1B filing records
· Curated list view of exclusively sponsored companies
· Dedicated H-1B-only job feed
· Inline filter chips after iterating away from a modal-based filter flow`,
  },
];

// Merge admin edits on top of hardcoded data (admin wins for edited fields)
type AdminCs = CaseStudy & { deleted?: boolean };
const adminCsArr = adminCaseStudies as unknown as AdminCs[];
const adminCsMap = new Map(adminCsArr.map(a => [a.id, a]));
const hardcodedIds = new Set(hardcodedCaseStudies.map(c => c.id));
const CRM_DASHBOARD_OLD_SRC = "https://cdn.prod.website-files.com/5ec6f4fa68c9b0c447d860d8/65f4dd98b018f5d03d3dcfa3_User%20problems-p-2600.png";
const caseStudies: CaseStudy[] = [
  // Hardcoded entries, merged with admin overrides, filtered if deleted
  ...hardcodedCaseStudies
    .filter(hc => !adminCsMap.get(hc.id)?.deleted)
    .map(hc => {
      const admin = adminCsMap.get(hc.id);
      return admin ? { ...hc, ...admin } : hc;
    }),
  // Admin-only entries (not in hardcoded list, not deleted)
  ...adminCsArr.filter(a => !hardcodedIds.has(a.id) && !a.deleted),
];

// ── Plain-text fullContent renderer ───────────────────────────────────────────
// Supports: **heading** alone on a line → bold section title
//           **text** inline → bold
//           · at line start → bullet list
//           blank line → paragraph break

function renderBoldText(text: string) {
  const parts = text.split(/(\*\*[^*]+\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith("**") && part.endsWith("**")) {
      return <strong key={i} style={{ fontWeight: 600 }}>{part.slice(2, -2)}</strong>;
    }
    return part;
  });
}

function renderFullContent(content: string) {
  const lines = content.split("\n");
  const nodes: React.ReactNode[] = [];
  let bulletBuffer: string[] = [];
  let paraBuffer: string[] = [];

  const flushPara = () => {
    if (paraBuffer.length === 0) return;
    nodes.push(
      <p key={nodes.length} className="leading-relaxed" style={{ fontSize: 15, color: "hsl(var(--muted-foreground))", marginBottom: 12 }}>
        {paraBuffer.map((line, i) => <span key={i}>{renderBoldText(line)}{i < paraBuffer.length - 1 && <br />}</span>)}
      </p>
    );
    paraBuffer = [];
  };

  const flushBullets = () => {
    if (bulletBuffer.length === 0) return;
    nodes.push(
      <ul key={nodes.length} style={{ marginBottom: 12, paddingLeft: 0, listStyle: "none" }}>
        {bulletBuffer.map((line, i) => (
          <li key={i} style={{ fontSize: 15, color: "hsl(var(--muted-foreground))", marginBottom: 4, paddingLeft: 16, position: "relative" }}>
            <span style={{ position: "absolute", left: 0 }}>·</span>
            {renderBoldText(line.replace(/^·\s*/, ""))}
          </li>
        ))}
      </ul>
    );
    bulletBuffer = [];
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // Blank line → flush buffers
    if (trimmed === "") {
      flushPara();
      flushBullets();
      continue;
    }

    // Standalone **heading** line → section title
    if (/^\*\*[^*]+\*\*$/.test(trimmed)) {
      flushPara();
      flushBullets();
      nodes.push(
        <p key={nodes.length} className="font-bold" style={{ fontSize: 16, color: "hsl(var(--foreground))", marginBottom: 6, marginTop: nodes.length > 0 ? 16 : 0 }}>
          {trimmed.slice(2, -2)}
        </p>
      );
      continue;
    }

    // Bullet line
    if (trimmed.startsWith("·")) {
      flushPara();
      bulletBuffer.push(trimmed);
      continue;
    }

    // Regular text
    flushBullets();
    paraBuffer.push(trimmed);
  }

  flushPara();
  flushBullets();
  return nodes;
}

function getHeroBackground(cs: CaseStudy, isDark: boolean) {
  if (isDark && cs.title === "Nooks Plays" && cs.heroBg) return cs.heroBg;
  return isDark ? "hsl(var(--muted))" : (cs.heroBg ?? "hsl(var(--muted))");
}

function CaseStudyList({ onSelect }: { onSelect: (cs: CaseStudy) => void }) {
  const displayed = caseStudies.slice(0, 4);
  const [cursor, setCursor] = useState({ x: 0, y: 0, visible: false });
  const { appliedTheme } = useTheme();
  const isDark = appliedTheme === "midnight";
  return (
    <div className="h-full flex flex-col gap-6">
      {cursor.visible && (
        <div
          className="fixed z-[999] pointer-events-none select-none"
          style={{
            left: cursor.x + 14,
            top: cursor.y - 10,
            transform: `rotate(${((cursor.x / (typeof window !== "undefined" ? window.innerWidth : 1440)) - 0.5) * 18}deg)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          <span
            className="text-xs font-medium px-2.5 py-1.5 rounded-full whitespace-nowrap"
            style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))" }}
          >
            Read more
          </span>
        </div>
      )}
      {displayed.map((cs, i) => (
        <motion.div
          key={cs.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08 }}
          whileHover={{ y: -2 }}
          className="group cursor-none flex flex-col md:flex-row"
          style={{
            borderRadius: cs.heroRadius ?? 10,
            background: "hsl(var(--card))",
            border: "1px solid hsl(var(--border))",
            overflow: "hidden",
            isolation: "isolate",
            flexShrink: 0,
          }}
          onClick={() => onSelect(cs)}
          onMouseEnter={(e) => setCursor({ x: e.clientX, y: e.clientY, visible: true })}
          onMouseMove={(e) => setCursor({ x: e.clientX, y: e.clientY, visible: true })}
          onMouseLeave={() => setCursor(c => ({ ...c, visible: false }))}
        >
          <div
            className="overflow-hidden flex-shrink-0 md:w-[60%] md:min-h-[280px]"
            style={{
              aspectRatio: "16/9",
              background: getHeroBackground(cs, isDark),
              borderRadius: cs.heroRadius ?? 10,
            }}
          >
            {cs.heroMedia ? (
              <img
                src={cs.heroMedia}
                alt=""
                className="w-full h-full block transition-transform duration-300 group-hover:scale-[1.025]"
                style={{
                  objectFit: cs.heroFit ?? "cover",
                  objectPosition: cs.heroPosition ?? "center",
                  background: getHeroBackground(cs, isDark),
                  paddingLeft: cs.heroPaddingX ?? 0,
                  paddingRight: cs.heroPaddingX ?? 0,
                  borderRadius: cs.heroRadius ?? 10,
                }}
              />
            ) : (
              <div
                className="transition-transform duration-300 group-hover:scale-[1.025]"
                style={{ background: getHeroBackground(cs, isDark), width: "100%", height: "100%" }}
              />
            )}
          </div>

          <div className="flex flex-col p-4 md:w-[40%] md:p-5 transition-colors duration-200 group-hover:bg-[var(--hover-surface)]">
            <h3
              className="font-bold font-display leading-snug mb-1"
              style={{ fontSize: "1rem", color: "hsl(var(--foreground))" }}
            >
              {cs.title}
            </h3>
            {cs.timeline && (
              <span className="text-xs block mb-2" style={{ color: "hsl(var(--muted-foreground))" }}>
                {cs.timeline}
              </span>
            )}
            <p className="text-sm leading-relaxed line-clamp-3" style={{ color: "hsl(var(--foreground))" }}>
              {cs.description}
            </p>
            <span className="text-xs mt-3" style={{ color: "hsl(var(--muted-foreground))" }}>
              → Read more
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}

// ── Full-screen overlay ────────────────────────────────────────────────────────

function CaseStudyOverlay({ cs, onClose, allCases, onNavigate }: {
  cs: CaseStudy;
  onClose: () => void;
  allCases: CaseStudy[];
  onNavigate: (cs: CaseStudy) => void;
}) {
  const [demoOpen, setDemoOpen] = useState(false);
  const { tagline, rest } = extractTagline(cs.fullContent);
  const bodyRef = useRef<HTMLDivElement>(null);
  const mediaTabs = cs.id === 3 && cs.heroMedia
    ? [
        { id: "new", label: "New", src: cs.heroMedia },
        { id: "old", label: "Old", src: CRM_DASHBOARD_OLD_SRC },
      ]
    : [];
  const [activeMediaTabId, setActiveMediaTabId] = useState(mediaTabs[0]?.id ?? "");

  const idx = allCases.findIndex(c => c.id === cs.id);
  const prev = idx > 0 ? allCases[idx - 1] : null;
  const next = idx < allCases.length - 1 ? allCases[idx + 1] : null;
  const activeMediaTab = mediaTabs.find((tab) => tab.id === activeMediaTabId) ?? mediaTabs[0] ?? null;

  // Reset scroll and demo state when navigating
  useEffect(() => {
    bodyRef.current?.scrollTo(0, 0);
    setDemoOpen(false);
    setActiveMediaTabId(mediaTabs[0]?.id ?? "");
  }, [cs.id]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { demoOpen ? setDemoOpen(false) : onClose(); }
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose, demoOpen]);

  return createPortal(
    <div className="fixed inset-0" style={{ zIndex: 9998 }}>
      {/* Backdrop */}
      <motion.div
        className="absolute inset-0"
        style={{ background: "rgba(0,0,0,0.3)", backdropFilter: "blur(2px)" }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
      />
      {/* Panel */}
      <motion.div
        initial={{ y: "100%" }}
        animate={{ y: 0 }}
        exit={{ y: "100%" }}
        transition={{ type: "spring", damping: 34, stiffness: 300 }}
        className="fixed bottom-0 rounded-t-3xl flex flex-col"
        style={{ top: 72, left: 12, right: 12, zIndex: 9999, overflow: "hidden", background: "hsl(var(--card))", boxShadow: "0 -8px 40px rgba(0,0,0,0.12), 0 0 0 1px hsl(var(--border))" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Sticky header ── */}
        <div
          className="flex-shrink-0 px-6 pt-5 pb-6 md:px-8 md:pt-6"
          style={{ borderBottom: "1px solid hsl(var(--border))" }}
        >
          <div className="flex justify-end items-center gap-2 mb-5">
            {prev && (
              <button
                onClick={() => onNavigate(prev)}
                className="surface-chip flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors max-w-[160px] lg:max-w-none"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--primary))"; (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary))"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--surface-chip-border))"; (e.currentTarget as HTMLElement).style.color = "hsl(var(--surface-chip-fg))"; }}
              >
                <span>←</span>
                <span className="truncate lg:overflow-visible lg:text-clip lg:whitespace-nowrap">{prev.title}</span>
              </button>
            )}
            {next && (
              <button
                onClick={() => onNavigate(next)}
                className="surface-chip flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-full transition-colors max-w-[160px] lg:max-w-none"
                onMouseEnter={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--primary))"; (e.currentTarget as HTMLElement).style.color = "hsl(var(--primary))"; }}
                onMouseLeave={(e) => { (e.currentTarget as HTMLElement).style.borderColor = "hsl(var(--surface-chip-border))"; (e.currentTarget as HTMLElement).style.color = "hsl(var(--surface-chip-fg))"; }}
              >
                <span className="truncate lg:overflow-visible lg:text-clip lg:whitespace-nowrap">{next.title}</span>
                <span>→</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center rounded-full transition-colors flex-shrink-0"
              style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))" }}
              onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--border))")}
              onMouseLeave={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
            >
              <X size={16} />
            </button>
          </div>

          <div className="text-center">
            <h1
              className="font-bold font-display mb-3 leading-tight"
              style={{ fontSize: "2.25rem", color: "hsl(var(--foreground))" }}
            >
              {cs.title}
            </h1>

            {cs.tags && cs.tags.length > 0 && (
              <div className="flex items-center justify-center flex-wrap gap-2 mb-3">
                {cs.tags.map(tag => (
                  <span
                    key={tag}
                    className="surface-chip px-2.5 py-0.5 text-xs font-medium rounded-full"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {tagline ? (
              <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>{tagline}</p>
            ) : (
              <div className="flex items-center justify-center gap-3 text-xs tracking-widest uppercase" style={{ color: "hsl(var(--muted-foreground))" }}>
                {cs.company && <span>{cs.company}</span>}
                {cs.company && cs.timeline && <span>·</span>}
                {cs.timeline && <span>{cs.timeline}</span>}
              </div>
            )}
          </div>
        </div>

        {/* ── Scrollable body ── */}
        <div ref={bodyRef} className="flex-1 overflow-y-auto scrollbar-hide">
          <div className="flex flex-col gap-6 px-6 py-6 pb-16 md:flex-row md:gap-10 md:px-10 md:py-10 md:pb-20">
          {/* Left */}
          {cs.iframeDemo ? (
            <div className="w-full md:flex-1 self-start">
              <div
                className="relative w-full rounded-xl overflow-hidden cursor-pointer group"
                style={{ aspectRatio: "16/9", background: "hsl(var(--muted))" }}
                onClick={() => setDemoOpen(true)}
              >
                <img src={cs.heroMedia} alt="Interactive Demo" className="w-full h-full object-cover absolute inset-0" />
                <div
                  className="absolute inset-0 flex items-center justify-center transition-colors"
                  style={{ background: "rgba(0,0,0,0.18)" }}
                  onMouseEnter={e => (e.currentTarget.style.background = "rgba(0,0,0,0.28)")}
                  onMouseLeave={e => (e.currentTarget.style.background = "rgba(0,0,0,0.18)")}
                >
                  <span
                    className="pointer-events-none"
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
                    Try Interactive Demo (Coded with AI)
                  </span>
                </div>
              </div>
              {demoOpen && createPortal(
                <div
                  className="fixed inset-0 z-[10000] flex items-center justify-center"
                  style={{ background: "rgba(0,0,0,0.82)", backdropFilter: "blur(6px)", padding: "40px 32px" }}
                  onClick={() => setDemoOpen(false)}
                >
                  <div
                    className="relative w-full flex flex-col"
                    style={{ maxWidth: "min(1280px, 92vw)" }}
                    onClick={e => e.stopPropagation()}
                  >
                    <button
                      onClick={() => setDemoOpen(false)}
                      className="self-end mb-3 text-xs font-medium transition-opacity hover:opacity-60"
                      style={{ color: "rgba(255,255,255,0.7)", background: "none", border: "none", cursor: "pointer" }}
                    >
                      ✕ Close
                    </button>
                    <div style={{ width: "100%", height: "80vh" }}>
                      <iframe
                        src={cs.iframeDemo}
                        style={{ width: "100%", height: "100%", border: "none", borderRadius: 12 }}
                        allowFullScreen
                      />
                    </div>
                  </div>
                </div>,
                document.body
              )}
            </div>
          ) : (
            cs.heroMedia ? (
              <div className="w-full md:flex-1 self-start flex flex-col gap-3">
                {mediaTabs.length > 0 && activeMediaTab && (
                  <div
                    className="inline-flex items-center gap-1 p-1 rounded-3xl self-start"
                    style={{ background: "hsl(var(--muted))" }}
                  >
                    {mediaTabs.map((tab) => {
                      const active = tab.id === activeMediaTab.id;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => setActiveMediaTabId(tab.id)}
                          className="px-3 py-2 rounded-lg text-xs font-medium leading-none transition-all"
                          style={{
                            background: active ? "hsl(var(--card))" : "transparent",
                            color: active ? "hsl(var(--foreground))" : "hsl(var(--muted-foreground))",
                            boxShadow: active ? "0 1px 3px rgba(0,0,0,0.12)" : "none",
                          }}
                        >
                          {tab.label}
                        </button>
                      );
                    })}
                  </div>
                )}
                <div className="w-full rounded-xl overflow-hidden" style={{ border: "1px solid hsl(var(--border))" }}>
                  <img
                    src={activeMediaTab?.src ?? cs.heroMedia}
                    alt={cs.title}
                    className="w-full h-auto block"
                  />
                </div>
              </div>
            ) : (
              <div className="w-full md:flex-1 self-start rounded-xl" style={{ aspectRatio: "4/3", background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }} />
            )
          )}

          {/* Right: fullContent (tagline already stripped) */}
          <div className="w-full md:flex-1">
            {renderFullContent(rest)}
          </div>
        </div>
        </div>
      </motion.div>
    </div>,
    document.body
  );
}

// ── Tagline extractor ─────────────────────────────────────────────────────────
// If fullContent's first paragraph is a metadata line (role · date · context),
// extract it for the sticky header and return the remaining content separately.
function extractTagline(fullContent?: string): { tagline: string | null; rest: string } {
  if (!fullContent) return { tagline: null, rest: "" };
  const parts = fullContent.split(/\n\n/);
  const first = parts[0].trim();
  // Tagline: single-line, contains " · " separator, not a ** heading or · bullet
  if (first && !first.startsWith("**") && !first.startsWith("·") && first.includes(" · ") && !first.includes("\n")) {
    return { tagline: first, rest: parts.slice(1).join("\n\n") };
  }
  return { tagline: null, rest: fullContent };
}

// ── Module-level bridge so CareerJourney can open a case study directly ───────

export function openCaseStudyByCompany(company: string) {
  window.dispatchEvent(new CustomEvent("open-case-study", { detail: { company } }));
}

// ── Main export ───────────────────────────────────────────────────────────────

export function HighlightedWork() {
  const [overlay, setOverlay] = useState<CaseStudy | null>(null);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (event: Event) => {
      if (!rootRef.current || rootRef.current.offsetParent === null) return;

      const customEvent = event as CustomEvent<{ company?: string }>;
      const company = customEvent.detail?.company;
      if (!company) return;

      const cs = caseStudies.find((item) => item.company?.toLowerCase() === company.toLowerCase());
      if (cs) setOverlay(cs);
    };

    window.addEventListener("open-case-study", handler);
    return () => window.removeEventListener("open-case-study", handler);
  }, []);

  return (
    <>
      <div ref={rootRef} className="bento-block h-full min-h-[980px] md:min-h-[560px] flex flex-col gap-5">
        <div className="flex items-start justify-between flex-shrink-0">
          <span className="bento-label">Highlighted Work</span>
        </div>

        <div className="flex-1 min-h-0 relative">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 overflow-y-auto scrollbar-hide"
            style={{
              paddingLeft: "4px",
              paddingRight: "4px",
              paddingTop: "6px",
              marginTop: "-6px",
            }}
          >
            <CaseStudyList onSelect={setOverlay} />
          </motion.div>
        </div>
      </div>

      {/* Full-screen overlay */}
      <AnimatePresence>
        {overlay && (
          <CaseStudyOverlay
            cs={overlay}
            onClose={() => setOverlay(null)}
            allCases={caseStudies.slice(0, 4)}
            onNavigate={setOverlay}
          />
        )}
      </AnimatePresence>
    </>
  );
}
