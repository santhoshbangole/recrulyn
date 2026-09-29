import { motion } from "framer-motion";

export default function DroneRadar() {
  return (
    <div className="relative mx-auto h-80 w-80">
      <div className="absolute inset-0 rounded-full border border-signal-violet/20" />
      <div className="absolute inset-8 rounded-full border border-signal-violet/20" />
      <div className="absolute inset-16 rounded-full border border-signal-violet/20" />
      <div className="absolute inset-24 rounded-full border border-signal-violet/20" />

      <motion.div
        animate={{ rotate: 360 }}
        transition={{
          repeat: Infinity,
          duration: 6,
          ease: "linear",
        }}
        className="
          absolute
          left-1/2
          top-1/2
          h-32
          w-[2px]
          origin-bottom
          -translate-x-1/2
          -translate-y-full
          bg-gradient-to-t
          from-signal-violet
          to-transparent
        "
      />

      <motion.div
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.4, 1, 0.4],
        }}
        transition={{
          repeat: Infinity,
          duration: 2,
        }}
        className="
          absolute
          left-[45%]
          top-[35%]
          h-3
          w-3
          rounded-full
          bg-emerald-500
        "
      />

      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 3,
        }}
        className="
          absolute
          left-[65%]
          top-[60%]
          h-3
          w-3
          rounded-full
          bg-cyan-500
        "
      />

      <motion.div
        animate={{
          scale: [1, 1.4, 1],
          opacity: [0.3, 1, 0.3],
        }}
        transition={{
          repeat: Infinity,
          duration: 2.5,
        }}
        className="
          absolute
          left-[30%]
          top-[70%]
          h-3
          w-3
          rounded-full
          bg-amber-500
        "
      />
    </div>
  );
}