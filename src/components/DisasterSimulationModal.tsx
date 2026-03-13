import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { AlertTriangle, Mountain, Droplets, Flame, Heart, Zap, X, Loader2 } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from "@/components/ui/dialog";
import { sendAlert } from "@/lib/alertStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

const VICTIM_NAMES = [
  "Ravi Kumar", "Maria Santos", "Ahmed Hassan", "Priya Sharma",
  "Carlos Rivera", "Mei Lin", "David Park", "Fatima Ali",
  "Juan Cruz", "Aisha Mohammed",
];

const DISASTER_TYPES = [
  {
    id: "earthquake",
    label: "Earthquake Alert",
    icon: Mountain,
    color: "warning",
    message: "Building collapse detected — victim trapped under debris",
    riskKey: "earthquake" as const,
  },
  {
    id: "flood",
    label: "Flood Emergency",
    icon: Droplets,
    color: "info",
    message: "Rising water levels — victim stranded on rooftop",
    riskKey: "flood" as const,
  },
  {
    id: "fire",
    label: "Fire Incident",
    icon: Flame,
    color: "emergency",
    message: "Structure fire — victim unable to evacuate",
    riskKey: "fire" as const,
  },
  {
    id: "medical",
    label: "Medical Emergency",
    icon: Heart,
    color: "safe",
    message: "Severe injury reported — immediate medical aid required",
    riskKey: "storm" as const,
  },
];

interface Props {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSimulated: (riskKey: string) => void;
}

export default function DisasterSimulationModal({ open, onOpenChange, onSimulated }: Props) {
  const [loading, setLoading] = useState<string | null>(null);

  const handleSimulate = async (type: typeof DISASTER_TYPES[number]) => {
    setLoading(type.id);
    try {
      const name = VICTIM_NAMES[Math.floor(Math.random() * VICTIM_NAMES.length)];
      const lat = 14.5995 + (Math.random() - 0.5) * 0.06;
      const lng = 120.9842 + (Math.random() - 0.5) * 0.06;

      // Get auth user
      const { data: { user } } = await supabase.auth.getUser();

      const alert = await sendAlert({
        name,
        latitude: lat,
        longitude: lng,
        message: `[SIMULATION] ${type.label}: ${type.message}`,
        userId: user?.id || undefined,
      });

      if (alert) {
        // Auto-assign nearest rescue team
        const { data: teams } = await supabase
          .from("rescue_teams")
          .select("*")
          .eq("status", "available")
          .limit(1);

        if (teams && teams.length > 0) {
          await supabase.from("rescue_teams").update({
            status: "En Route",
            assigned_alert_id: alert.id,
          }).eq("id", teams[0].id);

          await supabase.from("activity_logs").insert({
            alert_id: alert.id,
            team_id: teams[0].id,
            action: "simulation_dispatch",
            description: `${teams[0].name} dispatched to simulated ${type.label.toLowerCase()}`,
          });
        }

        await supabase.from("activity_logs").insert({
          alert_id: alert.id,
          action: "simulation_triggered",
          description: `Simulated ${type.label.toLowerCase()} triggered — SOS from ${name}`,
        });

        onSimulated(type.riskKey);
        toast.success(`Simulation Active`, {
          description: `${type.label} — ${name} at ${lat.toFixed(4)}, ${lng.toFixed(4)}`,
        });
      }
    } catch (err) {
      console.error(err);
      toast.error("Simulation failed");
    } finally {
      setLoading(null);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="glass-panel border-warning/30 max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <Zap className="w-5 h-5 text-warning" />
            Disaster Simulation
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Select a disaster scenario to generate a simulated SOS alert for demonstration.
          </DialogDescription>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3 pt-2">
          {DISASTER_TYPES.map((type) => {
            const Icon = type.icon;
            const isLoading = loading === type.id;
            return (
              <motion.button
                key={type.id}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.97 }}
                disabled={!!loading}
                onClick={() => handleSimulate(type)}
                className={`relative bg-secondary/50 border border-border/50 rounded-xl p-4 flex flex-col items-center gap-2 hover:border-${type.color}/40 transition-colors disabled:opacity-50`}
              >
                <div className={`w-12 h-12 rounded-xl bg-${type.color}/15 flex items-center justify-center`}>
                  {isLoading ? (
                    <Loader2 className={`w-6 h-6 text-${type.color} animate-spin`} />
                  ) : (
                    <Icon className={`w-6 h-6 text-${type.color}`} />
                  )}
                </div>
                <span className="text-xs font-semibold text-foreground">{type.label}</span>
                <span className="text-[9px] text-muted-foreground text-center leading-tight">{type.message.slice(0, 40)}…</span>
              </motion.button>
            );
          })}
        </div>
        <p className="text-[10px] text-muted-foreground text-center pt-1">
          Alerts will appear with a <span className="text-warning font-semibold">[SIMULATION]</span> label
        </p>
      </DialogContent>
    </Dialog>
  );
}
