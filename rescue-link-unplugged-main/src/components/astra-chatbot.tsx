import { useState, useRef, useEffect, useMemo } from "react";
import { Send, Bot, User, Zap, Clock, Mic, MicOff, AlertTriangle, ShieldAlert, Shield, ShieldCheck, Siren } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import ReactMarkdown from "react-markdown";
import { detectSeverity, type SeverityResult } from "@/lib/severityDetection";
import { ChatEngine, type Message } from "@/lib/chat-engine";

export interface ChatMessage extends Message {
    timestamp: number;
    severity?: SeverityResult;
}

const SUGGESTIONS = [
    { label: "🏚️ Earthquake", query: "How to survive an earthquake?" },
    { label: "🌊 Flood", query: "What should I do during a flood?" },
    { label: "🔥 Fire", query: "How to escape a fire?" },
    { label: "🩹 First Aid", query: "How to treat bleeding wounds?" },
    { label: "💧 Water", query: "How to purify water in an emergency?" },
    { label: "🌀 Hurricane", query: "Hurricane survival guide" },
    { label: "🏕️ Shelter", query: "How to build emergency shelter?" },
];

const WELCOME_MSG: ChatMessage = {
    role: "assistant",
    content: `## 🤖 ASTRA Survival Intelligence (Local LLM)\n\nYour **offline AI survival assistant** powered by local retrieval-augmented generation and Ollama.\n\n**Ask me about:**\n- 🏚️ Earthquake, tornado, hurricane survival\n- 🌊 Flood safety & response\n- 🔥 Fire escape procedures\n- 🩹 First aid: bleeding, burns, CPR, fractures\n- 💧 Water purification & 🏕️ Shelter building\n\n*All knowledge stored locally — works without internet.*\n\n> 🛡️ **Emergency Severity Detection** is active — I'll automatically assess threat levels and recommend SOS alerts for critical situations.`,
    timestamp: Date.now(),
};

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
        <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`inline-flex items-center gap-1.5 ${styles.bg} ${styles.text} ${styles.border} ${styles.glow} border rounded-full px-2.5 py-1 text-[10px] font-mono font-bold`}
        >
            <Icon className="w-3 h-3" />
            {severity.label}
        </motion.div>
    );
}

