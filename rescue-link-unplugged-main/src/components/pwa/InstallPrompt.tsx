import * as React from "react";
import { Download } from "lucide-react";
import { useInstallPrompt } from "@/hooks/useInstallPrompt";

export function InstallPrompt({ className = "" }: { className?: string }) {
  const { canInstall, promptInstall } = useInstallPrompt();
  if (!canInstall) return null;

  return (
    <button
      type="button"
      onClick={promptInstall}
      className={
        "inline-flex items-center gap-1.5 rounded-full bg-info/10 px-2.5 py-1 text-[10px] font-mono text-info " +
        "border border-info/20 hover:bg-info/15 transition-colors " +
        className
      }
    >
      <Download className="h-3 w-3" />
      INSTALL
    </button>
  );
}

