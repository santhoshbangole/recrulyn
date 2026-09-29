import { motion } from "framer-motion";
import { useState } from "react";

const tabs = [
  "Recruitment",
  "Employees",
  "Documents",
  "Analytics",
];

export default function ProductShowcase() {
  const [active, setActive] = useState("Recruitment");

  return (
    <section className="bg-[#f5f3ee]/40 border-y border-[#c4c7c7]/40 py-32 px-8">

      <div className="max-w-[1440px] mx-auto">

        <motion.div
          initial={{opacity:0,y:40}}
          whileInView={{opacity:1,y:0}}
          viewport={{once:true}}
          className="text-center mb-20"
        >

          <h2 className="font-display text-6xl text-[#1b1c19]">
            See RECRULYN in action.
          </h2>

          <div className="flex justify-center mt-12 flex-wrap">

            {tabs.map((tab)=>{

              const selected=active===tab;

              return(

                <button
                  key={tab}
                  onClick={()=>setActive(tab)}
                  className={`
                    px-10
                    py-4
                    uppercase
                    text-xs
                    tracking-[0.25em]
                    font-mono
                    border
                    transition-all
                    duration-300

                    ${
                      selected
                      ? "bg-black text-white border-black"
                      : "bg-white text-[#444748] border-[#c4c7c7] hover:bg-[#f5f3ee]"
                    }
                  `}
                >
                  {tab}
                </button>

              )

            })}

          </div>

        </motion.div>

        <motion.div

          initial={{opacity:0,y:40}}

          whileInView={{opacity:1,y:0}}

          viewport={{once:true}}

          transition={{duration:.7}}

          className="
          bg-white
          border
          border-[#c4c7c7]
          min-h-[620px]
          overflow-hidden
          "

        >

          {/* Header */}

          <div className="
          flex
          justify-between
          items-center
          border-b
          border-[#c4c7c7]
          px-12
          py-8
          ">

            <div className="h-6 w-64 bg-[#f5f3ee]" />

            <div className="flex gap-4">

              <div className="h-10 w-28 border border-[#c4c7c7]" />

              <div className="h-10 w-36 bg-black" />

            </div>

          </div>

          {/* Dashboard */}

          <div className="grid grid-cols-4 gap-8 p-12">

            <div className="
            border
            border-[#c4c7c7]
            min-h-[420px]
            bg-[#fbf9f4]
            ">

            </div>

            <div className="
            col-span-3
            border
            border-[#c4c7c7]
            min-h-[420px]
            bg-white
            p-8">

              {/* Stats */}

              <div className="grid grid-cols-4 gap-6 mb-10">

                {[1,2,3,4].map((i)=>(
                  <div
                    key={i}
                    className="
                    h-28
                    border
                    border-[#c4c7c7]
                    bg-[#f5f3ee]
                    "
                  />
                ))}

              </div>

              {/* Chart */}

              <div className="
              border
              border-[#c4c7c7]
              h-[250px]
              flex
              items-center
              justify-center
              ">

                <div className="space-y-5 w-2/3">

                  <div className="h-px bg-[#c4c7c7] w-full"/>

                  <div className="h-px bg-[#c4c7c7] w-5/6"/>

                  <div className="h-px bg-[#c4c7c7] w-2/3"/>

                  <div className="h-px bg-[#c4c7c7] w-3/4"/>

                  <div className="h-px bg-[#c4c7c7] w-full"/>

                </div>

              </div>

            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}