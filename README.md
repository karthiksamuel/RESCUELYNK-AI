# RescueLink – Offline Disaster SOS & AI Survival Assistant

A smart emergency response platform that connects victims and rescue teams even without internet. AI-powered survival guidance and mesh relay SOS alerts.

## Tech Stack

- React + TypeScript
- Vite
- Tailwind CSS
- shadcn/ui
- Leaflet Maps
- Lovable Cloud (backend)

## Getting Started

```bash
npm install
npm run dev
```

The app will be available at `http://localhost:8080`.

## Features

- SOS alert system with mesh relay
- AI survival assistant
- Emergency map with rescue team tracking
- Role-based access (Citizen, Rescue Team, Command Operator)
- Offline-first PWA support

### Hybrid Communication Model
RescueLink utilizes a three-tier communication architecture to ensure SOS alerts reach the Command Center even when traditional infrastructure is completely destroyed.

1.  **Tier 1: Bluetooth Mesh (Short Range)**
    *   Citizen-to-citizen propagation.
    *   Range: 50-100m per hop.
    *   Low power, high resilience.
2.  **Tier 2: Drone Relay Network (Mid Range)**
    *   Autonomous aerial communication towers.
    *   Range: 15-20km per unit.
    *   Tactical deployment in disaster zones.
3.  **Tier 3: LoRa Relay Network (Long Range)**
    *   Strategic backbone communication.
    *   Range: 100-200km coverage.
    *   Priority routing based on distance and signal integrity.
hop count, and signal strength to ensure a stable 100-200km delivery path.
4. **Command Central Dashboard**: Real-time visualization of the entire relay chain on the tactical operations map.

© RescueLink Disaster Response Platform
