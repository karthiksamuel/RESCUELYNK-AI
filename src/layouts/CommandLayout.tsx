import { SidebarProvider } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import TopStatusBar from "@/components/TopStatusBar";
import { AppBackground } from "@/components/system/AppBackground";
import { AnimatePresence, motion } from "framer-motion";
import { useLocation } from "react-router-dom";

export default function CommandLayout({ children }: { children: React.ReactNode }) {
  const location = useLocation();

  return (
    <SidebarProvider>
      <div className="flex min-h-screen w-full bg-[#06070d] text-white">
        <AppBackground />
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0 min-h-screen">
          <TopStatusBar />
          <main className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-white/10">
              <AnimatePresence mode="wait">
                <motion.div
                  key={location.pathname}
                  initial={{ opacity: 0, scale: 0.98, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.98, y: -10 }}
                  transition={{ duration: 0.3, ease: "easeOut" }}
                  className="flex-1 h-full"
                >
                  {children}
                </motion.div>
              </AnimatePresence>
            </div>
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
