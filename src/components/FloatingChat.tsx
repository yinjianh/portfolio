import { useState, useRef, useEffect } from "react";
import { Send, X, MessageCircle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";
import { trackEvent } from "../lib/analytics";

const quickChips = ["Your tools?", "Why design?", "Freelance?"];

const mockReplies: Record<string, string> = {
  "Your tools?":
    "Figma for design, VS Code + React for build, Linear for planning. I'm obsessed with tightening the design-to-code gap.",
  "Why design?":
    "I love the mix of logic and empathy. Figuring out *why* something is hard to use — then making it feel obvious — never gets old.",
  "Freelance?":
    "Occasionally! I take on select projects. Best to reach out via email — I like to understand the problem before jumping in.",
};

interface Message {
  id: number;
  role: "user" | "assistant";
  text: string;
}

export function FloatingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const nextId = useRef(0);

  useEffect(() => {
    if (open && messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, open]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 150);
  }, [open]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    trackEvent("chat_prompt_sent", {
      prompt_text: text.trim().slice(0, 120),
      ui_location: "floating_chat",
    });
    setMessages((prev) => [...prev, { id: nextId.current++, role: "user", text: text.trim() }]);
    setInput("");
    setTyping(true);
    setTimeout(() => {
      const reply =
        mockReplies[text.trim()] ||
        "That's a great question! I'd love to chat more — reach out via email and we can dig deeper.";
      setMessages((prev) => [...prev, { id: nextId.current++, role: "assistant", text: reply }]);
      setTyping(false);
    }, 600);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage(input);
  };

  return createPortal(
    <div className="fixed bottom-5 right-5 z-[9998] flex flex-col items-end gap-3">
      {/* Chat panel */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ type: "spring", damping: 26, stiffness: 300 }}
            className="w-80 rounded-2xl shadow-xl flex flex-col overflow-hidden"
            style={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              boxShadow: "0 8px 40px rgba(0,0,0,0.14)",
            }}
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 border-b" style={{ borderColor: "hsl(var(--border))" }}>
              <span className="text-sm font-medium" style={{ color: "hsl(var(--foreground))" }}>Ask me anything</span>
              <button
                onClick={() => {
                  trackEvent("chat_closed", { ui_location: "floating_chat" });
                  setOpen(false);
                }}
                className="p-1 rounded-lg transition-colors"
                style={{ color: "hsl(var(--muted-foreground))" }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "hsl(var(--muted))")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
              >
                <X size={14} />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto scrollbar-hide flex flex-col gap-2 p-4" style={{ maxHeight: 280 }}>
              {messages.length === 0 && (
                <p className="text-xs text-center py-4" style={{ color: "hsl(var(--muted-foreground))" }}>
                  Ask me about my work, tools, or process.
                </p>
              )}
              {messages.map((msg) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className="max-w-[80%] px-3 py-2 rounded-2xl text-xs leading-relaxed"
                    style={
                      msg.role === "user"
                        ? { background: "hsl(var(--primary))", color: "white" }
                        : { background: "hsl(var(--muted))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }
                    }
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              {typing && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="px-3 py-2 rounded-2xl text-xs" style={{ background: "hsl(var(--muted))", border: "1px solid hsl(var(--border))" }}>
                    <span className="flex gap-1">
                      <span className="animate-bounce [animation-delay:0ms]">·</span>
                      <span className="animate-bounce [animation-delay:150ms]">·</span>
                      <span className="animate-bounce [animation-delay:300ms]">·</span>
                    </span>
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Quick chips */}
            {messages.length === 0 && (
              <div className="flex flex-wrap gap-1.5 px-4 pb-3">
                {quickChips.map((chip) => (
                  <button
                    key={chip}
                    onClick={() => sendMessage(chip)}
                    className="px-2.5 py-1 text-xs rounded-full border transition-colors"
                    style={{ borderColor: "hsl(var(--border))", color: "hsl(var(--foreground))" }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "hsl(var(--primary))"; e.currentTarget.style.color = "hsl(var(--primary))"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "hsl(var(--border))"; e.currentTarget.style.color = "hsl(var(--foreground))"; }}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 pb-3">
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask a question..."
                className="flex-1 text-sm px-4 py-2 rounded-full focus:outline-none transition-colors"
                style={{ background: "hsl(var(--muted))", color: "hsl(var(--foreground))", border: "1px solid hsl(var(--border))" }}
              />
              <button
                type="submit"
                disabled={!input.trim()}
                className="w-8 h-8 rounded-full flex items-center justify-center transition-opacity disabled:opacity-40"
                style={{ background: "hsl(var(--primary))", color: "white" }}
              >
                <Send size={13} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger button */}
      <motion.button
        onClick={() => {
          const nextOpen = !open;
          trackEvent(nextOpen ? "chat_opened" : "chat_closed", { ui_location: "floating_chat" });
          setOpen(nextOpen);
        }}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.94 }}
        className="w-12 h-12 rounded-full shadow-lg flex items-center justify-center"
        style={{ background: "hsl(var(--foreground))", color: "hsl(var(--background))", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }}
      >
        <AnimatePresence mode="wait">
          {open
            ? <motion.span key="x" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }}><X size={18} /></motion.span>
            : <motion.span key="msg" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }}><MessageCircle size={18} /></motion.span>
          }
        </AnimatePresence>
      </motion.button>
    </div>,
    document.body
  );
}
