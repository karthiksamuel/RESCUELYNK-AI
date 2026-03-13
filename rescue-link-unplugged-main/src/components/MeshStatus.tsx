import { motion, AnimatePresence } from "framer-motion";
import { Bluetooth, Radio, ArrowRight, RefreshCw } from "lucide-react";
import { useMeshNodes, useRelayLog, refreshNodes } from "@/lib/meshRelay";
import { useOnlineStatus } from "@/hooks/use-online-status";

export default function MeshStatus() {
  const nodes = useMeshNodes();
  const relayLog = useRelayLog();
  const isOnline = useOnlineStatus();
  const recentRelays = relayLog.slice(0, 5);

  return (
    <div className="space-y-3">
      {/* Network state badge */}
      <div className="flex items-center gap-2 flex-wrap">
        {isOnline ? (
          <span className="text-xs font-mono bg-safe/15 text-safe border border-safe/30 rounded-full px-3 py-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-safe animate-pulse" />
            ONLINE
          </span>
        ) : (
          <span className="text-xs font-mono bg-warning/15 text-warning border border-warning/30 rounded-full px-3 py-1 flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-warning animate-pulse" />
            OFFLINE
          </span>
        )}
        <span className="text-xs font-mono bg-info/15 text-info border border-info/30 rounded-full px-3 py-1 flex items-center gap-1.5">
          <Bluetooth className="w-3 h-3" />
          MESH RELAY ACTIVE
        </span>
      </div>

      {/* Nearby devices */}
      <div className="bg-card border border-border rounded-lg p-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Radio className="w-3.5 h-3.5 text-info" />
            Nearby Devices ({nodes.length})
          </h3>
          <button
            onClick={refreshNodes}
            className="text-muted-foreground hover:text-foreground transition-colors"
            title="Scan for devices"
          >
            <RefreshCw className="w-3.5 h-3.5" />
          </button>
        </div>
        <div className="flex flex-wrap gap-1.5">
          {nodes.map((node) => (
            <span
              key={node.id}
              className="text-xs bg-secondary border border-border rounded px-2 py-1 text-muted-foreground font-mono"
            >
              {node.name}
              <span className="text-info ml-1">{node.distance}m</span>
            </span>
          ))}
        </div>
        {!isOnline && (
          <p className="text-xs text-warning mt-2">
            Mesh network relaying alerts through nearby devices.
          </p>
        )}
      </div>

      {/* Recent relay activity */}
      {recentRelays.length > 0 && (
        <div className="bg-card border border-border rounded-lg p-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">
            Relay Activity
          </h3>
          <div className="space-y-1.5">
            <AnimatePresence initial={false}>
              {recentRelays.map((r, i) => (
                <motion.div
                  key={`${r.alertId}-${r.hop}-${r.timestamp}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.05 }}
                  className="flex items-center gap-1.5 text-xs text-muted-foreground"
                >
                  <span className="font-mono text-info">Hop {r.hop}</span>
                  <span className="truncate">{r.fromNode}</span>
                  <ArrowRight className="w-3 h-3 text-accent flex-shrink-0" />
                  <span className="truncate">{r.toNode}</span>
                  <span className="ml-auto text-[10px] opacity-60">
                    {new Date(r.timestamp).toLocaleTimeString()}
                  </span>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        </div>
      )}
    </div>
  );
}
