import { forwardRef } from "react";
import { motion, type HTMLMotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export interface GlassCardProps extends HTMLMotionProps<"div"> {
    /** Glow color — maps to a CSS color or Tailwind utility */
    glow?: "cyan" | "red" | "green" | "amber" | "none";
    /** Enable hover scale + glow intensify */
    hover?: boolean;
    /** Additional className */
    className?: string;
    children?: React.ReactNode;
}

const GLOW_MAP = {
    cyan: "shadow-[0_0_30px_rgba(0,200,255,0.12)] hover:shadow-[0_0_50px_rgba(0,200,255,0.3)]",
    red: "shadow-[0_0_30px_rgba(255,59,59,0.12)] hover:shadow-[0_0_50px_rgba(255,59,59,0.3)]",
    green: "shadow-[0_0_30px_rgba(34,197,94,0.12)] hover:shadow-[0_0_50px_rgba(34,197,94,0.3)]",
    amber: "shadow-[0_0_30px_rgba(245,158,11,0.12)] hover:shadow-[0_0_50px_rgba(245,158,11,0.3)]",
    none: "",
};

/**
 * GlassCard — Reusable glassmorphism card with optional neon glow.
 *
 * Usage:
 *   <GlassCard glow="cyan" hover>content</GlassCard>
 */
export const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
    ({ glow = "cyan", hover = false, className, children, ...props }, ref) => (
        <motion.div
            ref={ref}
            whileHover={hover ? { scale: 1.03 } : undefined}
            whileTap={hover ? { scale: 0.98 } : undefined}
            className={cn(
                // Base glassmorphism
                "bg-white/[0.04] backdrop-blur-xl border border-white/[0.08] rounded-2xl",
                // Glow
                GLOW_MAP[glow],
                // Hover transition
                hover && "cursor-pointer transition-shadow duration-300",
                className,
            )}
            {...props}
        >
            {children}
        </motion.div>
    ),
);

GlassCard.displayName = "GlassCard";