function CriticalWarningPanel({ severity, onTriggerSOS }: { severity: SeverityResult; onTriggerSOS: () => void }) {
    return (
        <motion.div
            initial={{ y: 20, opacity: 0, scale: 0.95 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            className="bg-black/40 backdrop-blur-3xl border border-emergency/20 shadow-[inset_0_0_20px_theme(colors.emergency.DEFAULT/0.05),0_0_30px_theme(colors.emergency.DEFAULT/0.2)] rounded-[1.5rem] p-5 space-y-4 relative overflow-hidden"
        >
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-emergency/30 to-transparent pointer-events-none" />
            <div className="flex items-center gap-2">
                <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1.5 }}
                    className="w-8 h-8 rounded-lg bg-emergency/20 flex items-center justify-center"
                >
                    <Siren className="w-5 h-5 text-emergency" />
                </motion.div>
                <div>
                    <p className="text-sm font-bold text-emergency">Critical emergency detected</p>
                    <p className="text-[10px] text-muted-foreground">Immediate rescue recommended</p>
                </div>
            </div>

            {severity.rescueMessage && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="bg-info/10 border border-info/20 rounded-lg px-3 py-2"
                >
                    <p className="text-[11px] text-info font-mono">{severity.rescueMessage}</p>
                </motion.div>
            )}

            <div className="flex gap-2">
                <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={onTriggerSOS}
                    className="flex-1 bg-emergency text-primary-foreground rounded-xl py-3 text-sm font-bold flex items-center justify-center gap-2 shadow-glow-emergency"
                >
                    <AlertTriangle className="w-4 h-4" />
                    Trigger SOS Alert
                </motion.button>
            </div>

            <p className="text-[10px] text-muted-foreground text-center">
                Keywords detected: {severity.matchedKeywords.join(", ")}
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
    const [ollamaConnected, setOllamaConnected] = useState<boolean | null>(null);

    const bottomRef = useRef<HTMLDivElement>(null);
    const recognitionRef = useRef<any>(null);
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    // Instantiate the ChatEngine. (Using mistral or phi3 locally)
    const chatEngine = useMemo(() => new ChatEngine({ model: "llama3:latest" }), []);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages, typing, activeSeverity]);

    useEffect(() => {
        chatEngine.checkConnection().then(setOllamaConnected);
        const topic = searchParams.get("topic");
        if (topic) setTimeout(() => send(`How to survive ${topic}?`), 300);
    }, []);

    const send = async (text: string) => {
        if (!text.trim()) return;
        const severity = detectSeverity(text);
        const userMsg: ChatMessage = { role: "user", content: text.trim(), timestamp: Date.now(), severity };

        setMessages(prev => [...prev, userMsg]);
        setInput("");
        setActiveSeverity(severity.level >= 2 ? severity : null);
        setTyping(true);

        const assistantMsgIndex = messages.length + 1;

        // Add empty assistant message that will be streamed into
        setMessages(prev => [...prev, { role: "assistant", content: "", timestamp: Date.now() }]);

        try {
            let isCritical = severity.level === 3;
            let isWarning = severity.level === 2;

            let finalContent = "";

            if (isCritical) {
                finalContent += `> 🚨 **THREAT LEVEL: CRITICAL** — Emergency severity detection has flagged this as a life-threatening situation.\n\n### 🆘 Immediate Actions\n- **Press the SOS button** to broadcast your location to rescue teams\n- Stay calm and conserve energy\n\n---\n\n`;
            } else if (isWarning) {
                finalContent += `> ⚠️ **THREAT LEVEL: MODERATE** — Elevated risk detected. Monitor your situation closely.\n\n`;
            }

            setMessages(prev => {
                const newMsgs = [...prev];
                newMsgs[assistantMsgIndex].content = finalContent;
                return newMsgs;
            });

            for await (const chunk of chatEngine.sendMessageStream(text)) {
                finalContent += chunk;
                setMessages(prev => {
                    const newMsgs = [...prev];
                    newMsgs[assistantMsgIndex].content = finalContent;
                    return newMsgs;
                });
            }

        } catch (e) {
            console.error(e);
        } finally {
            setTyping(false);
        }
    };

    const toggleVoice = () => {
        if (listening) { recognitionRef.current?.stop(); setListening(false); return; }
        const SR = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (!SR) return;
        const recognition = new SR();
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.lang = "en-US";
        recognition.onresult = (e: any) => { setInput(e.results[0][0].transcript); setListening(false); };
        recognition.onerror = () => setListening(false);
        recognition.onend = () => setListening(false);
        recognitionRef.current = recognition;
        recognition.start();
        setListening(true);
    };

    const inputSeverity = input.trim() ? detectSeverity(input) : null;

    return (
        <div className="flex flex-col h-[calc(100vh-3rem)] animate-fade-in relative z-10 w-full panel-arc">
            {/* Header */}
            <div className="px-5 py-4 bg-black/40 backdrop-blur-3xl border-b border-white/[0.05] flex items-center gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.5)] relative z-20">
                <div className="relative">
                    <div className="absolute inset-0 rounded-lg border border-info/40 animate-[ping_2s_ease-out_infinite]" />
                    <div className="w-10 h-10 rounded-lg bg-info/10 border border-info/30 flex items-center justify-center shadow-[0_0_15px_hsl(var(--info)/0.3)]">
                        <Bot className="w-5 h-5 text-info animate-pulse" />
                    </div>
                </div>
                <div className="flex-1 min-w-0">
                    <h1 className="font-black text-sm uppercase tracking-widest text-foreground flex items-center gap-2">
                        ASTRA <span className="text-[10px] text-info bg-info/10 px-1.5 py-0.5 rounded border border-info/20">v2.0</span>
                    </h1>
                    <p className="text-[10px] text-muted-foreground font-mono mt-0.5 tracking-wider">
                        {ollamaConnected ? "OLLAMA UPLINK ESTABLISHED" : "LOCAL CACHE (OFFLINE)"}
                    </p>
                </div>
                <span className={`text-[10px] px-3 py-1 rounded font-mono font-bold flex items-center gap-1.5 border ${ollamaConnected
                    ? 'bg-safe/20 text-safe border-safe/30 shadow-[inset_0_0_8px_theme(colors.safe.DEFAULT/0.2)]'
                    : 'bg-warning/20 text-warning border-warning/30 shadow-[inset_0_0_8px_theme(colors.warning.DEFAULT/0.2)]'
                    }`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${ollamaConnected ? "bg-safe animate-pulse" : "bg-warning"}`} />
                    {ollamaConnected ? "LOCAL LLM" : "OFFLINE"}
                </span>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-auto p-4 space-y-4">
                <AnimatePresence initial={false}>
                    {messages.map((msg, i) => (
                        <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                            className={`flex gap-2.5 ${msg.role === "user" ? "justify-end" : ""}`}>
                            {msg.role === "assistant" && (
                                <div className="w-8 h-8 rounded-lg bg-info/10 border border-info/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-glow-info">
                                    <Bot className="w-4 h-4 text-info" />
                                </div>
                            )}
                            <div className="max-w-[85%] space-y-1.5 flex flex-col">
                                {msg.role === "user" && msg.severity && (
                                    <div className="flex justify-end mb-1">
                                        <SeverityBadge severity={msg.severity} />
                                    </div>
                                )}
                                <div className={`px-4 py-3.5 text-sm flex flex-col relative overflow-hidden ${msg.role === "user"
                                    ? "bg-secondary/10 backdrop-blur-md text-secondary-foreground rounded-[1.5rem] rounded-tr-sm shadow-[inset_0_0_15px_theme(colors.secondary.DEFAULT/0.1),0_4px_20px_rgba(0,0,0,0.3)] border border-secondary/20"
                                    : "bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] rounded-tl-sm"
                                    }`}>
                                    {msg.role === "assistant" && (
                                        <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-info to-transparent opacity-50" />
                                    )}
                                    {msg.role === "assistant" ? (
                                        <div className="prose prose-sm prose-invert max-w-none text-left [&_h2]:text-sm [&_h2]:font-bold [&_h2]:text-info [&_h2]:mt-0 [&_h2]:mb-2 [&_h3]:text-xs [&_h3]:font-semibold [&_h3]:mt-3 [&_h3]:mb-1 [&_p]:text-muted-foreground [&_p]:text-xs [&_p]:my-1.5 [&_li]:text-muted-foreground [&_li]:text-xs [&_strong]:text-foreground [&_hr]:border-sidebar-border [&_hr]:my-3 [&_blockquote]:border-info/30 [&_blockquote]:bg-info/5 [&_blockquote]:px-3 [&_blockquote]:py-1 [&_blockquote]:text-[11px] [&_blockquote]:font-mono [&_blockquote]:text-info [&_ol]:my-1 [&_ul]:my-1 [&_code]:text-secondary [&_code]:bg-secondary/10 [&_code]:px-1 [&_code]:rounded">
                                            <ReactMarkdown>{msg.content}</ReactMarkdown>
                                        </div>
                                    ) : (
                                        <span className="font-medium tracking-wide">{msg.content}</span>
                                    )}
                                </div>
                                <p className={`text-[9px] text-muted-foreground px-1 flex items-center gap-1 font-mono uppercase tracking-widest ${msg.role === "user" ? "justify-end text-secondary/70" : "text-info/70"}`}>
                                    <Clock className="w-2.5 h-2.5" /> {formatTime(msg.timestamp)}
                                </p>
                            </div>
                            {msg.role === "user" && (
                                <div className="w-8 h-8 rounded-lg bg-secondary/10 border border-secondary/30 flex items-center justify-center flex-shrink-0 mt-1 shadow-[0_0_10px_hsl(var(--secondary)/0.3)]">
                                    <User className="w-4 h-4 text-secondary" />
                                </div>
                            )}
                        </motion.div>
                    ))}
                </AnimatePresence>

                {typing && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3">
                        <div className="w-8 h-8 rounded-lg bg-info/10 border border-info/30 flex items-center justify-center flex-shrink-0 shadow-glow-info">
                            <Bot className="w-4 h-4 text-info animate-pulse" />
                        </div>
                        <div className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] rounded-tl-sm px-5 py-3.5 space-y-1.5 relative min-w-[120px] overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-info to-transparent opacity-50" />
                            <div className="flex items-center gap-2">
                                <span className="w-2 h-4 bg-info animate-pulse shadow-[0_0_8px_hsl(var(--info))]" />
                                <p className="text-[10px] tracking-widest text-info font-mono uppercase">Processing...</p>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* Critical Emergency Panel */}
                <AnimatePresence>
                    {activeSeverity && activeSeverity.level === 3 && !typing && (
                        <CriticalWarningPanel
                            severity={activeSeverity}
                            onTriggerSOS={() => navigate("/sos")}
                        />
                    )}
                </AnimatePresence>

                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Live severity indicator while typing */}
            <AnimatePresence>
                {inputSeverity && inputSeverity.level >= 2 && (
                    <motion.div
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 20, opacity: 0 }}
                        className={`mx-4 mb-2 bg-black/40 backdrop-blur-3xl border shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] p-4 flex items-center gap-4 ${inputSeverity.level === 3
                            ? "border-emergency/30 shadow-[inset_0_0_20px_theme(colors.emergency.DEFAULT/0.1)]"
                            : "border-warning/30"
                            }`}
                    >
                        {inputSeverity.level === 3 ? (
                            <AlertTriangle className="w-5 h-5 text-emergency flex-shrink-0" />
                        ) : (
                            <Shield className="w-5 h-5 text-warning flex-shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                            <p className="text-xs font-semibold text-foreground">
                                {inputSeverity.level === 3 ? "Critical emergency detected" : "Elevated risk detected"}
                            </p>
                            <p className="text-[10px] text-muted-foreground">
                                {inputSeverity.level === 3 ? "SOS alert will be recommended" : "Monitoring situation"}
                            </p>
                        </div>
                        {inputSeverity.level === 3 && (
                            <button
                                onClick={() => navigate("/sos")}
                                className="bg-emergency rounded-lg px-3 py-1.5 text-[10px] font-bold text-primary-foreground flex-shrink-0"
                            >
                                SOS
                            </button>
                        )}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Suggestion chips */}
            {messages.length <= 1 && (
                <div className="px-5 pb-3 z-10 w-full max-w-full overflow-x-auto no-scrollbar bg-black/60 backdrop-blur-3xl border-t border-white/[0.05] pt-4">
                    <p className="text-[10px] text-info uppercase font-mono tracking-widest mb-3 font-bold flex items-center gap-2">
                        <Zap className="w-3 h-3" /> Quick Query Protocols
                    </p>
                    <div className="flex flex-row gap-2 flex-nowrap w-max">
                        {SUGGESTIONS.map(s => (
                            <button key={s.label} onClick={() => send(s.query)}
                                className="text-[11px] font-mono tracking-wide bg-secondary/10 border border-secondary/30 rounded px-4 py-2 text-secondary hover:bg-secondary/20 hover:shadow-[0_0_15px_hsl(var(--secondary)/0.2)] transition-all whitespace-nowrap">
                                {s.label}
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Input */}
            <div className="bg-black/80 backdrop-blur-3xl border-t border-white/[0.05] p-5 relative z-20">
                <div className="absolute top-0 left-0 w-full h-[1px] bg-gradient-to-r from-transparent via-info/50 to-transparent" />
                <form onSubmit={e => { e.preventDefault(); send(input); }} className="flex gap-3 items-center max-w-4xl mx-auto">
                    <button type="button" onClick={toggleVoice}
                        className={`w-12 h-12 rounded border flex items-center justify-center flex-shrink-0 transition-all ${listening ? "bg-emergency/20 border-emergency/50 text-emergency shadow-[0_0_15px_hsl(var(--emergency)/0.4)] animate-pulse" : "bg-black/50 border-sidebar-border text-muted-foreground hover:text-foreground hover:border-info/50"
                            }`}>
                        {listening ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
                    </button>
                    <input value={input} onChange={e => setInput(e.target.value)}
                        placeholder={listening ? "AWAITING AUDIO INPUT..." : "ENTER COMMAND OR SITUATION..."}
                        className="flex-1 bg-black/50 border border-sidebar-border rounded px-5 py-3 text-sm font-mono tracking-wide text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:border-info/50 focus:shadow-[inset_0_0_10px_hsl(var(--info)/0.2)] transition-all" />
                    <button type="submit" disabled={!input.trim() || typing}
                        className="w-12 h-12 rounded bg-info/20 border border-info/50 flex items-center justify-center text-info shadow-[0_0_10px_hsl(var(--info)/0.3)] disabled:opacity-30 disabled:border-sidebar-border disabled:text-muted-foreground disabled:shadow-none disabled:bg-black/50 transition-all flex-shrink-0 hover:bg-info hover:text-primary-foreground hover:shadow-glow-info">
                        <Send className="w-5 h-5" />
                    </button>
                </form>
            </div>
        </div>
    );
}
