import { useState } from "react";
import { openCaseStudyByCompany } from "./HighlightedWork";

const timeline = [
  {
    role: "Product Designer, AI Platform",
    company: "Nooks",
    period: "APR 2025 — Present",
    startYear: 2025,
    endYear: 2027,
    color: "#7c3aed",
    initial: "N",
    highlights: [
      "First design hire in the U.S.",
      "AI-powered sales pipeline platform",
      "LLM & agentic workflow design",
    ],
  },
  {
    role: "Founding Designer, GenAI/LLM",
    company: "Praisidio",
    period: "SEP 2022 — MAR 2025",
    startYear: 2022,
    endYear: 2025,
    color: "#0ea5e9",
    initial: "P",
    highlights: [
      "Led 0-1 product, design & branding",
      "Built GenAI assistant for HR teams",
      "Led PLG growth initiatives",
    ],
  },
  {
    role: "Product Designer, AI/ML",
    company: "hireEZ",
    period: "MAY 2021 — AUG 2022",
    startYear: 2021,
    endYear: 2022,
    color: "#f59e0b",
    initial: "E",
    highlights: [
      "Owner of AI search & sourcing",
      "AI recommendation & rediscovery",
      "Home Dashboard redesign",
    ],
  },
  {
    role: "Product Designer, 0-1",
    company: "AiTou Technology",
    period: "JUN 2020 — MAY 2021",
    startYear: 2020,
    endYear: 2021,
    color: "#3b82f6",
    initial: "A",
    highlights: [
      "Built job-seeking platform from 0-1",
      "Selected for Columbia Startup Lab",
    ],
  },
  {
    role: "Product Designer, AI/ML",
    company: "Squirrel AI Learning",
    period: "SEP 2018 — AUG 2019",
    startYear: 2018,
    endYear: 2019,
    color: "#10b981",
    initial: "S",
    highlights: [
      "AI-powered adaptive learning platform",
      "EdTech product design, Shanghai",
    ],
  },
];

export function CareerJourney({ embedded = false }: { embedded?: boolean }) {
  const [cursor, setCursor] = useState<{ x: number; y: number; visible: boolean }>({ x: 0, y: 0, visible: false });

  return (
    <div
      className={embedded ? "flex flex-col" : "bento-block h-full flex flex-col"}
      onMouseMove={(e) => cursor.visible && setCursor(c => ({ ...c, x: e.clientX, y: e.clientY }))}
    >
      {/* Floating cursor label */}
      {cursor.visible && (
        <div
          className="fixed pointer-events-none z-[999] px-2.5 py-1 rounded-full text-xs font-medium bg-[hsl(var(--foreground))] text-[hsl(var(--background))] whitespace-nowrap"
          style={{
            left: cursor.x + 14,
            top: cursor.y - 10,
            transform: `rotate(${((cursor.x / (typeof window !== "undefined" ? window.innerWidth : 1440)) - 0.5) * 18}deg)`,
            transition: "transform 0.15s ease-out",
          }}
        >
          View
        </div>
      )}

      <span className="bento-label mb-4">Career Journey</span>

      {/* Timeline */}
      <div className={embedded ? "overflow-x-hidden" : "flex-1 overflow-y-auto overflow-x-hidden scrollbar-hide"}>
        <div className="relative pl-6">
          {/* Vertical line */}
          <div className="absolute left-[7px] top-2 bottom-2 w-px bg-[hsl(var(--border))]" />

          <div className="hover-mute-list flex flex-col gap-4">
            {timeline.map((item) => {
              const hasCaseStudy = ["Nooks", "Praisidio", "hireEZ", "AiTou Technology"].includes(item.company);
              const isCurrent = item.period.includes("Present");
              return (
              <div
                key={item.company}
                onClick={() => {
                  if (hasCaseStudy) openCaseStudyByCompany(item.company);
                }}
                onMouseEnter={(e) => { if (hasCaseStudy) setCursor({ x: e.clientX, y: e.clientY, visible: true }); }}
                onMouseMove={(e) => { if (hasCaseStudy) setCursor({ x: e.clientX, y: e.clientY, visible: true }); }}
                onMouseLeave={() => setCursor(c => ({ ...c, visible: false }))}
                className={`hover-mute-item group relative flex flex-col gap-0.5 -mx-3 px-3 py-2 rounded-lg transition-colors hover:bg-[var(--hover-surface)] ${hasCaseStudy ? "cursor-none" : "cursor-default"}`}
              >
                {/* Dot */}
                <div
                  className="absolute -left-[10px] top-[13px] w-3 h-3 rounded-full border-2 transition-colors group-hover:border-[hsl(var(--foreground))] group-hover:bg-[hsl(var(--foreground))]"
                  style={isCurrent
                    ? { background: "radial-gradient(circle, hsl(var(--foreground)) 30%, hsl(var(--muted)) 31%)", borderColor: "hsl(var(--border))" }
                    : { background: "hsl(var(--muted))", borderColor: "hsl(var(--border))" }}
                />

                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-[hsl(var(--foreground))] leading-snug">
                    {item.role}
                  </span>
                  {hasCaseStudy && (
                    <span className="text-sm text-[hsl(var(--muted-foreground))] opacity-0 group-hover:opacity-100 transition-opacity mr-1">
                      →
                    </span>
                  )}
                </div>
                <span className="text-sm text-[hsl(var(--muted-foreground))]">
                  {item.company}
                </span>
                <span className="text-xs text-[hsl(var(--muted-foreground))] opacity-70">
                  {item.startYear}–{item.endYear === 2027 ? "Present" : item.endYear}
                </span>
              </div>
              );
            })}
          </div>
        </div>
      </div>

    </div>
  );
}
