import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, User, Lock, ArrowRight, Eye, EyeOff, Mail } from "lucide-react";
import { useAuth } from "@/lib/authContext";
import { staggerContainer, staggerItem, floatingAnimation } from "@/lib/motion";

export default function SignupPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const navigate = useNavigate();
  const { signup } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!name.trim()) { setError("Please enter your full name"); return; }
    if (!email.trim()) { setError("Please enter your email"); return; }
    if (!password.trim()) { setError("Please enter a password"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }
    if (password !== confirmPassword) { setError("Passwords do not match"); return; }

    setLoading(true);
    const result = await signup(email, password, name, "citizen");
    if (result.error) { setError(result.error); setLoading(false); return; }
    setSuccess(true);
    setLoading(false);
  };

  if (success) {
    <div className="min-h-screen flex items-center justify-center bg-transparent px-4">
      <div className="absolute inset-0 bg-background/40 pointer-events-none" />
      <motion.div initial={{ opacity: 0, y: 30, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-sm bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_30px_rgba(255,255,255,0.02),0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 text-center space-y-5 relative overflow-hidden z-10">
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.2 }}
          className="w-16 h-16 rounded-[1.5rem] bg-safe/10 border border-safe/20 flex items-center justify-center mx-auto shadow-[inset_0_0_20px_theme(colors.safe.DEFAULT/0.2),0_0_20px_theme(colors.safe.DEFAULT/0.2)]">
          <Mail className="w-8 h-8 text-safe drop-shadow-[0_0_10px_theme(colors.safe.DEFAULT/0.8)]" />
        </motion.div>
        <h2 className="text-xl font-bold text-foreground">Check Your Email</h2>
        <p className="text-xs text-muted-foreground leading-relaxed">
          We've sent a confirmation link to <strong className="text-foreground">{email}</strong>. Click the link to activate your account.
        </p>
        <motion.button onClick={() => navigate("/login")} whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
          className="text-xs font-bold uppercase tracking-wider text-safe hover:underline drop-shadow-[0_0_5px_theme(colors.safe.DEFAULT/0.5)] pt-2 block mx-auto">Go to Login</motion.button>
      </motion.div>
    </div>
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-transparent relative px-4 py-8">
      <div className="absolute inset-0 bg-background/40 pointer-events-none" />

      <motion.div initial={{ opacity: 0, y: 30, filter: "blur(8px)" }} animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md relative z-10 space-y-5">
        {/* Logo */}
        <motion.div variants={staggerContainer(0.12, 0.2)} initial="hidden" animate="visible" className="text-center space-y-3">
          <motion.div variants={staggerItem} className="w-16 h-16 rounded-[1.5rem] bg-emergency/10 border border-emergency/20 flex items-center justify-center mx-auto shadow-[inset_0_0_20px_theme(colors.emergency.DEFAULT/0.2),0_0_20px_theme(colors.emergency.DEFAULT/0.2)]">
            <motion.div {...floatingAnimation}><Shield className="w-8 h-8 text-emergency drop-shadow-[0_0_10px_theme(colors.emergency.DEFAULT/0.8)]" /></motion.div>
          </motion.div>
          <motion.div variants={staggerItem}>
            <h1 className="text-2xl font-black tracking-widest text-gradient-emergency">RESCUELINK</h1>
            <p className="text-[11px] font-bold tracking-widest uppercase text-muted-foreground mt-2">Create Your Account</p>
          </motion.div>
        </motion.div>

        {/* Form */}
        <motion.form onSubmit={handleSubmit} variants={staggerContainer(0.06, 0.4)} initial="hidden" animate="visible" className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_30px_rgba(255,255,255,0.02),0_0_50px_rgba(0,0,0,0.5)] rounded-[2rem] p-8 space-y-5 relative overflow-hidden">
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          {error && (
            <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              className="text-[11px] text-emergency bg-emergency/10 border border-emergency/20 rounded-lg px-3 py-2 text-center">
              {error}
            </motion.p>
          )}

          {/* Full Name */}
          <motion.div variants={staggerItem} className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Full Name</label>
            <div className="relative group">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-info transition-colors drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.3)]" />
              <input value={name} onChange={e => { setName(e.target.value); setError(""); }}
                placeholder="Your full name"
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-info/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />
            </div>
          </motion.div>

          {/* Email */}
          <motion.div variants={staggerItem} className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Email Address</label>
            <div className="relative group">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-info transition-colors drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.3)]" />
              <input type="email" value={email} onChange={e => { setEmail(e.target.value); setError(""); }}
                placeholder="operator@rescuelink.com"
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-info/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />
            </div>
          </motion.div>

          {/* Password */}
          <motion.div variants={staggerItem} className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-info transition-colors drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.3)]" />
              <input type={showPassword ? "text" : "password"} value={password} onChange={e => { setPassword(e.target.value); setError(""); }}
                placeholder="Min 6 characters"
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-11 pr-11 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-info/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />
              <motion.button type="button" onClick={() => setShowPassword(!showPassword)} whileHover={{ scale: 1.15 }} whileTap={{ scale: 0.9 }}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </motion.button>
            </div>
          </motion.div>

          {/* Confirm Password */}
          <motion.div variants={staggerItem} className="space-y-1.5">
            <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">Confirm Password</label>
            <div className="relative group">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-info transition-colors drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.3)]" />
              <input type={showPassword ? "text" : "password"} value={confirmPassword} onChange={e => { setConfirmPassword(e.target.value); setError(""); }}
                placeholder="Repeat password"
                className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-info/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]" />
            </div>
          </motion.div>

          <motion.div variants={staggerItem} className="pt-2">
            <motion.button type="submit" disabled={loading}
              whileHover={{ scale: 1.02, boxShadow: "0 0 30px theme(colors.emergency.DEFAULT/0.4)" }} whileTap={{ scale: 0.98 }}
              className="w-full bg-emergency text-primary-foreground font-bold text-sm py-4 rounded-xl shadow-[0_0_20px_theme(colors.emergency.DEFAULT/0.3)] hover:brightness-110 transition-all flex items-center justify-center gap-2 disabled:opacity-50 border border-emergency/50">
              {loading ? (
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                  className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              ) : (<>Create Account <ArrowRight className="w-4 h-4" /></>)}
            </motion.button>
          </motion.div>
        </motion.form>

        <p className="text-center text-xs text-muted-foreground">
          Already have an account?{" "}
          <button onClick={() => navigate("/login")} className="text-info hover:underline">Login</button>
        </p>
        <p className="text-center text-xs text-muted-foreground">
          Authorized rescue operator?{" "}
          <button onClick={() => navigate("/operator-login")} className="text-emergency hover:underline font-medium">Operator Login</button>
        </p>

        <p className="text-center">
          <button onClick={() => navigate("/")} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            ← Back to Landing Page
          </button>
        </p>
      </motion.div>
    </div >
  );
}
