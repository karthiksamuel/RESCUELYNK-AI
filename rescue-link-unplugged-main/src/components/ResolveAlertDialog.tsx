import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { CheckCircle, XCircle, Shield } from "lucide-react";
import type { SOSAlert } from "@/lib/alertStore";
import { resolveAlert } from "@/lib/alertStore";
import { playSuccessSound, vibrateSuccess, vibrateShort } from "@/lib/haptics";

interface Props {
  alert: SOSAlert;
  onResolved?: () => void;
}

type Stage = "closed" | "confirm" | "resolving" | "success";

export default function ResolveAlertDialog({ alert, onResolved }: Props) {
  const [stage, setStage] = useState<Stage>("closed");

  const handleConfirm = async () => {
    setStage("resolving");
    vibrateShort();
    await resolveAlert(alert.id, "Command Center Operator");
    playSuccessSound();
    vibrateSuccess();
    setStage("success");
    setTimeout(() => {
      setStage("closed");
      onResolved?.();
    }, 2000);
  };

  return (
    <>
      <button onClick={() => setStage("confirm")}
        className="text-[9px] font-mono rounded-full px-2 py-0.5 bg-safe/15 text-safe border border-safe/20 hover:bg-safe/25 transition-colors">
        RESOLVE
      </button>

      <AnimatePresence>
        {stage !== "closed" && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4"
            onClick={() => stage === "confirm" && setStage("closed")}>
            <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" />

            {/* Confirm Modal */}
            {(stage === "confirm" || stage === "resolving") && (
              <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                onClick={e => e.stopPropagation()}
                className="relative glass-panel rounded-2xl p-6 max-w-sm w-full space-y-4 border border-border shadow-2xl">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-safe/15 flex items-center justify-center">
                    <Shield className="w-5 h-5 text-safe" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-foreground">Confirm Rescue Completion</h3>
                    <p className="text-[10px] text-muted-foreground">Mark this victim as rescued and remove the SOS signal from the system.</p>
                  </div>
                </div>

                <div className="bg-secondary/40 rounded-xl p-3 space-y-1">
                  <p className="text-xs font-semibold text-foreground">{alert.name}</p>
                  <p className="text-[11px] text-muted-foreground">{alert.message}</p>
                  <p className="text-[10px] font-mono text-info">
                    📍 {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                  </p>
                </div>

                <div className="flex gap-2">
                  <button onClick={() => setStage("closed")} disabled={stage === "resolving"}
                    className="flex-1 bg-secondary/60 text-foreground text-xs font-medium rounded-xl py-2.5 hover:bg-secondary/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    <XCircle className="w-3.5 h-3.5" /> Cancel
                  </button>
                  <button onClick={handleConfirm} disabled={stage === "resolving"}
                    className="flex-1 bg-safe text-primary-foreground text-xs font-bold rounded-xl py-2.5 hover:bg-safe/90 transition-colors disabled:opacity-50 flex items-center justify-center gap-1.5">
                    {stage === "resolving" ? (
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-3.5 h-3.5 border-2 border-primary-foreground border-t-transparent rounded-full inline-block" />
                    ) : (
                      <CheckCircle className="w-3.5 h-3.5" />
                    )}
                    {stage === "resolving" ? "Resolving..." : "Confirm Rescue"}
                  </button>
                </div>
              </motion.div>
            )}

            {/* Success Animation */}
            {stage === "success" && (
              <motion.div
                initial={{ scale: 0.5, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.8, opacity: 0 }}
                transition={{ type: "spring", stiffness: 200, damping: 15 }}
                onClick={e => e.stopPropagation()}
                className="relative glass-panel rounded-2xl p-8 max-w-xs w-full border border-safe/30 shadow-2xl flex flex-col items-center text-center space-y-4"
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ type: "spring", stiffness: 250, damping: 12, delay: 0.15 }}
                  className="w-16 h-16 rounded-full bg-safe/15 flex items-center justify-center"
                >
                  <CheckCircle className="w-9 h-9 text-safe" />
                </motion.div>
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                  <h3 className="text-lg font-black text-safe">Rescue Completed</h3>
                  <p className="text-[11px] text-muted-foreground mt-1 leading-relaxed">
                    The victim has been successfully rescued and the SOS signal has been cleared.
                  </p>
                </motion.div>
                <motion.div
                  initial={{ scaleX: 1 }}
                  animate={{ scaleX: 0 }}
                  transition={{ duration: 2, ease: "linear" }}
                  className="h-0.5 w-full bg-safe/40 rounded-full origin-left"
                />
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
