import { FileText, Linkedin } from "lucide-react";
import { CareerJourney } from "./CareerJourney";

type TestimonialItem =
  | {
      type: "quote";
      body: string;
      author: string;
    }
  | {
      type: "image";
      src: string;
      alt: string;
    };

type StrengthSection = {
  title: string;
  emoji: string;
  summary: string;
  quotes: TestimonialItem[];
};

function Highlight({ children }: { children: React.ReactNode }) {
  return <span className="highlight-chip">{children}</span>;
}

const strengthSections: StrengthSection[] = [
  {
    title: "AI Pioneer",
    emoji: "🚀",
    summary: "I onboard onto codebases, ship PRs, and teach teams to fix UI bugs without opening an IDE, using coding agents to move faster than the design-to-handoff cycle.",
    quotes: [
      {
        type: "image",
        src: "/uploads/testimonial-ai-pioneer-1.png",
        alt: "Slack message praising Yinjian for sharing a Cursor and Slack workflow to fix UI bugs quickly.",
      },
      {
        type: "image",
        src: "/uploads/testimonial-ai-pioneer-2.png",
        alt: "Slack message about Yinjian onboarding onto the codebase and shipping a PR in a day.",
      },
      {
        type: "image",
        src: "/uploads/testimonial-ai-pioneer-3.png",
        alt: "Slack message praising Yinjian for using Cursor in Slack to ship AI Assistant improvements.",
      },
    ],
  },
  {
    title: "Product Thinker",
    emoji: "🎯",
    summary: "I combine deep user understanding with product strategy and execution to solve real problems and drive meaningful outcomes.",
    quotes: [
      {
        type: "image",
        src: "/uploads/testimonial-product-thinker-sergii.png",
        alt: "LinkedIn recommendation from Sergii Denysiuk describing Yinjian's strong product thinking and balance of user, business, and technical considerations.",
      },
    ],
  },
  {
    title: "Design Mentor",
    emoji: "🤝",
    summary: "Through ADPList mentorship, I share my expertise and connect meaningfully with individuals, fostering growth in the design community.",
    quotes: [
      {
        type: "image",
        src: "/uploads/testimonial-design-mentor-valeria.png",
        alt: "Mentorship testimonial screenshot from Valeria Romano praising Yinjian's AI and agent expertise, communication, and strategic guidance.",
      },
      {
        type: "image",
        src: "/uploads/testimonial-design-mentor-pam.png",
        alt: "Mentorship testimonial screenshot from Pam Pitakanonda recommending Yinjian's helpful feedback on presenting work with impact.",
      },
      {
        type: "image",
        src: "/uploads/testimonial-design-mentor-yolanda.png",
        alt: "Mentorship testimonial screenshot from Yolanda Xing about Yinjian giving insightful portfolio suggestions.",
      },
      {
        type: "image",
        src: "/uploads/testimonial-design-mentor-ayodele.png",
        alt: "Mentorship testimonial screenshot from Ayodele Oloruntobi about Yinjian's communication and portfolio advice.",
      },
    ],
  },
];

export function AboutMe() {
  return (
    <div className="bento-block h-full flex flex-col overflow-hidden">
      <span className="bento-label flex-shrink-0 mb-5">About Me</span>

      {/* Scrollable content */}
      <div className="flex-1 flex flex-col gap-5 overflow-y-auto scrollbar-hide min-h-0">
        <div className="flex items-center gap-3">
          <div
            className="flex-shrink-0 rounded-full overflow-hidden"
            style={{ width: 88, height: 88, background: "hsl(var(--muted))" }}
          >
            <img
              src="/profile.jpg"
              alt="Yinjian Huang"
              className="w-full h-full object-cover"
              style={{
                objectPosition: "50% 0%",
                transform: "scale(1.2)",
                transformOrigin: "center top",
              }}
            />
          </div>
          <div>
            <h1 className="text-2xl leading-tight mb-0.5" style={{ fontFamily: '"Fraunces", serif', fontWeight: 900 }}>
              <span style={{ color: "hsl(var(--foreground))" }}>Yinjian Huang</span>
            </h1>
            <p className="text-sm" style={{ color: "hsl(var(--muted-foreground))" }}>
              Designer &amp; builder.
            </p>
          </div>
        </div>

        <div className="border-l-2 border-[hsl(var(--highlight-accent))] pl-4 flex flex-col gap-3">
          <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--foreground))" }}>
            A product designer with <Highlight>7+ years</Highlight> of experience specializing in{" "}
            <Highlight>AI, LLM, and agent-driven SaaS</Highlight> and <Highlight>0 to 1</Highlight> products.
          </p>
          <p className="text-sm leading-relaxed" style={{ color: "hsl(var(--foreground))" }}>
            I turn complex workflows into intuitive experiences and bring ideas
            to life by <Highlight>rapidly prototyping with AI tools</Highlight>, and
            I also ship in code myself.
          </p>
        </div>

        <div className="flex gap-2">
          <a
            href="https://www.linkedin.com/in/yinjian-huang/"
            target="_blank"
            rel="noreferrer"
            data-analytics-event="outbound_click"
            data-analytics-label="linkedin_profile"
            data-analytics-location="about_me"
            className="surface-chip inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors font-medium"
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.color = "hsl(var(--primary))"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--surface-chip-border))"; e.currentTarget.style.color = "hsl(var(--surface-chip-fg))"; }}
          >
            <Linkedin size={14} strokeWidth={2} />
            LinkedIn
          </a>
          <a
            href="https://docs.google.com/document/d/1jzKZSUNEsCm017eb-0Xc3_WVfk-ixbhtEMhXYsuoVFI/edit?usp=sharing"
            target="_blank"
            rel="noreferrer"
            data-analytics-event="outbound_click"
            data-analytics-label="resume"
            data-analytics-location="about_me"
            className="surface-chip inline-flex items-center gap-1.5 px-3 py-1.5 text-xs rounded-full transition-colors font-medium"
            onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.color = "hsl(var(--primary))"; }}
            onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--surface-chip-border))"; e.currentTarget.style.color = "hsl(var(--surface-chip-fg))"; }}
          >
            <FileText size={14} strokeWidth={2} />
            Resume
          </a>
        </div>

        <div className="border-t border-dashed" style={{ borderColor: "hsl(var(--border))" }} />

        <div>
          <CareerJourney embedded />
        </div>
      </div>

    </div>
  );
}

