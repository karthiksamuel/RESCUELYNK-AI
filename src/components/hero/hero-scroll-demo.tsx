import * as React from "react";
import Image from "react";
import { ContainerScroll } from "@/components/ui/container-scroll-animation";

export const HeroScrollDemo: React.FC = () => {
  const title = (
    <div className="space-y-4">
      <p className="inline-flex rounded-full bg-white/5 px-4 py-1 text-xs font-medium uppercase tracking-[0.18em] text-[#f97373] ring-1 ring-white/10 backdrop-blur">
        Offline-first • AI-assisted • Built for crises
      </p>
      <h1 className="bg-gradient-to-br from-white via-white to-[#93c5fd] bg-clip-text text-3xl font-semibold leading-tight text-transparent sm:text-4xl md:text-5xl lg:text-[3.2rem] lg:leading-[1.05]">
        RescueLink – Offline Disaster SOS &amp; AI Survival Assistant
      </h1>
      <p className="max-w-xl text-sm text-slate-300 sm:text-base md:text-lg">
        A smart disaster response platform connecting victims and rescue teams, even when networks fail.
        Coordinate SOS beacons, AI-guided survival steps, and live rescue operations in one unified interface.
      </p>
    </div>
  );

  return (
    <div className="relative overflow-hidden bg-[#020617]">
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black/70 via-black/20 to-transparent" />
      <ContainerScroll titleComponent={title}>
        <div className="relative flex h-full w-full items-stretch justify-stretch">
          <div className="relative h-full w-full">
            <img
              src="/dashboard-preview.png"
              alt="RescueLink disaster response dashboard preview"
              className="h-full w-full object-cover object-center sm:object-contain"
            />
            <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/10 to-transparent" />
            <div className="pointer-events-none absolute inset-0 ring-1 ring-white/8" />
            <div className="pointer-events-none absolute left-6 top-6 flex items-center gap-2 rounded-full bg-black/55 px-3 py-1 text-xs font-medium text-slate-200 backdrop-blur">
              <span className="h-2 w-2 rounded-full bg-[#ff3b3b] shadow-[0_0_12px_rgba(255,59,59,0.9)]" />
              Live incident map • 128 active beacons
            </div>
            <div className="pointer-events-none absolute bottom-6 left-6 flex flex-wrap gap-3 text-[0.68rem] text-slate-200 sm:text-xs">
              <span className="rounded-full bg-black/65 px-3 py-1 backdrop-blur">
                Mesh SOS relays • Offline-ready
              </span>
              <span className="rounded-full bg-black/65 px-3 py-1 backdrop-blur">
                AI triage &amp; survival coaching
              </span>
              <span className="rounded-full bg-black/65 px-3 py-1 backdrop-blur">
                Ops console for rescue teams
              </span>
            </div>
          </div>
        </div>
      </ContainerScroll>
    </div>
  );
};

