import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, Lock, ArrowRight, Command, Mail } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { staggerContainer, staggerItem, floatingAnimation } from "@/lib/motion";

export default function OperatorLoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [accessCode, setAccessCode] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login, loginWithCode } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        if (!email.trim() || !password.trim() || !accessCode.trim()) {
            setError("Please fill in all fields.");
            return;
        }

        const validCode = import.meta.env.VITE_COMMANDER_ACCESS_CODE || "RL-COMMAND-9090";
        if (accessCode !== validCode) {
            setError("Invalid Operator Access Code.");
            return;
        }

        setLoading(true);

        if (!navigator.onLine) {
            const result = await loginWithCode(accessCode, "command_operator");
            if (result.error) { setError(result.error); setLoading(false); return; }
            setTimeout(() => navigate("/operator-dashboard"), 50);
            setLoading(false);
            return;
        }

        const result = await login(email, password);
        if (result.error) {
            if (result.error.toLowerCase().includes("failed to fetch") || result.error.toLowerCase().includes("network")) {
                const offlineResult = await loginWithCode(accessCode, "command_operator");
                if (offlineResult.error) { setError(offlineResult.error); setLoading(false); return; }
                setTimeout(() => navigate("/operator-dashboard"), 50);
                setLoading(false);
                return;
            }
            setError(result.error);
            setLoading(false);
            return;
        }

        navigate("/operator-dashboard");
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-transparent relative px-4 text-foreground">
            <div className="absolute inset-0 bg-background/40 pointer-events-none" />

            <motion.div initial={{ opacity: 0, y: 30, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
                className="w-full max-w-sm relative z-10 space-y-6">
                <motion.div variants={staggerContainer(0.12, 0.2)} initial="hidden" animate="visible" className="text-center space-y-3">
                    <motion.div variants={staggerItem} className="w-16 h-16 rounded-[1.5rem] bg-emergency/10 border border-emergency/20 flex items-center justify-center mx-auto shadow-[inset_0_0_20px_theme(colors.emergency.DEFAULT/0.2),0_0_20px_theme(colors.emergency.DEFAULT/0.2)]">
                        <motion.div {...floatingAnimation}><Command className="w-8 h-8 text-emergency drop-shadow-[0_0_10px_theme(colors.emergency.DEFAULT/0.8)]" /></motion.div>
                    </motion.div>
                    <motion.div variants={staggerItem}>
                        <h1 className="text-2xl font-black tracking-widest text-gradient-emergency">COMMAND CENTER LOGIN</h1>
                        <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mt-2">Operator Access Terminal</p>
                    </motion.div>
                </motion.div>

                <motion.form onSubmit={handleSubmit} variants={staggerContainer(0.06, 0.4)} initial="hidden" animate="visible" className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_30px_rgba(255,255,255,0.02),0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 space-y-5 relative overflow-hidden">
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
                    {error && (
                        <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                            className="text-[11px] text-emergency bg-emergency/10 border border-emergency/20 rounded-lg px-3 py-2 text-center">
                            {error}
                        </motion.p>
                    )}

                    <motion.div variants={staggerItem} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emergency transition-colors drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.3)]" />
                            <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                                placeholder="commander@rescue.local"
                                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-emergency/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />
                        </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Terminal Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emergency transition-colors drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.3)]" />
                            <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                                placeholder="Secure Operator Password"
                                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-emergency/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />
                        </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="space-y-1.5">
                        <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Operator Access Code</label>
                        <div className="relative group">
                            <Shield className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-emergency transition-colors drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.3)]" />
                            <input type="text" value={accessCode} onChange={e => { setAccessCode(e.target.value); setError(""); }}
                                placeholder="RL-COMMAND-XXXX"
                                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-emergency/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />
                        </div>
                    </motion.div>

                    <motion.div variants={staggerItem} className="pt-2">
                        <motion.button type="submit" disabled={loading}
                            whileHover={{ scale: 1.02, boxShadow: "0 0 30px theme(colors.emergency.DEFAULT/0.4)" }} whileTap={{ scale: 0.98 }}
                            className="w-full bg-emergency text-primary-foreground font-bold text-sm py-4 rounded-xl shadow-[0_0_20px_theme(colors.emergency.DEFAULT/0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-emergency/50">
                            {loading ? (
                                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                            ) : (<>Initialize Command <ArrowRight className="w-4 h-4" /></>)}
                        </motion.button>
                    </motion.div>
                </motion.form>

                <p className="text-center text-xs text-muted-foreground">
                    Don't have an operator account?{" "}
                    <button onClick={() => navigate("/operator-signup")} className="text-emergency hover:underline font-medium">Create Operator Account</button>
                </p>

                <p className="text-center">
                    <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                        ← Back to Landing Page
                    </button>
                </p>
            </motion.div>
        </div>
    );
}
