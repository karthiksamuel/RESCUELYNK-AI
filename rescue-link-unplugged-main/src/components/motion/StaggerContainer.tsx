import { motion } from "framer-motion";
import { staggerContainer } from "@/lib/motion";

interface StaggerContainerProps {
    children: React.ReactNode;
    className?: string;
    staggerChildren?: number;
    delayChildren?: number;
}

export default function StaggerContainer({
    children,
    className = "",
    staggerChildren = 0.06,
    delayChildren = 0.1,
}: StaggerContainerProps) {
    return (
        <motion.div
            variants={staggerContainer(staggerChildren, delayChildren)}
            initial="hidden"
            animate="visible"
            className={className}
        >
            {children}
        </motion.div>
    );
}
