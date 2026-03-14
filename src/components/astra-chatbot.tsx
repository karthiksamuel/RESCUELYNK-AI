import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Bot, User, Send, Mic, MicOff, Zap, AlertTriangle, ShieldCheck, Shield, ShieldAlert, Siren 
} from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import { getSurvivalResponse, detectSeverity, type ChatMessage, type SeverityResult } from "@/lib/survivalAI";

const WELCOME_MSG: ChatMessage = {
  role: "assistant",
  content: `## 🤖 ASTRA Survival Intelligence (Local LLM)\n\nYour **offline AI survival assistant** powered by local retrieval-augmented generation.\n\n**Ask me about:**\n- 🏚️ Earthquake, tornado, hurricane survival\n- 🌊 Flood safety & response\n- 🔥 Fire escape procedures\n- 🩹 First aid: bleeding, burns, CPR, fractures\n- 💧 Water purification & 🏕️ Shelter building\n\n*All knowledge stored locally — works without internet.*\n\n> 🛡️ **Emergency Severity Detection** is active — I'll automatically assess threat levels and recommend SOS alerts for critical situations.`,
  timestamp: Date.now(),
};

const SUGGESTIONS = [
  { label: "Earthquake Help", query: "What should I do during an earthquake?" },
  { label: "Stop Bleeding", query: "How do I stop severe bleeding?" },
  { label: "Water Filter", query: "How to purify water in the wild?" },
  { label: "Flood Safety", query: "Flood survival guide" },
];

function formatTime(ts: number) {
  return new Date(ts).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
}

