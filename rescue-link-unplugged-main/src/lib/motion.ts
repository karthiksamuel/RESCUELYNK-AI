import type { Variants, Transition, Easing } from "framer-motion";

// ─── Transitions ───────────────────────────────────────────────
export const springTransition: Transition = {
    type: "spring",
    stiffness: 300,
    damping: 30,
};

export const smoothTransition: Transition = {
    duration: 0.5,
    ease: [0.25, 0.46, 0.45, 0.94],
};

export const gentleTransition: Transition = {
    duration: 0.6,
    ease: [0.22, 1, 0.36, 1],
};

// ─── Page Transitions ──────────────────────────────────────────
export const pageVariants: Variants = {
    initial: { opacity: 0, y: 20, filter: "blur(4px)" },
    animate: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] },
    },
    exit: {
        opacity: 0,
        y: -10,
        filter: "blur(4px)",
        transition: { duration: 0.3, ease: "easeIn" },
    },
};

// ─── Stagger Orchestration ─────────────────────────────────────
export const staggerContainer = (
    staggerChildren = 0.06,
    delayChildren = 0.1
): Variants => ({
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren, delayChildren },
    },
});

export const staggerItem: Variants = {
    hidden: { opacity: 0, y: 20, filter: "blur(2px)" },
    visible: {
        opacity: 1,
        y: 0,
        filter: "blur(0px)",
        transition: { duration: 0.45, ease: [0.25, 0.46, 0.45, 0.94] },
    },
};

// ─── Common Entrance Variants ──────────────────────────────────
export const slideInLeft: Variants = {
    hidden: { opacity: 0, x: -30 },
    visible: { opacity: 1, x: 0, transition: smoothTransition },
};

export const slideInRight: Variants = {
    hidden: { opacity: 0, x: 30 },
    visible: { opacity: 1, x: 0, transition: smoothTransition },
};

export const slideUp: Variants = {
    hidden: { opacity: 0, y: 30 },
    visible: { opacity: 1, y: 0, transition: smoothTransition },
};

export const scaleIn: Variants = {
    hidden: { opacity: 0, scale: 0.85 },
    visible: { opacity: 1, scale: 1, transition: springTransition },
};

export const fadeIn: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { duration: 0.4 } },
};

// ─── Card Hover / Tap ──────────────────────────────────────────
export const cardHover = {
    whileHover: {
        y: -4,
        scale: 1.02,
        transition: { type: "spring", stiffness: 400, damping: 25 },
    },
    whileTap: { scale: 0.98 },
};

export const buttonTap = {
    whileHover: { scale: 1.04 },
    whileTap: { scale: 0.96 },
};

// ─── Micro-interactions ────────────────────────────────────────
export const pulseGlow = {
    animate: {
        boxShadow: [
            "0 0 20px hsla(0, 0%, 100%, 0.05)",
            "0 0 40px hsla(0, 0%, 100%, 0.1)",
            "0 0 20px hsla(0, 0%, 100%, 0.05)",
        ],
    },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
};

export const floatingAnimation = {
    animate: { y: [0, -6, 0] },
    transition: { duration: 4, repeat: Infinity, ease: "easeInOut" as const },
};

export const breathingScale = {
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 3, repeat: Infinity, ease: "easeInOut" as const },
};
