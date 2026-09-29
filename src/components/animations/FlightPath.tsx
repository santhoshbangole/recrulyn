import { motion } from "framer-motion";

export default function FlightPath() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <svg
        className="h-full w-full"
        viewBox="0 0 1200 400"
        preserveAspectRatio="none"
      >
        <path
          d="M50 280 C250 50, 450 350, 650 180 S1000 100, 1150 220"
          fill="none"
          stroke="rgba(110,91,255,0.15)"
          strokeWidth="2"
          strokeDasharray="8 8"
        />

        <motion.circle
          r="6"
          fill="#6e5bff"
          animate={{
            offsetDistance: ["0%", "100%"],
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "linear",
          }}
          style={{
            offsetPath:
              'path("M50 280 C250 50, 450 350, 650 180 S1000 100, 1150 220")',
          }}
        />
      </svg>
    </div>
  );
}