import { useState, useRef, useEffect } from "react";

type Message = { role: "user" | "assistant"; text: string };
type Provider = "groq" | "gemini";

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";

const ChatWidget = () => {
  const [open, setOpen]           = useState(false);
  const [input, setInput]         = useState("");
  const [messages, setMessages]   = useState<Message[]>([]);
  const [streaming, setStreaming] = useState(false);
  const [provider, setProvider]   = useState<Provider>("groq");
  const threadId                  = useRef(crypto.randomUUID());
  const bottomRef                 = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const send = async () => {
    const text = input.trim();
    if (!text || streaming) return;

    setMessages((prev) => [
      ...prev,
      { role: "user", text },
      { role: "assistant", text: "" },
    ]);
    setInput("");
    setStreaming(true);

    try {
      const res = await fetch(`${API_BASE_URL}/api/ai/chat`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, threadId: threadId.current, provider }),
      });

      if (!res.ok || !res.body) {
        throw new Error("Stream failed");
      }

      const reader  = res.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const lines = decoder
          .decode(value, { stream: true })
          .split("\n")
          .filter((l) => l.startsWith("data:"));

        for (const line of lines) {
          const raw = line.slice(5).trim();
          if (raw === "[DONE]") break;

          let payload: { type?: string; content?: string };
          try {
            payload = JSON.parse(raw);
          } catch {
            continue; // partial chunk — ignore
          }

          if (payload.type === "token" && payload.content) {
            setMessages((prev) => {
              const updated = [...prev];
              updated[updated.length - 1] = {
                ...updated[updated.length - 1],
                text: updated[updated.length - 1].text + payload.content,
              };
              return updated;
            });
          } else if (payload.type === "error") {
            throw new Error(payload.content);
          }
        }
      }

      // never leave an empty bubble if the stream ended without content
      setMessages((prev) => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last.role === "assistant" && !last.text) {
          updated[updated.length - 1] = {
            ...last,
            text: "Query failed — please try a different query.",
          };
        }
        return updated;
      });
    } catch {
      setMessages((prev) => {
        const updated = [...prev];
        updated[updated.length - 1] = {
          ...updated[updated.length - 1],
          text: "Query failed — please try a different query.",
        };
        return updated;
      });
    } finally {
      setStreaming(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3">
      {open && (
        <div className="w-80 h-[420px] bg-white rounded-2xl shadow-2xl border border-slate-200 flex flex-col overflow-hidden">
          {/* Header */}
          <div className="bg-blue-600 text-white px-4 py-3 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-2">
              <span className="text-lg">AI Concierge</span>
              <select
                value={provider}
                onChange={(e) => setProvider(e.target.value as Provider)}
                disabled={streaming}
                className="bg-blue-700 text-blue-100 text-xs rounded-md px-1.5 py-1 border border-blue-500 focus:outline-none disabled:opacity-50"
                aria-label="AI model provider"
              >
                <option value="groq">Groq</option>
                <option value="gemini">Gemini</option>
              </select>
            </div>
            <button
              onClick={() => setOpen(false)}
              className="text-blue-200 hover:text-white text-xl leading-none"
            >
              &times;
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-3 space-y-2 text-sm">
            {messages.length === 0 && (
              <p className="text-slate-400 text-center mt-8 text-xs px-4">
                Ask me to find hotels, compare options, or answer questions about your stay.
              </p>
            )}
            {messages.map((m, i) => (
              <div
                key={i}
                className={`rounded-xl px-3 py-2 max-w-[85%] whitespace-pre-wrap break-words ${
                  m.role === "user"
                    ? "bg-blue-600 text-white ml-auto"
                    : "bg-slate-100 text-slate-800"
                }`}
              >
                {m.text}
                {m.role === "assistant" && streaming && i === messages.length - 1 && (
                  <span className="inline-block w-1.5 h-3.5 bg-slate-400 ml-1 animate-pulse rounded-sm" />
                )}
              </div>
            ))}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="border-t border-slate-200 flex items-center px-2 py-2 gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && send()}
              placeholder="Ask me anything..."
              disabled={streaming}
              className="flex-1 text-sm px-3 py-2 rounded-lg border border-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500 disabled:opacity-50"
            />
            <button
              onClick={send}
              disabled={streaming || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-semibold px-3 py-2 rounded-lg transition-colors"
            >
              Send
            </button>
          </div>
        </div>
      )}

      {/* Toggle button */}
      <button
        onClick={() => setOpen((o) => !o)}
        className="w-14 h-14 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-xl transition-colors flex items-center justify-center"
        aria-label="Open AI concierge chat"
      >
        {open ? (
          <span className="text-xl">&times;</span>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M21 12c0 4.418-4.03 8-9 8a9.862 9.862 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        )}
      </button>
    </div>
  );
};

export default ChatWidget;
