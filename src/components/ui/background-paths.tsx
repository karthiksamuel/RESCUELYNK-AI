import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

const PATHS_DATA = Array.from({ length: 18 }, (_, i) => {
    const baseRadius = 200 + i * 44;
    return {
        id: `path-${i}`,
        d: `M-${baseRadius},-${baseRadius} C-${baseRadius * 0.6},${baseRadius * 0.3} ${baseRadius * 0.6},-${baseRadius * 0.3} ${baseRadius},${baseRadius}`,
        width: 0.4 + i * 0.1,
        opacity: 0.15 + (i % 5) * 0.06,
        duration: 20 + Math.random() * 15,
        delay: Math.random() * 5,
    };
});

function FloatingPaths({ position }: { position: number }) {
    return (
        <div className="absolute inset-0 pointer-events-none">
            <svg
                className="w-full h-full text-white"
                viewBox="0 0 696 316"
                fill="none"
            >
                <title>Background decoration</title>
                {PATHS_DATA.map((p) => (
                    <motion.path
                        key={p.id}
                        d={p.d}
                        stroke="currentColor"
                        strokeWidth={p.width}
                        strokeOpacity={p.opacity}
                        initial={{ pathLength: 0.3, opacity: 0 }}
                        animate={{
                            pathLength: 1,
                            opacity: [0, p.opacity, 0],
                            pathOffset: [0, 1],
                        }}
                        transition={{
                            duration: p.duration,
                            repeat: Infinity,
                            ease: "linear",
                            delay: p.delay,
                        }}
                        style={{
                            translateX: position,
                            translateY: 0,
                        }}
                    />
                ))}
            </svg>
        </div>
    );
}

interface BackgroundPathsProps {
    title?: string;
    subtitle?: string;
    className?: string;
    children?: React.ReactNode;
}

export function BackgroundPaths({
    title,
    subtitle,
    className,
    children,
}: BackgroundPathsProps) {
    return (
        <div
            className={cn(
                "absolute inset-0 overflow-hidden",
                className
            )}
        >
            <div className="absolute inset-0">
                <FloatingPaths position={-100} />
                <FloatingPaths position={100} />
            </div>
            {/* Optional center content */}
            {(title || subtitle || children) && (
                <div className="relative z-10 flex flex-col items-center justify-center h-full text-center px-4">
                    {title && (
                        <motion.h1
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ duration: 1.5 }}
                            className="text-5xl sm:text-7xl font-black tracking-tighter bg-gradient-to-r from-red-500 via-orange-400 to-cyan-400 bg-clip-text text-transparent"
                        >
                            {title}
                        </motion.h1>
                    )}
                    {subtitle && (
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            className="mt-4 text-sm text-muted-foreground max-w-xl"
                        >
                            {subtitle}
                        </motion.p>
                    )}
                    {children}
                </div>
            )}
        </div>
    );
}
