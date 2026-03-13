import { useEffect, useState } from "react";
import { motion } from "framer-motion";

export function AnimatedBackground() {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    if (!mounted) return null;

    return (
        <div className="fixed inset-0 overflow-hidden pointer-events-none z-[-1]">
            {/* Deep Cyber Background */}
            <div className="absolute inset-0 bg-background" />

            {/* Grid Overlay */}
            <div
                className="absolute inset-0 opacity-[0.03]"
                style={{
                    backgroundImage: `
            linear-gradient(to right, hsl(var(--secondary)) 1px, transparent 1px),
            linear-gradient(to bottom, hsl(var(--secondary)) 1px, transparent 1px)
          `,
                    backgroundSize: '4rem 4rem',
                }}
            />

            {/* Radial Gradient for central focus */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/80" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,hsl(var(--background))_100%)] opacity-80" />

            {/* Subtle floating particles */}
            {[...Array(15)].map((_, i) => (
                <motion.div
                    key={i}
                    className="absolute w-1 h-1 rounded-full bg-secondary/30"
                    initial={{
                        x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                        y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                        scale: Math.random() * 2,
                        opacity: Math.random() * 0.5 + 0.1,
                    }}
                    animate={{
                        y: [null, Math.random() * -100 - 50],
                        opacity: [null, Math.random() * 0.5 + 0.1, 0],
                    }}
                    transition={{
                        duration: Math.random() * 10 + 10,
                        repeat: Infinity,
                        ease: "linear",
                    }}
                />
            ))}

            {/* Radar sweep / light sweep effect */}
            <motion.div
                className="absolute top-1/2 left-1/2 w-[150vw] h-[150vw] -translate-x-1/2 -translate-y-1/2 opacity-[0.02] mix-blend-screen"
                style={{
                    background: 'conic-gradient(from 0deg at 50% 50%, transparent 0deg, hsl(var(--primary)) 90deg, transparent 180deg)'
                }}
                animate={{ rotate: 360 }}
                transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            />
        </div>
    );
}
