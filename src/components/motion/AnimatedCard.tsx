import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";

interface AnimatedCardProps {
    children: React.ReactNode;
    className?: string;
    onClick?: () => void;
    hoverScale?: number;
    hoverY?: number;
    glowColor?: string;
}

export default function AnimatedCard({
    children,
    className = "",
    onClick,
    hoverScale = 1.02,
    hoverY = -4,
    glowColor,
}: AnimatedCardProps) {
    return (
        <motion.div
            variants={staggerItem}
            whileHover={{
                y: hoverY,
                scale: hoverScale,
                boxShadow: glowColor
                    ? `0 8px 40px ${glowColor}, inset 0 1px 0 0 hsl(210 40% 96% / 0.08)`
                    : "0 12px 40px rgba(0,0,0,0.4), inset 0 1px 0 0 hsl(210 40% 96% / 0.08)",
                transition: { type: "spring", stiffness: 400, damping: 25 },
            }}
            whileTap={{ scale: 0.98 }}
            onClick={onClick}
            className={`glass-card cursor-pointer ${className}`}
        >
            {children}
        </motion.div>
    );
}
