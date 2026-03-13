import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Shield, Lock, KeyRound, AlertTriangle } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "rescuelink_security_settings";

interface SecurityData {
    encryptionEnabled: boolean;
}

function loadSettings(): SecurityData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return { encryptionEnabled: true };
}

export default function SecuritySettings() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<SecurityData>(loadSettings);
    const [resetConfirm, setResetConfirm] = useState(false);
    const [lockConfirm, setLockConfirm] = useState(false);

    const toggleEncryption = () => {
        setSettings(prev => {
            const next = { encryptionEnabled: !prev.encryptionEnabled };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const handleResetDeviceId = () => {
        if (!resetConfirm) {
            setResetConfirm(true);
            setTimeout(() => setResetConfirm(false), 3000);
            return;
        }
        const newId = crypto.randomUUID();
        localStorage.setItem("rescuelink_device_id", newId);
        setResetConfirm(false);
    };

    const handleEmergencyLock = () => {
        if (!lockConfirm) {
            setLockConfirm(true);
            setTimeout(() => setLockConfirm(false), 3000);
            return;
        }
        localStorage.clear();
        navigate("/");
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
                    <h1 className="text-xl font-black tracking-widest text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">SECURITY SETTINGS</h1>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">Encryption and data protection</p>
                </div>
            </div>

            {/* Encryption toggle */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-black/40 backdrop-blur-3xl border border-safe/20 shadow-[inset_0_0_20px_theme(colors.safe.DEFAULT/0.05),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] p-5 flex items-center gap-4 relative overflow-hidden"
            >
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-safe/20 to-transparent pointer-events-none" />
                <div className="w-12 h-12 rounded-[1rem] bg-safe/10 border border-safe/20 flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_15px_theme(colors.safe.DEFAULT/0.2)]">
                    <Lock className="w-6 h-6 text-safe drop-shadow-[0_0_8px_theme(colors.safe.DEFAULT/0.8)]" />
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">Encryption Enabled</p>
                    <p className="text-[11px] font-medium text-muted-foreground">End-to-end encryption for all mesh communications</p>
                </div>
                <Switch
                    checked={settings.encryptionEnabled}
                    onCheckedChange={toggleEncryption}
                    className="data-[state=checked]:bg-safe data-[state=checked]:shadow-[0_0_15px_theme(colors.safe.DEFAULT/0.5)]"
                />
            </motion.div>

            {/* Action buttons */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.05 }}
                className="space-y-4"
            >
                {/* Reset Device ID */}
                <button
                    onClick={handleResetDeviceId}
                    className={`w-full bg-black/40 backdrop-blur-3xl border shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] p-5 flex items-center gap-4 relative overflow-hidden transition-all text-left ${resetConfirm
                        ? "border-warning/50 shadow-[inset_0_0_40px_rgba(255,165,0,0.2)]"
                        : "border-white/[0.03] hover:bg-white/[0.02] hover:border-white/[0.08]"
                        }`}
                >
                    <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.05] to-transparent pointer-events-none transition-opacity duration-300 opacity-0 group-hover:opacity-100" />
                    <div className="w-12 h-12 rounded-[1rem] bg-white/[0.05] border border-white/[0.05] flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                        <KeyRound className="w-6 h-6 text-warning drop-shadow-[0_0_8px_theme(colors.warning.DEFAULT/0.5)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                            {resetConfirm ? "TAP AGAIN TO CONFIRM" : "RESET DEVICE ID"}
                        </p>
                        <p className="text-[11px] font-medium text-muted-foreground">Generate a new unique device identifier</p>
                    </div>
                </button>

                {/* Emergency Lock */}
                <button
                    onClick={handleEmergencyLock}
                    className={`w-full bg-black/40 backdrop-blur-3xl border shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] p-5 flex items-center gap-4 relative overflow-hidden transition-all text-left ${lockConfirm
                        ? "border-emergency/50 shadow-[0_0_30px_theme(colors.emergency.DEFAULT/0.3),inset_0_0_40px_theme(colors.emergency.DEFAULT/0.2)]"
                        : "border-white/[0.03] hover:bg-white/[0.02] hover:border-emergency/30"
                        }`}
                >
                    <div className="w-12 h-12 rounded-[1rem] bg-emergency/10 border border-emergency/20 flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_15px_theme(colors.emergency.DEFAULT/0.2)]">
                        <AlertTriangle className="w-6 h-6 text-emergency drop-shadow-[0_0_8px_theme(colors.emergency.DEFAULT/0.8)]" />
                    </div>
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">
                            {lockConfirm ? "TAP AGAIN TO ERASE DATA" : "EMERGENCY LOCK MODE"}
                        </p>
                        <p className="text-[11px] font-medium text-muted-foreground">Wipe all local data and lock the terminal</p>
                    </div>
                </button>
            </motion.div>
        </div>
    );
}
