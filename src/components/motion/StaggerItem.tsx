import { motion } from "framer-motion";
import { staggerItem } from "@/lib/motion";

interface StaggerItemProps {
    children: React.ReactNode;
    className?: string;
}

export default function StaggerItem({ children, className = "" }: StaggerItemProps) {
    return (
        <motion.div variants={staggerItem} className={className}>
            {children}
        </motion.div>
    );
}
