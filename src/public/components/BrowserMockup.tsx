// import { motion } from "framer-motion";
// import {
//   Grid2X2,
//   Users,
//   Bot,
//   Sparkles,
//   BadgeCheck,
//   ChartColumn,
// } from "lucide-react";

// type BrowserMockupProps = {
//   image: string;
//   title: string;
// };

// export default function BrowserMockup({
//   image,
//   title,
// }: BrowserMockupProps) {
//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 60 }}
//       whileInView={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.8 }}
//       viewport={{ once: true }}
//       className="relative mt-24 max-w-6xl mx-auto"
//     >
//       <div className="relative border border-[#c4c7c7] bg-white shadow-[40px_40px_80px_-20px_rgba(0,0,0,.05)] aspect-[16/10] overflow-hidden">

//         {/* Sidebar */}

//         <aside className="absolute left-0 top-0 h-full w-20 bg-[#f0eee9] border-r border-[#c4c7c7] flex flex-col items-center py-8 gap-8">

//           <div className="w-10 h-10 border border-black flex items-center justify-center">
//             <Grid2X2 size={18} />
//           </div>

//           <div className="text-gray-400">
//             <Users size={18} />
//           </div>

//           <div className="text-gray-400">
//             <Bot size={18} />
//           </div>

//           <div className="mt-auto w-10 h-10 border border-[#c4c7c7] bg-[#eae8e3]" />
//         </aside>

//         {/* Main */}

//         <div className="ml-20 h-full flex flex-col">

//           {/* Browser Header */}

//           <div className="h-14 border-b border-[#c4c7c7] bg-[#f5f3ee] px-8 flex items-center justify-between">

//             <div className="flex gap-3">
//               <div className="w-2 h-2 border border-[#747878]" />
//               <div className="w-2 h-2 border border-[#747878]" />
//               <div className="w-2 h-2 border border-[#747878]" />
//             </div>

//             <div className="w-64 h-7 border border-[#c4c7c7] bg-white flex items-center justify-center overflow-hidden">
//   <span className="truncate px-2 text-[10px] font-medium text-gray-500">
//     {title}
//   </span>
// </div>

//             <div className="w-10" />

//           </div>

//           {/* Dashboard */}

//           <div className="flex-1 p-12 flex flex-col gap-10">

//             <div className="grid grid-cols-3 gap-8">

//               <div className="h-32 border border-[#c4c7c7] bg-[#f5f3ee]" />

//               <div className="h-32 border border-[#c4c7c7] bg-[#f5f3ee]" />

//               <div className="h-32 border border-[#c4c7c7] bg-[#f5f3ee]" />

//             </div>

//             <div className="flex-1 border border-[#c4c7c7] flex items-center justify-center overflow-hidden">
//   <img
//     src={image}
//     alt={title}
//     className="h-full w-full object-cover"
//   />
// </div>

//               <div className="space-y-4 w-1/2">

//                 <div className="h-px bg-[#c4c7c7] w-1/3 mx-auto" />

//                 <div className="h-px bg-[#c4c7c7] w-full" />

//                 <div className="h-px bg-[#c4c7c7] w-2/3 mx-auto" />

//               </div>

//             </div>

//           </div>

//         </div>

//       </div>

//       {/* Floating Card 1 */}

//       <motion.div
//         animate={{ y: [-6, 6, -6] }}
//         transition={{ repeat: Infinity, duration: 6 }}
//         className="absolute -top-12 -right-10 w-72 bg-white border border-[#c4c7c7] p-8 shadow-xl"
//       >

//         <div className="flex items-center gap-2 mb-5">

//           <Sparkles size={18} className="text-[#775a19]" />

//           <span className="text-[10px] uppercase tracking-[0.25em] font-mono">
//             AI Candidate Match
//           </span>

//         </div>

//         <div className="flex gap-4 items-center">

//           <div className="w-12 h-12 bg-[#f5f3ee]" />

//           <div>

//             <h4 className="font-display text-lg">
//               Alex Rivera
//             </h4>

//             <p className="font-mono text-[10px] uppercase text-[#775a19]">
//               98% Fit Score
//             </p>

//           </div>

//         </div>

//       </motion.div>

//       {/* Floating Card 2 */}

//       <motion.div
//         animate={{ y: [6, -6, 6] }}
//         transition={{ repeat: Infinity, duration: 7 }}
//         className="absolute top-1/2 -left-12 w-72 bg-white border border-[#c4c7c7] p-8 shadow-xl"
//       >

//         <div className="flex items-center gap-2 mb-4">

//           <BadgeCheck size={18} className="text-[#775a19]" />

//           <span className="font-mono text-[10px] uppercase">
//             Offer Generated
//           </span>

//         </div>

//         <h4 className="font-display text-2xl">
//           Senior AI Engineer
//         </h4>

//         <div className="mt-5 h-px bg-[#c4c7c7] relative">

//           <div className="absolute left-0 top-0 h-px w-3/4 bg-black" />

//         </div>

//       </motion.div>

//       {/* Floating Card 3 */}

//       <motion.div
//         animate={{ y: [-8, 8, -8] }}
//         transition={{ repeat: Infinity, duration: 8 }}
//         className="absolute -bottom-10 -right-10 w-72 bg-white border border-[#c4c7c7] p-8 shadow-xl"
//       >

//         <div className="flex justify-between mb-5">

//           <span className="font-mono text-[10px] uppercase">
//             Analytics
//           </span>

//          <ChartColumn
//   size={18}
//   className="text-[#775a19]"
// />

//         </div>

//         <div className="flex items-end gap-2 h-16">

