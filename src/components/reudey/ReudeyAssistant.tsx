import { useEffect, useRef, useState } from "react";
import { geminiRecruiterService } from "../../modules/reudey/services/geminiRecruiter.service";
import { reudeyIntentService } from "../../modules/reudey/services/reudeyIntent.service";
import { reudeyDecisionService } from "../../modules/reudey/services/reudeyDecision.service";
import { reudeyFilterService } from "../../modules/reudey/services/reudeyFilter.service";
import { reudeyCompareService } from "../../modules/reudey/services/reudeyCompare.service";
import { reudeyKnowledgeService } from "../../modules/reudey/services/reudeyKnowledge.service";
import ReactMarkdown from "react-markdown";
export default function ReudeyAssistant() {
  const [open, setOpen] = useState(false);
const [messages, setMessages] = useState<
  { role: "user" | "assistant"; text: string }[]
>([
  {
    role: "assistant",
    text:
      "Hi! I'm Recrulyn.\n\nI can help you find candidates, compare resumes, summarize profiles, and answer recruitment questions.",
  },
]);

const [input, setInput] = useState("");
const [loading, setLoading] = useState(false);
const [status, setStatus] = useState("");

const messagesRef = useRef<HTMLDivElement>(null);
const loadingMessages = [
  "🔍 Searching candidate database...",
  "📄 Reading resumes...",
  "🧠 Analyzing candidate profiles...",
  "📊 Ranking candidates...",
  "✨ Preparing response..."
];
useEffect(() => {

  messagesRef.current?.scrollTo({

    top: messagesRef.current.scrollHeight,

    behavior: "smooth",

  });

}, [messages]);
useEffect(() => {

  if (!loading) return;

  let index = 0;

  setStatus(loadingMessages[0]);

  const interval = setInterval(() => {

    index = (index + 1) % loadingMessages.length;

    setStatus(loadingMessages[index]);

  }, 1800);

  return () => clearInterval(interval);

}, [loading]);
const typeResponse = async (text: string) => {

  const messageIndex = messages.length + 1;

  setMessages(prev => [
    ...prev,
    {
      role: "assistant",
      text: "",
    },
  ]);

  let current = "";

  for (let i = 0; i < text.length; i++) {

    current += text[i];

    setMessages(prev => {

      const copy = [...prev];

      copy[messageIndex] = {
        role: "assistant",
        text: current,
      };

      return copy;

    });

    await new Promise(r => setTimeout(r, 8));

  }

};
const handleSend = async () => {
  if (!input.trim()) return;

  const question = input.trim();
setMessages(prev => [
  ...prev,
  {
    role: "user",
    text: question,
  },
]);


  setInput("");
  setLoading(true);

  try {
    // Detect module
    const intent =
      reudeyIntentService.detect(question);

  const data =
  await reudeyKnowledgeService.get(intent);
 
if (
  intent === "candidate" &&
  reudeyCompareService.isCompare(question)
) {

  const reply =
    await reudeyCompareService.compare(
      question,
      data
    );

  await typeResponse(reply);

  return;
}

    // Decide if Gemini is required
    const useGemini =
      reudeyDecisionService.shouldUseGemini(
        question
      );

    // ------------------------
    // DATABASE ANSWERS
    // ------------------------

    if (!useGemini) {

      if (intent === "candidate") {
const filters =
  reudeyFilterService.extract(question);

let filtered =
  reudeyFilterService.apply(
    data,
    filters
  );

// Highest AI score first
filtered = filtered.sort(
  (a: any, b: any) =>
    (b.ai_score || 0) -
    (a.ai_score || 0)
);

// Top / Best
if (
  question.toLowerCase().includes("top") ||
  question.toLowerCase().includes("best")
) {

  const reply =
    filtered
      .slice(0, 5)
      .map(
        (c: any, i: number) =>
          `${i + 1}. ${c.full_name}
⭐ ${c.ai_score}
📌 ${c.status}`
      )
      .join("\n\n");

  await typeResponse(reply);

  return;
}

// Count
if (
  question.toLowerCase().includes("how many") ||
  question.toLowerCase().includes("count")
) {

  await typeResponse(
    `Found ${filtered.length} candidate(s).`
  );

  return;
}

// Default list
const reply =
  filtered.length === 0
    ? "No matching candidates found."
    : filtered
        .slice(0, 15)
        .map(
          (c: any) =>
            `• ${c.full_name} (${c.status}) - AI Score: ${c.ai_score}`
        )
        .join("\n");

await typeResponse(reply);

return;
      }

    if (intent === "employee") {

  const reply =
    data.length === 0
      ? "No employees found."
      : data
          .map(
            (e: any) =>
              `• ${e.full_name} - ${e.designation}`
          )
          .join("\n");

  await typeResponse(reply);

  return;
}
    }

    // ------------------------
    // GEMINI
    // ------------------------

    const reply =
      await geminiRecruiterService.ask(
        question,
        data
      );

  await typeResponse(reply);

  } catch (error: any) {

  console.error("RECRULYN ERROR:", error);

 await typeResponse(
  error?.message || "Something went wrong."
);
}

  finally {
  setLoading(false);
  setStatus("");
}
};

  return (
    <>
      <style>{`
        @keyframes reudeyFadeInUp {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes reudeyPanelIn {
          from { opacity: 0; transform: translateY(16px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
        @keyframes reudeyPulseRing {
          0% { box-shadow: 0 0 0 0 rgba(34,197,94,0.45); }
          70% { box-shadow: 0 0 0 12px rgba(34,197,94,0); }
          100% { box-shadow: 0 0 0 0 rgba(34,197,94,0); }
        }
        @keyframes reudeyDotBounce {
          0%, 80%, 100% { transform: translateY(0); opacity: 0.5; }
          40% { transform: translateY(-4px); opacity: 1; }
        }
        @keyframes reudeySpin {
          to { transform: rotate(360deg); }
        }
        .reudey-launcher {
          transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .reudey-launcher:hover {
          transform: translateY(-2px) scale(1.04);
          box-shadow: 0 16px 36px rgba(31,61,43,0.38);
        }
        .reudey-launcher:active {
          transform: translateY(0) scale(0.98);
        }
        .reudey-send-btn {
          transition: transform 0.15s ease, box-shadow 0.15s ease, opacity 0.15s ease;
        }
        .reudey-send-btn:hover:not(:disabled) {
          transform: translateY(-1px);
          box-shadow: 0 8px 18px rgba(31,61,43,0.35);
        }
        .reudey-send-btn:active:not(:disabled) {
          transform: translateY(0) scale(0.96);
        }
        .reudey-input:focus {
          outline: none;
          border-color: #1F3D2B !important;
          box-shadow: 0 0 0 3px rgba(31,61,43,0.12);
        }
        .reudey-scroll::-webkit-scrollbar {
          width: 6px;
        }
        .reudey-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .reudey-scroll::-webkit-scrollbar-thumb {
          background: #D7DED9;
          border-radius: 10px;
        }
        .reudey-scroll::-webkit-scrollbar-thumb:hover {
          background: #B9C4BC;
        }
        .reudey-bubble-assistant {
          animation: reudeyFadeInUp 0.3s ease both;
        }
        .reudey-bubble-user {
          animation: reudeyFadeInUp 0.3s ease both;
        }
        .reudey-dot {
          animation: reudeyDotBounce 1.2s infinite ease-in-out;
        }
        @media (max-width: 480px) {
          .reudey-panel {
            right: 12px !important;
            left: 12px !important;
            width: auto !important;
            bottom: 88px !important;
            height: 70vh !important;
          }
          .reudey-launcher {
            right: 16px !important;
            bottom: 16px !important;
          }
        }
      `}</style>

      <button
        className="reudey-launcher"
        onClick={() => setOpen(!open)}
        aria-label={open ? "Close Recrulyn assistant" : "Open Recrulyn assistant"}
        style={{
          position: "fixed",
          right: 24,
          bottom: 24,
          width: 60,
          height: 60,
          borderRadius: "50%",
          border: "none",
          cursor: "pointer",
          background: "linear-gradient(145deg, #24462F 0%, #1F3D2B 60%, #16301F 100%)",
          color: "#fff",
          fontSize: 24,
          zIndex: 9999,
          boxShadow: "0 10px 30px rgba(31,61,43,0.4)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          animation: open ? "none" : "reudeyPulseRing 2.4s infinite",
        }}
      >
        {open ? (
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none">
            <path d="M6 6L18 18M18 6L6 18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
          </svg>
        ) : (
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none">
            <path
              d="M4 12C4 7.58 8.03 4 13 4C17.97 4 22 7.58 22 12C22 16.42 17.97 20 13 20C11.6 20 10.28 19.68 9.12 19.11L4 20L5.4 16.28C4.52 15.06 4 13.58 4 12Z"
              fill="#fff"
              fillOpacity="0.95"
            />
            <circle cx="9.5" cy="12" r="1.15" fill="#1F3D2B" />
            <circle cx="13" cy="12" r="1.15" fill="#1F3D2B" />
            <circle cx="16.5" cy="12" r="1.15" fill="#1F3D2B" />
          </svg>
        )}
      </button>

      {open && (
        <div
          className="reudey-panel"
          style={{
            position: "fixed",
            right: 24,
            bottom: 96,
            width: 390,
            height: 580,
            background: "#FFFFFF",
            borderRadius: 20,
            border: "1px solid #E7ECE8",
            zIndex: 9999,
            boxShadow: "0 24px 60px rgba(15,30,20,0.22), 0 4px 14px rgba(15,30,20,0.08)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            animation: "reudeyPanelIn 0.28s cubic-bezier(0.16,1,0.3,1) both",
            fontFamily:
              "-apple-system, BlinkMacSystemFont, 'Segoe UI', Inter, Roboto, sans-serif",
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: "16px 18px",
              background: "linear-gradient(135deg, #1F3D2B 0%, #24462F 100%)",
              borderBottom: "1px solid rgba(255,255,255,0.08)",
              flexShrink: 0,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div
                  style={{
                    width: 38,
                    height: 38,
                    borderRadius: 11,
                    background: "rgba(255,255,255,0.12)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    flexShrink: 0,
                  }}
                >
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M12 2L14.5 8.5L21 11L14.5 13.5L12 20L9.5 13.5L3 11L9.5 8.5L12 2Z"
                      fill="#fff"
                    />
                  </svg>
                </div>
                <div>
                  <div
                    style={{
                      fontWeight: 700,
                      fontSize: 15.5,
                      color: "#fff",
                      letterSpacing: 0.2,
                      lineHeight: 1.2,
                    }}
                  >
                    Recrulyn
                  </div>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 6,
                      marginTop: 2,
                    }}
                  >
                    <span
                      style={{
                        width: 7,
                        height: 7,
                        borderRadius: "50%",
                        background: "#4ADE80",
                        boxShadow: "0 0 0 2px rgba(74,222,128,0.25)",
                        display: "inline-block",
                      }}
                    />
                    <span
                      style={{
                        fontSize: 12,
                        color: "rgba(255,255,255,0.75)",
                        fontWeight: 500,
                      }}
                    >
                      AI HR Copilot
                    </span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => setOpen(false)}
                aria-label="Close"
                style={{
                  background: "rgba(255,255,255,0.1)",
                  border: "none",
                  borderRadius: 8,
                  width: 30,
                  height: 30,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "#fff",
                  flexShrink: 0,
                }}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
                  <path d="M6 6L18 18M18 6L6 18" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" />
                </svg>
              </button>
            </div>
          </div>

          {/* Messages */}
          <div
            ref={messagesRef}
            className="reudey-scroll"
            style={{
              flex: 1,
              overflowY: "auto",
              padding: "18px 16px",
              background: "#FAFBFA",
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                className={m.role === "user" ? "reudey-bubble-user" : "reudey-bubble-assistant"}
                style={{
                  marginBottom: 14,
                  display: "flex",
                  justifyContent: m.role === "user" ? "flex-end" : "flex-start",
                }}
              >
                <div
                  style={{
                    maxWidth: "86%",
                    padding: "11px 15px",
                    borderRadius:
                      m.role === "user" ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                    background:
                      m.role === "user"
                        ? "linear-gradient(135deg, #24462F, #1F3D2B)"
                        : "#FFFFFF",
                    color: m.role === "user" ? "#fff" : "#1F2A22",
                    border: m.role === "user" ? "none" : "1px solid #E7ECE8",
                    boxShadow:
                      m.role === "user"
                        ? "0 4px 12px rgba(31,61,43,0.22)"
                        : "0 2px 8px rgba(15,30,20,0.05)",
                    fontSize: 14.5,
                    lineHeight: 1.5,
                  }}
                >
                  <div
                    style={{
                      wordBreak: "break-word",
                    }}
                  >
                    <ReactMarkdown>{m.text || " "}</ReactMarkdown>
                  </div>
                </div>
              </div>
            ))}

            {loading && (
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  padding: "10px 15px",
                  marginTop: 2,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 4,
                    background: "#fff",
                    border: "1px solid #E7ECE8",
                    borderRadius: "16px 16px 16px 4px",
                    padding: "10px 14px",
                    boxShadow: "0 2px 8px rgba(15,30,20,0.05)",
                  }}
                >
                  <span
                    className="reudey-dot"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#1F3D2B",
                      animationDelay: "0s",
                      display: "inline-block",
                    }}
                  />
                  <span
                    className="reudey-dot"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#1F3D2B",
                      animationDelay: "0.15s",
                      display: "inline-block",
                    }}
                  />
                  <span
                    className="reudey-dot"
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: "50%",
                      background: "#1F3D2B",
                      animationDelay: "0.3s",
                      display: "inline-block",
                    }}
                  />
                  <span
                    style={{
                      fontSize: 12.5,
                      color: "#6B7A70",
                      marginLeft: 4,
                      fontStyle: "normal",
                      whiteSpace: "nowrap",
                    }}
                  >
                    {status}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div
            style={{
              borderTop: "1px solid #EEF1EE",
              padding: 12,
              display: "flex",
              gap: 8,
              background: "#fff",
              flexShrink: 0,
              alignItems: "center",
            }}
          >
            <input
              className="reudey-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !loading) {
                  handleSend();
                }
              }}
              placeholder="Ask Recrulyn..."
              style={{
                flex: 1,
                padding: "11px 14px",
                borderRadius: 12,
                border: "1.5px solid #E1E6E2",
                fontSize: 14.5,
                color: "#1F2A22",
                background: "#FAFBFA",
                transition: "border-color 0.15s ease, box-shadow 0.15s ease",
              }}
            />

            <button
              className="reudey-send-btn"
              disabled={loading}
              onClick={handleSend}
              aria-label="Send message"
              style={{
                width: 42,
                height: 42,
                border: "none",
                borderRadius: 12,
                background: loading
                  ? "#A9B7AE"
                  : "linear-gradient(135deg, #24462F, #1F3D2B)",
                color: "#fff",
                cursor: loading ? "not-allowed" : "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                flexShrink: 0,
                boxShadow: loading ? "none" : "0 4px 10px rgba(31,61,43,0.25)",
              }}
            >
              {loading ? (
                <svg
                  width="17"
                  height="17"
                  viewBox="0 0 24 24"
                  fill="none"
                  style={{ animation: "reudeySpin 0.8s linear infinite" }}
                >
                  <circle
                    cx="12"
                    cy="12"
                    r="9"
                    stroke="rgba(255,255,255,0.35)"
                    strokeWidth="3"
                  />
                  <path
                    d="M21 12a9 9 0 0 0-9-9"
                    stroke="#fff"
                    strokeWidth="3"
                    strokeLinecap="round"
                  />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none">
                  <path
                    d="M3.4 20.6L21 12L3.4 3.4L3.4 10.2L15.8 12L3.4 13.8L3.4 20.6Z"
                    fill="#fff"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      )}
    </>
  );
}