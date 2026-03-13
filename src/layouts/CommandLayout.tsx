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
<<<<<<< HEAD
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
=======
      <AppBackground />
      <div className="min-h-screen flex w-full bg-transparent">
        <AppSidebar />
        <div className="flex-1 flex flex-col min-w-0">
          <TopStatusBar />
          <main className="flex-1 overflow-auto">
            <AnimatePresence mode="wait">
              <motion.div
                key={location.pathname}
                initial={{ opacity: 0, y: 16, filter: "blur(4px)" }}
                animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
                exit={{ opacity: 0, y: -8, filter: "blur(4px)" }}
                transition={{ duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] }}
                className="flex-1"
              >
                {children}
              </motion.div>
            </AnimatePresence>
>>>>>>> 90334e684ffb1a5506c7d6cf09d9ca5aee246bb7
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
}