//           <div className="flex-1 bg-[#f5f3ee] h-[40%]" />
//           <div className="flex-1 bg-[#f5f3ee] h-[60%]" />
//           <div className="flex-1 bg-[#f5f3ee] h-[90%]" />
//           <div className="flex-1 bg-[#d4b26d] h-[30%]" />
//           <div className="flex-1 bg-[#f5f3ee] h-[55%]" />

//         </div>

//       </motion.div>

//     </motion.div>
//   );
// }
import { motion } from "framer-motion";
import {
  Grid2X2,
  Users,
  Bot,
  Sparkles,
  BadgeCheck,
  ChartColumn,
} from "lucide-react";

type BrowserMockupProps = {
  image: string;
  title: string;
};

export default function BrowserMockup({
  image,
  title,
}: BrowserMockupProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 60 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      viewport={{ once: true }}
      className="relative mt-24 mx-auto max-w-6xl"
    >
      <div className="relative aspect-[16/10] overflow-hidden border border-[#c4c7c7] bg-white shadow-[40px_40px_80px_-20px_rgba(0,0,0,.05)]">

        {/* Sidebar */}

        <aside className="absolute left-0 top-0 flex h-full w-20 flex-col items-center gap-8 border-r border-[#c4c7c7] bg-[#f0eee9] py-8">

          <div className="flex h-10 w-10 items-center justify-center border border-black">
            <Grid2X2 size={18} />
          </div>

          <div className="text-gray-400">
            <Users size={18} />
          </div>

          <div className="text-gray-400">
            <Bot size={18} />
          </div>

          <div className="mt-auto h-10 w-10 border border-[#c4c7c7] bg-[#eae8e3]" />

        </aside>

        {/* Main */}

        <div className="ml-20 flex h-full flex-col">

          {/* Browser Header */}

          <div className="flex h-14 items-center justify-between border-b border-[#c4c7c7] bg-[#f5f3ee] px-8">

            <div className="flex gap-3">
              <div className="h-2 w-2 border border-[#747878]" />
              <div className="h-2 w-2 border border-[#747878]" />
              <div className="h-2 w-2 border border-[#747878]" />
            </div>

            <div className="flex h-7 w-64 items-center justify-center overflow-hidden border border-[#c4c7c7] bg-white">
              <span className="truncate px-2 text-[10px] font-medium text-gray-500">
                {title}
              </span>
            </div>

            <div className="w-10" />

          </div>

          {/* Dashboard */}

          <div className="flex flex-1 flex-col gap-10 p-12">

            <div className="grid grid-cols-3 gap-8">

              <div className="h-32 border border-[#c4c7c7] bg-[#f5f3ee]" />

              <div className="h-32 border border-[#c4c7c7] bg-[#f5f3ee]" />

              <div className="h-32 border border-[#c4c7c7] bg-[#f5f3ee]" />

            </div>

            <div className="flex flex-1 items-center justify-center overflow-hidden border border-[#c4c7c7]">

              <img
                src={image}
                alt={title}
                className="h-full w-full object-cover"
              />

            </div>

          </div>

        </div>

      </div>

      {/* Floating Card 1 */}

      <motion.div
        animate={{ y: [-6, 6, -6] }}
        transition={{ repeat: Infinity, duration: 6 }}
        className="absolute -right-10 -top-12 w-72 border border-[#c4c7c7] bg-white p-8 shadow-xl"
      >

        <div className="mb-5 flex items-center gap-2">

          <Sparkles
            size={18}
            className="text-[#775a19]"
          />

          <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.25em]">
            AI Candidate Match
          </span>

        </div>

        <div className="flex items-center gap-4">

          <div className="h-12 w-12 bg-[#f5f3ee]" />

          <div>

            <h4 className="font-display text-lg">
              Alex Rivera
            </h4>

            <p className="font-mono text-[10px] uppercase text-[#775a19]">
              98% Fit Score
            </p>

          </div>

        </div>

      </motion.div>

      {/* Floating Card 2 */}

      <motion.div
        animate={{ y: [6, -6, 6] }}
        transition={{ repeat: Infinity, duration: 7 }}
        className="absolute -left-12 top-1/2 w-72 border border-[#c4c7c7] bg-white p-8 shadow-xl"
      >

        <div className="mb-4 flex items-center gap-2">

          <BadgeCheck
            size={18}
            className="text-[#775a19]"
          />

          <span className="font-mono text-[10px] uppercase">
            Offer Generated
          </span>

        </div>

        <h4 className="font-display text-2xl">
          Senior AI Engineer
        </h4>

        <div className="relative mt-5 h-px bg-[#c4c7c7]">

          <div className="absolute left-0 top-0 h-px w-3/4 bg-black" />

        </div>

      </motion.div>

      {/* Floating Card 3 */}

      <motion.div
        animate={{ y: [-8, 8, -8] }}
        transition={{ repeat: Infinity, duration: 8 }}
        className="absolute -bottom-10 -right-10 w-72 border border-[#c4c7c7] bg-white p-8 shadow-xl"
      >

        <div className="mb-5 flex justify-between">

          <span className="font-mono text-[10px] uppercase">
            Analytics
          </span>

          <ChartColumn
            size={18}
            className="text-[#775a19]"
          />

        </div>

        <div className="flex h-16 items-end gap-2">

          <div className="h-[40%] flex-1 bg-[#f5f3ee]" />

          <div className="h-[60%] flex-1 bg-[#f5f3ee]" />

          <div className="h-[90%] flex-1 bg-[#f5f3ee]" />

          <div className="h-[30%] flex-1 bg-[#d4b26d]" />

          <div className="h-[55%] flex-1 bg-[#f5f3ee]" />

        </div>

      </motion.div>

    </motion.div>
  );
}