import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

interface SolutionCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  href: string;
}

export default function SolutionCard({
  icon,
  title,
  description,
  href,
}: SolutionCardProps) {
  return (
    <motion.div
      whileHover={{ y: -6 }}
      transition={{ duration: 0.25 }}
    >
      <Link
        to={href}
        className="
          group
          flex
          h-full
          flex-col
          border
          border-[#c4c7c7]
          bg-white
          p-8
          transition-all
          duration-300
          hover:border-[#775a19]
          hover:bg-[#f8f6f1]
        "
      >
        <div
          className="
            mb-6
            flex
            h-12
            w-12
            items-center
            justify-center
            border
            border-[#c4c7c7]
            text-[#1b1c19]
            transition
            group-hover:bg-black
            group-hover:text-white
          "
        >
          {icon}
        </div>

        <h3 className="font-display text-[30px] leading-tight text-[#1b1c19]">
          {title}
        </h3>

        <p className="mt-4 flex-1 text-[16px] leading-8 text-[#444748]">
          {description}
        </p>

        <div className="mt-8 flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.25em] text-[#775a19]">
          Learn More
          <ArrowRight
            size={15}
            className="transition-transform duration-300 group-hover:translate-x-1"
          />
        </div>
      </Link>
    </motion.div>
  );
}