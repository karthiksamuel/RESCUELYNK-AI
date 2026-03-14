import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, Polyline, useMap } from "react-leaflet";
import L from "leaflet";
import type { SOSAlert } from "@/lib/alertStore";
import type { RescueTeam, DangerZone } from "@/lib/rescueTeams";
import { useOnlineStatus } from "@/hooks/use-online-status";
import { MapPin, Navigation, Radio, Plane } from "lucide-react";
import { type LoRaNode } from "@/lib/loraRelay";
import { type DroneNode } from "@/lib/droneRelay";

delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const victimIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const rescueIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const loraIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const droneIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-violet.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

const shelterIcon = new L.Icon({
  iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-gold.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
  iconSize: [25, 41], iconAnchor: [12, 41], popupAnchor: [1, -34], shadowSize: [41, 41],
});

function ResizeMap() {
  const map = useMap();
  useEffect(() => { setTimeout(() => map.invalidateSize(), 200); }, [map]);
  return null;
}

function FitBounds({ alerts, teams }: { alerts: SOSAlert[]; teams: RescueTeam[] }) {
  const map = useMap();
  useEffect(() => {
    const points = [
      ...alerts.map((a) => [a.latitude, a.longitude] as [number, number]),
      ...teams.map((t) => [t.latitude, t.longitude] as [number, number]),
    ];
    if (points.length > 0) {
      map.fitBounds(L.latLngBounds(points), { padding: [50, 50], maxZoom: 13 });
    }
  }, [alerts, teams, map]);
  return null;
}

function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

interface Props {
  alerts: SOSAlert[];
  teams?: RescueTeam[];
  dangerZones?: DangerZone[];
  loraNodes?: LoRaNode[];
  droneNodes?: DroneNode[];
}

const statusColor: Record<string, string> = {
  "Available": "hsl(152 70% 48%)",
  "En Route": "hsl(38 92% 50%)",
  "Responding": "hsl(0 84% 56%)",
};

export const SAFE_SHELTERS = [
  { id: "S-1", name: "Central High School", latitude: 14.5900, longitude: 120.9900, capacity: 500 },
  { id: "S-2", name: "Green Valley Plaza", latitude: 14.5750, longitude: 121.0100, capacity: 300 },
  { id: "S-3", name: "East Metro Stadium", latitude: 14.6100, longitude: 121.0300, capacity: 1200 },
];