function SeverityBadge({ severity }: { severity: SeverityResult }) {
  const iconMap = {
    1: ShieldCheck,
    2: Shield,
    3: ShieldAlert,
  };
  const Icon = iconMap[severity.level];
  const colorMap = {
    safe: { bg: "bg-safe/15", text: "text-safe", border: "border-safe/30", glow: "" },
    warning: { bg: "bg-warning/15", text: "text-warning", border: "border-warning/30", glow: "" },
    emergency: { bg: "bg-emergency/15", text: "text-emergency", border: "border-emergency/30", glow: "shadow-glow-emergency" },
  };
  const styles = colorMap[severity.color as keyof typeof colorMap] || colorMap.safe;

  return (
    <motion.div initial={{ scale: 0.8, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
      className={`inline-flex items-center gap-1.5 ${styles.bg} ${styles.text} ${styles.border} ${styles.glow} border rounded-full px-2.5 py-1 text-[10px] font-mono font-bold`}
    >
      <Icon className="w-3 h-3" />
      {severity.label}
    </motion.div>
  );
}

function CriticalWarningPanel({ severity, onTriggerSOS }: { severity: SeverityResult; onTriggerSOS: () => void }) {
  return (
    <motion.div initial={{ y: 20, opacity: 0, scale: 0.95 }} animate={{ y: 0, opacity: 1, scale: 1 }}
      className="bg-black/40 backdrop-blur-3xl border border-emergency/20 shadow-[inset_0_0_20px_theme(colors.emergency.DEFAULT/0.05),0_0_30px_theme(colors.emergency.DEFAULT/0.2)] rounded-[1.5rem] p-5 space-y-4 relative overflow-hidden"
    >
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emergency/30 to-transparent pointer-events-none" />
      <div className="flex items-center gap-2">
        <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}
          className="w-8 h-8 rounded-lg bg-emergency/20 flex items-center justify-center">
          <Siren className="w-5 h-5 text-emergency" />
        </motion.div>
        <div>
          <p className="text-sm font-bold text-emergency uppercase tracking-wider">Critical Emergency Detected</p>
          <p className="text-[10px] text-muted-foreground">Immediate rescue action recommended</p>
        </div>
      </div>

      <div className="bg-info/10 border border-info/20 rounded-lg px-3 py-2 text-[11px] text-info font-mono">
        {severity.rescueMessage || "Severe keywords detected. Initiating emergency protocols."}
      </div>

      <button onClick={onTriggerSOS}
        className="w-full bg-emergency text-primary-foreground rounded-xl py-3 text-sm font-black uppercase tracking-widest flex items-center justify-center gap-2 shadow-glow-emergency hover:scale-[1.02] transition-transform"
      >
        <AlertTriangle className="w-4 h-4" /> Trigger Main SOS
      </button>

      <p className="text-[9px] text-muted-foreground text-center uppercase tracking-tighter">
        Detected: {severity.matchedKeywords.join(", ")}
      </p>
    </motion.div>
  );
}

export function AstraChatbot() {
  const [messages, setMessages] = useState<ChatMessage[]>([WELCOME_MSG]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [listening, setListening] = useState(false);
  const [activeSeverity, setActiveSeverity] = useState<SeverityResult | null>(null);

  const bottomRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);
  const navigate = useNavigate();

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, typing]);

  const handleSend = async (text: string) => {
    if (!text.trim()) return;

    const severity = detectSeverity(text);
    const userMsg: ChatMessage = { role: "user", content: text, timestamp: Date.now(), severity };
    
    setMessages(prev => [...prev, userMsg]);
    setInput("");
    setTyping(true);
    setActiveSeverity(severity.level === 3 ? severity : null);

    // Simulate AI response logic (Local Knowledge Base)
    setTimeout(async () => {
      const response = await getSurvivalResponse(text);
      const assistantMsg: ChatMessage = { 
        role: "assistant", 
        content: response, 
        timestamp: Date.now() 
      };
      setMessages(prev => [...prev, assistantMsg]);
      setTyping(false);
    }, 1000);
  };

  const toggleVoice = () => {
    const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SR) return;

    if (listening) {
      recognitionRef.current?.stop();
      setListening(false);
    } else {
      const recognition = new SR();
      recognition.continuous = false;
      recognition.onresult = (e: any) => {
        const text = e.results[0][0].transcript;
        setInput(text);
        setListening(false);
        handleSend(text);
      };
      recognition.onend = () => setListening(false);
      recognitionRef.current = recognition;
      recognition.start();
      setListening(true);
    }
  };

  return (
    <div className="flex flex-col h-full relative overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-auto p-4 space-y-6 no-scrollbar">
        <AnimatePresence initial={false}>
          {messages.map((msg, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className={`flex gap-3 ${msg.role === "user" ? "justify-end" : ""}`}>
              {msg.role === "assistant" && (
                <div className="w-8 h-8 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4 text-info" />
                </div>
              )}
              <div className={`max-w-[85%] space-y-1 ${msg.role === "user" ? "items-end" : ""}`}>
                {msg.role === "user" && msg.severity && (
                  <SeverityBadge severity={msg.severity} />
                )}
                <div className={`px-4 py-3 rounded-2xl text-sm ${
                  msg.role === "user" 
                    ? "bg-secondary text-primary-foreground rounded-tr-none" 
                    : "bg-white/5 border border-white/10 text-foreground rounded-tl-none"
                }`}>
                  <ReactMarkdown className="prose prose-invert prose-sm max-w-none">
                    {msg.content}
                  </ReactMarkdown>
                </div>
                <p className="text-[10px] text-muted-foreground px-1">{formatTime(msg.timestamp)}</p>
              </div>
              {msg.role === "user" && (
                <div className="w-8 h-8 rounded-lg bg-secondary/20 border border-secondary/30 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4 text-secondary" />
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>

        {typing && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex gap-3">
            <div className="w-8 h-8 rounded-lg bg-info/10 border border-info/20 flex items-center justify-center">
              <Bot className="w-4 h-4 text-info animate-pulse" />
            </div>
            <div className="bg-white/5 border border-white/10 rounded-2xl px-4 py-3 flex gap-1">
              <span className="w-1.5 h-1.5 bg-info/50 rounded-full animate-bounce" />
              <span className="w-1.5 h-1.5 bg-info/50 rounded-full animate-bounce [animation-delay:0.2s]" />
              <span className="w-1.5 h-1.5 bg-info/50 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </motion.div>
        )}

        {/* Critical Warning */}
        {activeSeverity && (
          <CriticalWarningPanel severity={activeSeverity} onTriggerSOS={() => navigate("/sos")} />
        )}

        <div ref={bottomRef} />
      </div>

      {/* Protocols & Quick Reply */}
      <div className="p-4 bg-black/40 backdrop-blur-xl border-t border-white/5 space-y-4">
        <div className="flex items-center gap-2 overflow-auto no-scrollbar pb-2">
          {[
            { label: "Earthquake Guide", query: "earthquake survival guide" },
            { label: "Flood Safety", query: "flood survival guide" },
            { label: "Fire Evacuation", query: "fire evacuation protocol" },
            { label: "Water Purifier", query: "water purification methods" },
            { label: "First Aid", query: "first aid basics" },
          ].map((btn) => (
            <button key={btn.label} onClick={() => handleSend(btn.query)}
              className="text-[10px] font-bold bg-white/5 border border-white/10 hover:bg-white/10 text-muted-foreground hover:text-foreground px-3 py-1.5 rounded-lg whitespace-nowrap transition-all"
            >
              {btn.label}
            </button>
          ))}
        </div>

        <form onSubmit={e => { e.preventDefault(); handleSend(input); }} className="flex gap-3">
          <button type="button" onClick={toggleVoice}
            className={`w-12 h-12 rounded-xl border flex items-center justify-center transition-all ${
              listening ? "bg-emergency/20 border-emergency animate-pulse text-emergency" : "bg-white/5 border-white/10 text-muted-foreground hover:text-foreground"
            }`}
          >
            {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          <input 
            value={input} 
            onChange={e => setInput(e.target.value)}
            placeholder="Describe your situation or ask for guidance..."
            className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 text-sm focus:outline-none focus:border-info/50 transition-colors"
          />
          <button type="submit" disabled={!input.trim() || typing}
            className="w-12 h-12 rounded-xl bg-info text-primary-foreground flex items-center justify-center disabled:opacity-50 disabled:grayscale transition-all"
          >
            <Send className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
}
