// import { motion } from "framer-motion";
// import { Play } from "lucide-react";
// import { Link } from "react-router-dom";
// import { heroContainer, heroItem } from "../../lib/motion";
// import BrowserMockup from "./BrowserMockup";
// export default function Hero() {
//   return (
//     <section className="relative px-10 pt-48 pb-32 overflow-hidden bg-[#fbf9f4]">

//       <motion.div
//         variants={heroContainer}
//         initial="hidden"
//         animate="visible"
//         className="max-w-[1440px] mx-auto flex flex-col items-center text-center"
//       >

//         <motion.div
//           variants={heroItem}
//           className="mb-10"
//         >
//           <span className="border border-[#c4c7c7] bg-[#f5f3ee] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em]">
//             VERSION 2.0 · HR DEMO
//           </span>
//         </motion.div>

//         <motion.h1
//           variants={heroItem}
//           className="
//           font-display
//           text-[58px]
//           md:text-[84px]
//           leading-[1.05]
//           tracking-tight
//           text-[#1b1c19]
//           max-w-6xl"
//         >
//           The AI HR workspace for
//           <br />
//           <span className="italic text-[#775a19]">
//             hiring, people, and paperwork.
//           </span>
//         </motion.h1>

//         <motion.p
//           variants={heroItem}
//           className="
//           mt-10
//           max-w-3xl
//           border-l
//           border-r
//           border-[#c4c7c7]
//           px-12
//           text-xl
//           leading-9
//           text-[#444748]"
//         >
//           Recrulyn is the HR operating system for modern teams—source
//           talent, screen resumes, issue LOA/NDA packs, approve leave, and
//           brief leadership from one workspace instead of six tools.
//         </motion.p>

//         <motion.div
//           variants={heroItem}
//           className="mt-14 flex flex-wrap justify-center"
//         >

//           <Link
//             to="/login"
//             className="
//             bg-black
//             text-white
//             px-12
//             py-5
//             uppercase
//             tracking-[0.25em]
//             text-xs
//             font-mono
//             border
//             border-black
//             transition
//             hover:bg-[#30312e]"
//           >
//             Open live demo
//           </Link>

//           <Link
//             to="/resume-demo"
//             className="
//             flex
//             items-center
//             gap-3
//             border
//             border-l-0
//             border-[#c4c7c7]
//             bg-[#f5f3ee]
//             px-12
//             py-5
//             uppercase
//             tracking-[0.25em]
//             text-xs
//             font-mono
//             hover:bg-[#eae8e3]
//             transition"
//           >
//             <Play size={18} />
//             Try resume AI
//           </Link>

//         </motion.div>

//       </motion.div>
// <BrowserMockup />
//     </section>
//   );
// }
import { motion } from "framer-motion";
import { Play } from "lucide-react";
import { Link } from "react-router-dom";
import { heroContainer, heroItem } from "../../lib/motion";
import BrowserMockup from "./BrowserMockup";

export default function Hero() {
  return (
    <section className="relative overflow-hidden bg-[#fbf9f4] px-10 pb-32 pt-48">

      <motion.div
        variants={heroContainer}
        initial="hidden"
        animate="visible"
        className="mx-auto flex max-w-[1440px] flex-col items-center text-center"
      >

        <motion.div
          variants={heroItem}
          className="mb-10"
        >
          <span className="border border-[#c4c7c7] bg-[#f5f3ee] px-5 py-2 font-mono text-[10px] uppercase tracking-[0.3em]">
            VERSION 2.0 · HR DEMO
          </span>
        </motion.div>

        <motion.h1
          variants={heroItem}
          className="
            max-w-6xl
            font-display
            text-[58px]
            leading-[1.05]
            tracking-tight
            text-[#1b1c19]
            md:text-[84px]
          "
        >
          The AI HR workspace for
          <br />
          <span className="italic text-[#775a19]">
            hiring, people, and paperwork.
          </span>
        </motion.h1>

        <motion.p
          variants={heroItem}
          className="
            mt-10
            max-w-3xl
            border-l
            border-r
            border-[#c4c7c7]
            px-12
            text-xl
            leading-9
            text-[#444748]
          "
        >
          Recrulyn is the HR operating system for modern teams—source
          talent, screen resumes, issue LOA/NDA packs, approve leave, and
          brief leadership from one workspace instead of six tools.
        </motion.p>

        <motion.div
          variants={heroItem}
          className="mt-14 flex flex-wrap justify-center"
        >

          <Link
            to="/login"
            className="
              border
              border-black
              bg-black
              px-12
              py-5
              font-mono
              text-xs
              uppercase
              tracking-[0.25em]
              text-white
              transition
              hover:bg-[#30312e]
            "
          >
            Open live demo
          </Link>

          <Link
            to="/resume-demo"
            className="
              flex
              items-center
              gap-3
              border
              border-l-0
              border-[#c4c7c7]
              bg-[#f5f3ee]
              px-12
              py-5
              font-mono
              text-xs
              uppercase
              tracking-[0.25em]
              transition
              hover:bg-[#eae8e3]
            "
          >
            <Play size={18} />
            Try resume AI
          </Link>

        </motion.div>

      </motion.div>

      <BrowserMockup
        image="/screenshots/recruitment.png"
        title="AI Recruitment"
      />

    </section>
  );
}