export function Testimonials() {
  return (
    <div className="bento-block h-full flex flex-col overflow-hidden">
      <span className="bento-label flex-shrink-0 mb-5">Testimonials</span>

      <div className="flex-1 overflow-y-auto scrollbar-hide pr-1">
        <div className="flex flex-col gap-4">
          {strengthSections.map((section) => (
            <section key={section.title} className="flex flex-col gap-3">
              <div className="flex flex-col gap-1.5">
                <h3
                  className="leading-snug"
                  style={{ fontSize: "1rem", fontWeight: 700, color: "hsl(var(--foreground))" }}
                >
                  {section.title} <span style={{ fontSize: "0.95rem" }}>{section.emoji}</span>
                </h3>
                <p
                  className="leading-relaxed"
                  style={{ fontSize: "0.875rem", color: "hsl(var(--muted-foreground))", maxWidth: 560 }}
                >
                  {section.summary}
                </p>
              </div>

              <div
                className="group rounded-[24px] flex flex-col gap-3"
                style={{
                  background: "linear-gradient(180deg, hsl(var(--card)) 0%, hsl(var(--background) / 0.96) 100%)",
                  padding: "18px 18px 16px",
                }}
              >
                {section.quotes.map((quote) => (
                  <div
                    key={quote.type === "image" ? quote.src : quote.body}
                  >
                    {quote.type === "image" ? (
                      <img
                        src={quote.src}
                        alt={quote.alt}
                        className="block w-full h-auto rounded-[16px]"
                        style={{ border: "1px solid hsl(var(--border) / 0.55)" }}
                      />
                    ) : (
                      <blockquote>
                        <p
                          className="leading-relaxed"
                          style={{ fontSize: "0.875rem", color: "hsl(var(--foreground))", marginBottom: 12 }}
                        >
                          {quote.body}
                        </p>
                        <footer
                          style={{
                            fontSize: "0.85rem",
                            fontStyle: "italic",
                            color: "hsl(var(--muted-foreground))",
                          }}
                        >
                          {quote.author}
                        </footer>
                      </blockquote>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  );
}

export function Contact() {
  const links = [
    { icon: "𝕏", label: "Twitter", href: "https://x.com" },
    { icon: "✉", label: "Email",   href: "mailto:yinjian@example.com" },
    { icon: "⌘", label: "GitHub",  href: "https://github.com" },
  ];

  return (
    <div className="bento-block h-full flex flex-col gap-3">
      <span className="bento-label">Contact</span>
      <div className="flex flex-col gap-1">
        {links.map((link) => (
          <a
            key={link.label}
            href={link.href}
            target="_blank"
            rel="noreferrer"
            data-analytics-event="outbound_click"
            data-analytics-label={link.label.toLowerCase()}
            data-analytics-location="contact"
            className="flex items-center gap-2.5 px-2 py-2 rounded-xl text-sm transition-all group"
            style={{ color: "hsl(var(--muted-foreground))" }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "hsl(var(--primary))";
              e.currentTarget.style.background = "hsl(var(--muted))";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "hsl(var(--muted-foreground))";
              e.currentTarget.style.background = "transparent";
            }}
          >
            <span className="w-4 text-center text-base">{link.icon}</span>
            <span className="font-medium">{link.label}</span>
          </a>
        ))}
      </div>
    </div>
  );
}
