import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, User, Save, Camera } from "lucide-react";
import { useAuth } from "@/lib/authContext";

const STORAGE_KEY = "rescuelink_profile_settings";

interface ProfileData {
    commanderName: string;
    callsign: string;
    avatarInitials: string;
}

function loadProfile(): ProfileData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return { commanderName: "", callsign: "", avatarInitials: "RL" };
}

export default function ProfileSettings() {
    const navigate = useNavigate();
    const { userName } = useAuth();
    const [profile, setProfile] = useState<ProfileData>(loadProfile);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const loaded = loadProfile();
        if (!loaded.commanderName && userName) {
            setProfile(prev => ({ ...prev, commanderName: userName }));
        }
    }, [userName]);

    const handleSave = () => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
    };

    return (
        <div className="p-4 md:p-6 max-w-2xl mx-auto space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center gap-3">
                <button
                    onClick={() => navigate("/settings")}
                    className="w-12 h-12 rounded-[1rem] bg-white/[0.05] border border-white/[0.05] flex items-center justify-center shadow-[inset_0_0_15px_rgba(255,255,255,0.02),0_0_15px_rgba(0,0,0,0.5)] hover:bg-white/[0.08] transition-colors"
                >
                    <ArrowLeft className="w-6 h-6 text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]" />
                </button>
                <div>
                    <h1 className="text-xl font-black tracking-widest text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">PROFILE</h1>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">Commander identity and callsign</p>
                </div>
            </div>

            {/* Avatar Section */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[2rem] p-6 flex flex-col items-center gap-5 relative overflow-hidden"
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="relative">
                    <div className="w-24 h-24 rounded-[2rem] bg-gradient-to-br from-info to-secondary flex items-center justify-center text-3xl font-black text-white shadow-[0_0_30px_theme(colors.info.DEFAULT/0.3)] border border-white/10">
                        {profile.avatarInitials || "RL"}
                    </div>
                    <div className="absolute -bottom-2 -right-2 w-8 h-8 rounded-full bg-emergency flex items-center justify-center shadow-[0_0_15px_theme(colors.emergency.DEFAULT/0.6)] border border-emergency/50">
                        <Camera className="w-4 h-4 text-white" />
                    </div>
                </div>
                <div className="space-y-1.5 w-full max-w-xs">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                        Avatar Initials
                    </label>
                    <input
                        type="text"
                        maxLength={3}
                        value={profile.avatarInitials}
                        onChange={e => setProfile(prev => ({ ...prev, avatarInitials: e.target.value.toUpperCase() }))}
                        placeholder="RL"
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-info/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] font-black tracking-widest text-center"
                    />
                </div>
            </motion.div>

            {/* Fields */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[2rem] p-6 space-y-5 relative overflow-hidden"
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent pointer-events-none" />
                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                        Commander Name
                    </label>
                    <div className="relative group">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground group-focus-within:text-info transition-colors drop-shadow-[0_0_8px_theme(colors.info.DEFAULT/0.3)]" />
                        <input
                            type="text"
                            value={profile.commanderName}
                            onChange={e => setProfile(prev => ({ ...prev, commanderName: e.target.value }))}
                            placeholder="Enter commander name"
                            className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl pl-11 pr-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-info/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)]"
                        />
                    </div>
                </div>

                <div className="space-y-1.5">
                    <label className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest ml-1">
                        Callsign
                    </label>
                    <input
                        type="text"
                        value={profile.callsign}
                        onChange={e => setProfile(prev => ({ ...prev, callsign: e.target.value.toUpperCase() }))}
                        placeholder="e.g. ALPHA-1"
                        className="w-full bg-white/[0.03] border border-white/[0.05] rounded-xl px-4 py-3.5 text-sm text-foreground placeholder:text-muted-foreground/50 focus:outline-none focus:ring-1 focus:ring-info/50 focus:bg-white/[0.05] transition-all duration-300 shadow-[inset_0_0_15px_rgba(0,0,0,0.5)] font-black tracking-widest text-info"
                    />
                </div>
            </motion.div>

            {/* Save */}
            <motion.button
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onClick={handleSave}
                whileHover={{ scale: 1.02, boxShadow: `0 0 30px ${saved ? 'theme(colors.safe.DEFAULT/0.4)' : 'theme(colors.info.DEFAULT/0.4)'}` }}
                whileTap={{ scale: 0.98 }}
                className={`w-full font-black text-sm py-4 rounded-xl flex items-center justify-center gap-2 transition-all border ${saved
                    ? "bg-safe text-background shadow-[0_0_20px_theme(colors.safe.DEFAULT/0.3)] border-safe/50"
                    : "bg-info text-background shadow-[0_0_20px_theme(colors.info.DEFAULT/0.3)] border-info/50 hover:brightness-110"
                    }`}
            >
                <Save className="w-4 h-4" />
                {saved ? "SAVED ✓" : "SAVE PROFILE"}
            </motion.button>
        </div>
    );
}
