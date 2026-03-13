import { useMeshNodes, useRelayLog } from "@/lib/meshRelay";
import { motion } from "framer-motion";
import { Network } from "lucide-react";

export default function RelayNetworkGraph() {
  const nodes = useMeshNodes();
  const relayLog = useRelayLog();
  const recentRelays = relayLog.slice(0, 8);

  // Layout nodes in a circle around a center hub
  const cx = 120;
  const cy = 100;
  const radius = 70;

  const nodePositions = nodes.map((node, i) => {
    const angle = (i / nodes.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...node,
      x: cx + Math.cos(angle) * radius,
      y: cy + Math.sin(angle) * radius,
    };
  });

  // Find active relay connections
  const activeConnections = new Set(
    recentRelays.map((r) => `${r.fromNode}-${r.toNode}`)
  );

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
      className="glass-panel rounded-2xl p-4"
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="w-8 h-8 rounded-lg bg-safe/15 flex items-center justify-center">
          <Network className="w-4 h-4 text-safe" />
        </div>
        <div>
          <h3 className="text-xs font-semibold text-foreground uppercase tracking-wider">Relay Network</h3>
          <p className="text-[10px] text-muted-foreground">{nodes.length} nodes • {recentRelays.length} active relays</p>
        </div>
      </div>

      <svg viewBox="0 0 240 200" className="w-full h-auto">
        {/* Connection lines */}
        {nodePositions.map((node, i) => {
          const next = nodePositions[(i + 1) % nodePositions.length];
          const isActive = activeConnections.has(`${node.name}-${next.name}`) ||
            activeConnections.has(`${next.name}-${node.name}`);
          return (
            <motion.line
              key={`line-${i}`}
              x1={node.x}
              y1={node.y}
              x2={next.x}
              y2={next.y}
              stroke={isActive ? "hsl(152, 70%, 48%)" : "hsl(222, 20%, 20%)"}
              strokeWidth={isActive ? 2 : 1}
              strokeDasharray={isActive ? "none" : "4 4"}
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{ duration: 1, delay: i * 0.1 }}
            />
          );
        })}

        {/* Lines to center hub */}
        {nodePositions.map((node, i) => (
          <motion.line
            key={`hub-${i}`}
            x1={node.x}
            y1={node.y}
            x2={cx}
            y2={cy}
            stroke="hsl(222, 20%, 18%)"
            strokeWidth={0.5}
            strokeDasharray="2 3"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.5 }}
            transition={{ delay: 0.5 + i * 0.05 }}
          />
        ))}

        {/* Center hub */}
        <motion.circle
          cx={cx}
          cy={cy}
          r={14}
          fill="hsl(217, 91%, 60%)"
          fillOpacity={0.15}
          stroke="hsl(217, 91%, 60%)"
          strokeWidth={1.5}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", delay: 0.3 }}
        />
        <motion.circle
          cx={cx}
          cy={cy}
          r={4}
          fill="hsl(217, 91%, 60%)"
          initial={{ scale: 0 }}
          animate={{ scale: [1, 1.3, 1] }}
          transition={{ repeat: Infinity, duration: 2 }}
        />
        <text x={cx} y={cy + 24} textAnchor="middle" fill="hsl(215, 20%, 50%)" fontSize={8} fontFamily="monospace">
          HUB
        </text>

        {/* Nodes */}
        {nodePositions.map((node, i) => (
          <motion.g
            key={node.id}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.2 + i * 0.08, type: "spring" }}
          >
            <circle
              cx={node.x}
              cy={node.y}
              r={10}
              fill="hsl(222, 40%, 9%)"
              stroke="hsl(152, 70%, 48%)"
              strokeWidth={1.5}
            />
            <circle
              cx={node.x}
              cy={node.y}
              r={3}
              fill="hsl(152, 70%, 48%)"
            />
            <text
              x={node.x}
              y={node.y + 18}
              textAnchor="middle"
              fill="hsl(215, 20%, 50%)"
              fontSize={7}
              fontFamily="monospace"
            >
              {node.name.replace("Device-", "")}
            </text>
            <text
              x={node.x}
              y={node.y + 26}
              textAnchor="middle"
              fill="hsl(217, 91%, 60%)"
              fontSize={6}
              fontFamily="monospace"
            >
              {node.distance}m
            </text>
          </motion.g>
        ))}

        {/* Animated pulse rings on active relays */}
        {nodePositions
          .filter((n) =>
            recentRelays.some((r) => r.fromNode === n.name || r.toNode === n.name)
          )
          .map((node) => (
            <motion.circle
              key={`pulse-${node.id}`}
              cx={node.x}
              cy={node.y}
              r={10}
              fill="none"
              stroke="hsl(152, 70%, 48%)"
              strokeWidth={1}
              initial={{ r: 10, opacity: 0.6 }}
              animate={{ r: 22, opacity: 0 }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          ))}
      </svg>
    </motion.div>
  );
}
