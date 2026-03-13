import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { ShieldAlert } from "lucide-react";
import { useAlerts } from "@/lib/alertStore";
import { useMeshNodes } from "@/lib/meshRelay";
import { useOnlineStatus } from "@/hooks/use-online-status";

function getThreatLevel(alertCount: number, nodeCount: number, isOnline: boolean) {
  let score = alertCount * 20 + (isOnline ? 0 : 15) + Math.max(0, 3 - nodeCount) * 10;
  score = Math.min(100, Math.max(5, score + Math.random() * 8 - 4));
  return Math.round(score);
}

function getThreatLabel(level: number) {
  if (level < 25) return { label: "LOW", color: "hsl(152, 70%, 48%)" };
  if (level < 50) return { label: "MODERATE", color: "hsl(38, 92%, 50%)" };
  if (level < 75) return { label: "HIGH", color: "hsl(25, 95%, 53%)" };
  return { label: "CRITICAL", color: "hsl(0, 84%, 56%)" };
}

export default function ThreatLevelGauge() {
  const alerts = useAlerts();
  const nodes = useMeshNodes();
  const isOnline = useOnlineStatus();
  const [level, setLevel] = useState(() => getThreatLevel(alerts.length, nodes.length, isOnline));

  useEffect(() => {
    const interval = setInterval(() => {
      setLevel(getThreatLevel(alerts.length, nodes.length, isOnline));
    }, 3000);
    return () => clearInterval(interval);
  }, [alerts.length, nodes.length, isOnline]);

  const { label, color } = getThreatLabel(level);

  // SVG arc parameters
  const size = 180;
  const strokeWidth = 12;
  const r = (size - strokeWidth) / 2;
  const cx = size / 2;
  const cy = size / 2;

  // Arc from 135° to 405° (270° sweep)
  const startAngle = 135;
  const endAngle = 405;
  const sweepAngle = endAngle - startAngle;
  const filledAngle = startAngle + (level / 100) * sweepAngle;

  function polarToCartesian(angle: number) {
    const rad = (angle * Math.PI) / 180;
    return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) };
  }

  function describeArc(start: number, end: number) {
    const s = polarToCartesian(start);
    const e = polarToCartesian(end);
    const largeArc = end - start > 180 ? 1 : 0;
    return `M ${s.x} ${s.y} A ${r} ${r} 0 ${largeArc} 1 ${e.x} ${e.y}`;
  }

  const bgPath = describeArc(startAngle, endAngle);
  const fgPath = describeArc(startAngle, Math.max(startAngle + 1, filledAngle));

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.2 }}
      className="glass-panel rounded-2xl p-4 flex flex-col items-center"
    >
      <div className="flex items-center gap-2 mb-1 self-start">
        <div className="w-8 h-8 rounded-lg bg-emergency/15 flex items-center justify-center">
          <ShieldAlert className="w-4 h-4 text-emergency" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Threat Level</h3>
          <p className="text-[10px] text-muted-foreground">Composite risk assessment</p>
        </div>
      </div>

      <svg viewBox={`0 0 ${size} ${size * 0.7}`} className="w-full max-w-[200px]">
        {/* Background arc */}
        <path
          d={bgPath}
          fill="none"
          stroke="hsl(222, 20%, 16%)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Filled arc */}
        <motion.path
          d={fgPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Glow */}
        <motion.path
          d={fgPath}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth + 6}
          strokeLinecap="round"
          opacity={0.15}
          initial={{ pathLength: 0 }}
          animate={{ pathLength: 1 }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
        {/* Center text */}
        <text x={cx} y={cy - 5} textAnchor="middle" fill={color} fontSize={28} fontWeight="900" fontFamily="monospace">
          {level}
        </text>
        <text x={cx} y={cy + 12} textAnchor="middle" fill="hsl(215, 20%, 50%)" fontSize={9} fontFamily="monospace">
          {label}
        </text>
      </svg>

      <div className="flex items-center gap-3 text-[10px] text-muted-foreground mt-1">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: "hsl(152, 70%, 48%)" }} /> Low
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: "hsl(38, 92%, 50%)" }} /> Med
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full" style={{ background: "hsl(0, 84%, 56%)" }} /> Crit
        </span>
      </div>
    </motion.div>
  );
}
