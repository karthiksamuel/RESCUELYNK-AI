import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Bell, Volume2, Vibrate, BellRing } from "lucide-react";
import { Switch } from "@/components/ui/switch";

const STORAGE_KEY = "rescuelink_notification_settings";

interface NotificationData {
    alertSound: boolean;
    vibration: boolean;
    pushNotifications: boolean;
}

function loadSettings(): NotificationData {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) return JSON.parse(raw);
    } catch { }
    return { alertSound: true, vibration: true, pushNotifications: false };
}

export default function NotificationSettings() {
    const navigate = useNavigate();
    const [settings, setSettings] = useState<NotificationData>(loadSettings);

    const toggle = (key: keyof NotificationData) => {
        setSettings(prev => {
            const next = { ...prev, [key]: !prev[key] };
            localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
            return next;
        });
    };

    const items = [
        {
            key: "alertSound" as const,
            icon: Volume2,
            label: "Alert Sound",
            desc: "Play audio on incoming emergency alerts",
        },
        {
            key: "vibration" as const,
            icon: Vibrate,
            label: "Vibration",
            desc: "Haptic feedback for critical notifications",
        },
        {
            key: "pushNotifications" as const,
            icon: BellRing,
            label: "Push Notifications",
            desc: "Receive browser push notifications",
        },
    ];

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
                    <h1 className="text-xl font-black tracking-widest text-foreground drop-shadow-[0_0_10px_rgba(255,255,255,0.3)]">NOTIFICATIONS</h1>
                    <p className="text-[10px] font-bold tracking-widest uppercase text-muted-foreground mt-1">Alert sounds and vibration</p>
                </div>
            </div>

            {/* Toggles */}
            <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="space-y-3"
            >
                {items.map(({ key, icon: Icon, label, desc }, i) => (
                    <motion.div
                        key={key}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.05 }}
                        className="bg-black/40 backdrop-blur-3xl border border-white/[0.03] shadow-[inset_0_0_20px_rgba(255,255,255,0.01),0_4px_20px_rgba(0,0,0,0.5)] rounded-[1.5rem] p-4 flex items-center gap-4 relative overflow-hidden"
                    >
                        <div className="w-12 h-12 rounded-[1rem] bg-white/[0.05] border border-white/[0.05] flex items-center justify-center flex-shrink-0 shadow-[inset_0_0_10px_rgba(255,255,255,0.02)]">
                            <Icon className="w-6 h-6 text-warning drop-shadow-[0_0_8px_theme(colors.warning.DEFAULT/0.3)]" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-foreground drop-shadow-[0_0_8px_rgba(255,255,255,0.2)]">{label}</p>
                            <p className="text-[11px] font-medium text-muted-foreground">{desc}</p>
                        </div>
                        <Switch
                            checked={settings[key]}
                            onCheckedChange={() => toggle(key)}
                            className="data-[state=checked]:bg-warning data-[state=checked]:shadow-[0_0_15px_theme(colors.warning.DEFAULT/0.5)]"
                        />
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
}