export default function EmergencyMap({ alerts, teams = [], dangerZones = [], loraNodes = [], droneNodes = [] }: Props) {
  const isOnline = useOnlineStatus();
  const center: [number, number] = [14.58, 121.0];
  const [navRoute, setNavRoute] = useState<{ from: [number, number]; to: [number, number]; dist: number; eta: number } | null>(null);

  const navigateToVictim = (alert: SOSAlert) => {
    // Find nearest team or use rescuer's simulated position
    const assignedTeam = teams.find((t) => t.assignedAlertId === alert.id);
    const from: [number, number] = assignedTeam
      ? [assignedTeam.latitude, assignedTeam.longitude]
      : [14.5995, 120.9842]; // fallback: default rescuer position
    const to: [number, number] = [alert.latitude, alert.longitude];
    const dist = distanceKm(from[0], from[1], to[0], to[1]);
    const eta = Math.max(1, Math.round((dist / 30) * 60)); // ~30km/h average
    setNavRoute({ from, to, dist, eta });
  };

  return (
    <div className="relative h-full w-full">
      <MapContainer center={center} zoom={12} scrollWheelZoom style={{ height: "100%", width: "100%" }} className="rounded-lg">
        <TileLayer attribution='&copy; <a href="https://carto.com/">CARTO</a>' url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png" />
        <ResizeMap />
        <FitBounds alerts={alerts} teams={teams} />

        {/* Danger zones */}
        {dangerZones.map((dz) => (
          <Circle key={dz.id} center={[dz.latitude, dz.longitude]} radius={dz.radius}
            pathOptions={{ color: "hsl(38 92% 50%)", fillColor: "hsl(38 92% 50%)", fillOpacity: 0.15, weight: 1 }}>
            <Popup>
              <div className="text-sm font-semibold" style={{ color: "hsl(38 92% 50%)" }}>⚠ {dz.label}</div>
            </Popup>
          </Circle>
        ))}

        {dangerZones.map((dz) => (
          <Marker key={`dz-m-${dz.id}`} position={[dz.latitude, dz.longitude]} icon={shelterIcon}>
            <Popup>
              <div className="text-sm space-y-1">
                <p className="font-bold" style={{ color: "hsl(38 92% 50%)" }}>⚠ {dz.label}</p>
                <p className="text-xs">Radius: {dz.radius}m</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Safe Shelters */}
        {SAFE_SHELTERS.map((s) => (
          <Marker key={s.id} position={[s.latitude, s.longitude]} icon={shelterIcon}>
            <Popup>
              <div className="text-sm space-y-1">
                <p className="font-bold text-safe">🟢 Safe Shelter: {s.name}</p>
                <p className="text-xs">Capacity: {s.capacity} persons</p>
                <p className="text-[10px] text-muted-foreground">📍 {s.latitude.toFixed(4)}, {s.longitude.toFixed(4)}</p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* SOS victim markers */}
        {alerts.map((alert) => {
          const isSimulation = alert.name.startsWith("[SIMULATION]");
          return (
            <Marker key={alert.id} position={[alert.latitude, alert.longitude]} icon={victimIcon}>
              <Popup>
                <div className="text-sm space-y-1.5" style={{ minWidth: 180 }}>
                  <p className="font-bold" style={{ color: "hsl(0 85% 50%)" }}>🆘 {alert.name}</p>
                  {isSimulation && (
                    <span style={{ fontSize: "10px", background: "hsl(38 92% 50% / 0.2)", color: "hsl(38 92% 50%)", padding: "1px 6px", borderRadius: "4px" }}>Simulation Mode</span>
                  )}
                  <p style={{ fontSize: "12px" }}>{alert.message}</p>
                  <p style={{ fontSize: "11px", color: "#888", fontFamily: "monospace" }}>
                    📍 {alert.latitude.toFixed(4)}, {alert.longitude.toFixed(4)}
                  </p>
                  <p style={{ fontSize: "11px", color: "#888" }}>{new Date(alert.timestamp).toLocaleTimeString()}</p>
                  <button
                    onClick={() => navigateToVictim(alert)}
                    style={{
                      width: "100%",
                      padding: "6px",
                      background: "hsl(217 91% 60%)",
                      color: "white",
                      border: "none",
                      borderRadius: "6px",
                      fontSize: "11px",
                      fontWeight: 600,
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "4px",
                      marginTop: "4px",
                    }}
                  >
                    🧭 Navigate to Victim
                  </button>
                </div>
              </Popup>
            </Marker>
          );
        })}

        {/* Rescue team markers */}
        {teams.map((team) => (
          <Marker key={team.id} position={[team.latitude, team.longitude]} icon={rescueIcon}>
            <Popup>
              <div className="text-sm space-y-1.5" style={{ minWidth: 160 }}>
                <p className="font-bold" style={{ color: "hsl(217 91% 60%)" }}>🚑 {team.name}</p>
                <p className="text-xs">{team.type}</p>
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ background: statusColor[team.status] }} />
                  <span className="text-xs font-medium">{team.status}</span>
                </div>
                {team.eta != null && <p className="text-xs">ETA: <strong>{team.eta} min</strong></p>}
              </div>
            </Popup>
          </Marker>
        ))}

        {/* LoRa Relay Nodes */}
        {loraNodes.map((node) => (
          <div key={node.nodeId}>
            <Circle 
              center={[node.latitude, node.longitude]} 
              radius={15000} // LoRa coverage: 15km
              pathOptions={{ 
                color: node.relayStatus === "active" ? "hsl(152 70% 48%)" : "hsl(0 0% 50%)", 
                fillColor: node.relayStatus === "active" ? "hsl(152 70% 48%)" : "hsl(0 0% 50%)", 
                fillOpacity: 0.05, 
                weight: 1,
                dashArray: "5, 5"
              }}
            />
            <Marker position={[node.latitude, node.longitude]} icon={loraIcon}>
              <Popup>
                <div className="text-sm space-y-1.5" style={{ minWidth: 160 }}>
                  <p className="font-bold" style={{ color: "hsl(152 70% 48%)" }}>📡 LoRa Node: {node.nodeId}</p>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-white/5 p-1 rounded">
                      <p className="text-muted-foreground uppercase">Power</p>
                      <p className={node.batteryLevel < 20 ? "text-emergency" : "text-safe"}>{node.batteryLevel}%</p>
                    </div>
                    <div className="bg-white/5 p-1 rounded">
                      <p className="text-muted-foreground uppercase">Signal</p>
                      <p className="text-info">{node.signalStrength}%</p>
                    </div>
                  </div>
                  <p className="text-xs">Coverage: <strong>{node.coverageRadius} km</strong></p>
                  <p className="text-xs">Status: <strong className={node.relayStatus === "active" ? "text-safe" : "text-muted-foreground uppercase"}>{node.relayStatus}</strong></p>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}

        {/* Drone Relay Nodes */}
        {droneNodes.map((node) => (
          <div key={node.droneId}>
            <Circle 
              center={[node.latitude, node.longitude]} 
              radius={20000} // Drone coverage: 20km
              pathOptions={{ 
                color: "hsl(217 91% 60%)", 
                fillColor: "hsl(217 91% 60%)", 
                fillOpacity: 0.05, 
                weight: 1,
                dashArray: "10, 5"
              }}
            />
            <Marker position={[node.latitude, node.longitude]} icon={droneIcon}>
              <Popup>
                <div className="text-sm space-y-2" style={{ minWidth: 180 }}>
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-info/10 rounded-lg">
                      <Radio className="w-4 h-4 text-info animate-pulse" />
                    </div>
                    <p className="font-bold text-info">AERIAL RELAY: {node.droneId}</p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono">
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <p className="text-muted-foreground uppercase mb-0.5">Battery</p>
                      <p className={node.batteryLevel < 20 ? "text-emergency" : "text-safe"}>{node.batteryLevel}%</p>
                    </div>
                    <div className="bg-white/5 p-2 rounded-xl border border-white/5">
                      <p className="text-muted-foreground uppercase mb-0.5">Altitude</p>
                      <p className="text-info">{node.altitude}m</p>
                    </div>
                  </div>
                  
                  <div className="space-y-1">
                    <div className="flex justify-between text-[10px] text-muted-foreground uppercase">
                      <span>Coverage</span>
                      <span className="text-foreground font-bold">{node.coverageRadius}km</span>
                    </div>
                    <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-info" style={{ width: `${(node.coverageRadius / 20) * 100}%` }} />
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          </div>
        ))}

        {/* Navigation route line */}
        {navRoute && (
          <>
            <Polyline
              positions={[navRoute.from, navRoute.to]}
              pathOptions={{ color: "hsl(217 91% 60%)", weight: 3, dashArray: "8 6", opacity: 0.8 }}
            />
            <Marker position={navRoute.from} icon={rescueIcon}>
              <Popup>
                <div className="text-sm">
                  <p className="font-bold" style={{ color: "hsl(152 70% 48%)" }}>📍 Rescuer Position</p>
                </div>
              </Popup>
            </Marker>
          </>
        )}
      </MapContainer>

      {/* Navigation info overlay */}
      {navRoute && (
        <div className="absolute top-2 left-2 right-2 z-[1000] bg-background/90 backdrop-blur-sm border border-info/30 rounded-xl px-4 py-3 flex items-center gap-3">
          <Navigation className="w-5 h-5 text-info flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-foreground">Navigation Active</p>
            <p className="text-[10px] text-muted-foreground font-mono">
              Distance: {navRoute.dist.toFixed(1)} km · ETA: ~{navRoute.eta} min
            </p>
          </div>
          <button onClick={() => setNavRoute(null)}
            className="text-[10px] text-muted-foreground hover:text-foreground px-2 py-1 rounded-lg border border-border">
            Close
          </button>
        </div>
      )}

      {!isOnline && (
        <div className="absolute bottom-2 left-2 right-2 bg-muted/90 backdrop-blur-sm border border-border rounded-lg px-3 py-2 flex items-center gap-2 text-xs text-muted-foreground z-[1000]">
          <MapPin className="w-3.5 h-3.5 text-warning flex-shrink-0" />
          Map tiles unavailable offline – emergency locations still recorded.
        </div>
      )}
    </div>
  );
}
