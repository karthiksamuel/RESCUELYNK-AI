import * as React from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";

type ContainerScrollProps = {
  titleComponent: React.ReactNode;
  children: React.ReactNode;
};

export const ContainerScroll: React.FC<ContainerScrollProps> = ({ titleComponent, children }) => {
  const containerRef = React.useRef<HTMLDivElement | null>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"],
  });

  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 80,
    damping: 20,
    mass: 0.4,
  });

  const rotateX = useTransform(smoothProgress, [0, 1], [12, -12]);
  const scale = useTransform(smoothProgress, [0, 0.5, 1], [0.9, 1, 0.92]);
  const translateY = useTransform(smoothProgress, [0, 1], [40, -60]);

  const titleY = useTransform(smoothProgress, [0, 1], [0, -80]);
  const titleOpacity = useTransform(smoothProgress, [0, 0.4], [1, 0.65]);

  return (
    <section
      ref={containerRef}
      className="relative flex min-h-[140vh] w-full items-center justify-center overflow-visible bg-[#020617] py-20 text-white"
    >
      <div className="pointer-events-none pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -left-40 top-10 h-72 w-72 rounded-full bg-[#ff3b3b]/25 blur-3xl" />
        <div className="absolute -right-32 top-48 h-80 w-80 rounded-full bg-[#3b82f6]/25 blur-3xl" />
        <div className="absolute inset-x-10 bottom-[-12rem] h-64 rounded-[4rem] bg-gradient-to-t from-[#020617] via-transparent to-transparent blur-3xl" />
      </div>

      <div className="container relative flex max-w-6xl flex-col items-center gap-10 px-4 md:flex-row md:items-start md:gap-16">
        <motion.div
          style={{ y: titleY, opacity: titleOpacity }}
          className="w-full max-w-xl space-y-4 text-center md:text-left"
        >
          {titleComponent}
        </motion.div>

        <div className="pointer-events-none relative mt-10 flex w-full justify-center md:mt-0 md:justify-end">
          <motion.div
            style={{ rotateX, scale, y: translateY }}
            className="pointer-events-auto relative h-[360px] w-full max-w-[420px] origin-center rounded-[32px] border border-white/8 bg-gradient-to-b from-white/[0.06] via-white/[0.02] to-black/40 p-[1px] shadow-[0_40px_120px_rgba(0,0,0,0.85)] md:h-[460px] md:max-w-[520px]"
          >
            <div className="relative h-full w-full overflow-hidden rounded-[30px] bg-[#020617]">
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-[#ff3b3b]/10 via-transparent to-[#3b82f6]/10" />
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,59,59,0.18),transparent_55%),_radial-gradient(circle_at_bottom,_rgba(59,130,246,0.2),transparent_55%)]" />

              <div className="relative h-full w-full">{children}</div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

