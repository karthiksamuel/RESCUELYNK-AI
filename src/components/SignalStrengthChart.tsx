import { useState, useEffect } from "react";
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, Tooltip } from "recharts";
import { Signal } from "lucide-react";
import { motion } from "framer-motion";

interface DataPoint {
  time: string;
  strength: number;
  noise: number;
}

function generatePoint(i: number): DataPoint {
  const now = new Date(Date.now() - (29 - i) * 2000);
  return {
    time: now.toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
    strength: 55 + Math.sin(i * 0.3) * 20 + Math.random() * 15,
    noise: 10 + Math.random() * 12,
  };
}

export default function SignalStrengthChart() {
  const [data, setData] = useState<DataPoint[]>(() =>
    Array.from({ length: 30 }, (_, i) => generatePoint(i))
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setData((prev) => {
        const next = [...prev.slice(1)];
        const now = new Date();
        const lastStrength = prev[prev.length - 1].strength;
        next.push({
          time: now.toLocaleTimeString([], { minute: "2-digit", second: "2-digit" }),
          strength: Math.max(20, Math.min(95, lastStrength + (Math.random() - 0.48) * 12)),
          noise: 10 + Math.random() * 12,
        });
        return next;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const currentStrength = Math.round(data[data.length - 1]?.strength ?? 0);

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel card-glow rounded-2xl p-4"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-info/15 flex items-center justify-center">
            <Signal className="w-4 h-4 text-info" />
          </div>
          <div>
            <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Signal Strength</h3>
            <p className="text-[10px] text-muted-foreground">Real-time mesh signal</p>
          </div>
        </div>
        <span className="text-xl font-black font-mono text-info">{currentStrength}%</span>
      </div>
      <div className="h-36">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
            <defs>
              <linearGradient id="signalGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0.4} />
                <stop offset="95%" stopColor="hsl(217, 91%, 60%)" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="noiseGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0.3} />
                <stop offset="95%" stopColor="hsl(38, 92%, 50%)" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="time"
              tick={{ fontSize: 9, fill: "hsl(215, 20%, 50%)" }}
              axisLine={false}
              tickLine={false}
              interval={9}
            />
            <YAxis
              domain={[0, 100]}
              tick={{ fontSize: 9, fill: "hsl(215, 20%, 50%)" }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip
              contentStyle={{
                background: "hsl(222, 40%, 9%)",
                border: "1px solid hsl(222, 20%, 16%)",
                borderRadius: 8,
                fontSize: 11,
              }}
              labelStyle={{ color: "hsl(210, 40%, 96%)" }}
            />
            <Area
              type="monotone"
              dataKey="noise"
              stroke="hsl(38, 92%, 50%)"
              strokeWidth={1.5}
              fill="url(#noiseGrad)"
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="strength"
              stroke="hsl(217, 91%, 60%)"
              strokeWidth={2}
              fill="url(#signalGrad)"
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </motion.div>
  );
}
