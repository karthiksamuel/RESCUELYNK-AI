import { useEffect, useState, memo } from "react";
import { motion } from "framer-motion";

/**
 * AppBackground — Global animated background layer.
 * A premium SaaS/Web3 aesthetic with slow-moving ambient gradient blobs.
 *
 * Usage: Wrap pages or place at root layout level.
 *   <AppBackground />        — standalone background layer
 *   <AppBackground>{children}</AppBackground> — as a wrapper
 */
function AppBackgroundInner({ children }: { children?: React.ReactNode }) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    // Ambient blob variants for Framer Motion
    const blob1Variants = {
        animate: {
            x: ["0%", "20%", "-10%", "0%"],
            y: ["0%", "-15%", "10%", "0%"],
            scale: [1, 1.1, 0.9, 1],
            rotate: [0, 45, -30, 0],
            transition: { duration: 25, ease: "linear" as const, repeat: Infinity }
        }
    };

    const blob2Variants = {
        animate: {
            x: ["0%", "-30%", "15%", "0%"],
            y: ["0%", "20%", "-20%", "0%"],
            scale: [1, 0.9, 1.2, 1],
            rotate: [0, -60, 30, 0],
            transition: { duration: 30, ease: "linear" as const, repeat: Infinity, delay: 2 }
        }
    };

    const blob3Variants = {
        animate: {
            x: ["0%", "40%", "-20%", "0%"],
            y: ["0%", "-30%", "25%", "0%"],
            scale: [1, 1.2, 0.8, 1],
            rotate: [0, 90, -45, 0],
            transition: { duration: 35, ease: "linear" as const, repeat: Infinity, delay: 5 }
        }
    };

    return (
        <>
            {/* Fixed background layer */}
            <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1] bg-background">

                {/* Subtle base gradient mesh for seamless depth */}
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_hsl(var(--primary)/0.15),_transparent_50%),radial-gradient(ellipse_at_bottom_left,_hsl(var(--secondary)/0.15),_transparent_50%)] mix-blend-screen opacity-60" />

                {/* Ambient Blurry Blobs */}
                {mounted && (
                    <div className="absolute inset-0 opacity-50 mix-blend-screen pointer-events-none overflow-hidden">
                        {/* Primary Deep Violet Blob */}
                        <motion.div
                            variants={blob1Variants}
                            animate="animate"
                            className="absolute top-[5%] left-[10%] w-[800px] h-[800px] bg-[radial-gradient(circle_at_center,theme(colors.primary.DEFAULT/0.4)_0%,transparent_60%)]"
                            style={{ willChange: "transform" }}
                        />

                        {/* Secondary Electric Blue Blob */}
                        <motion.div
                            variants={blob2Variants}
                            animate="animate"
                            className="absolute bottom-[10%] right-[5%] w-[700px] h-[700px] bg-[radial-gradient(circle_at_center,theme(colors.secondary.DEFAULT/0.35)_0%,transparent_60%)]"
                            style={{ willChange: "transform" }}
                        />

                        {/* Accent Magenta/Pink Blob */}
                        <motion.div
                            variants={blob3Variants}
                            animate="animate"
                            className="absolute top-[35%] right-[30%] w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,theme(colors.accent.DEFAULT/0.3)_0%,transparent_60%)]"
                            style={{ willChange: "transform" }}
                        />
                    </div>
                )}

                {/* Massive deep center shadow to sink the content backward into the 3D space */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_120%)] opacity-95" />

                {/* High quality noise texture overlay */}
                <div
                    className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
                    style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")` }}
                />
            </div>

            {/* Page content (if used as wrapper) */}
            {children}
        </>
    );
}

export const AppBackground = memo(AppBackgroundInner);
