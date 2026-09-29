// src/public/components/solutions/recruitment/FAQ.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

const faqs = [
  {
    question: "How does AI resume parsing work?",
    answer:
      "RECRULYN automatically extracts candidate details such as name, email, phone number, education, work experience, technical skills and certifications from PDF or DOCX resumes.",
  },
  {
    question: "Can I upload multiple resumes at once?",
    answer:
      "Yes. Recruiters can upload resumes individually or in bulk. AI processes every resume automatically and prepares candidate profiles within seconds.",
  },
  {
    question: "How is the AI Match Score calculated?",
    answer:
      "The AI compares candidate skills, experience, education and keywords against the job description to generate an intelligent match score.",
  },
  {
    question: "Does RECRULYN support interview scheduling?",
    answer:
      "Yes. Recruiters can shortlist candidates, schedule interviews and track the complete hiring pipeline from one dashboard.",
  },
  {
    question: "Is candidate data secure?",
    answer:
      "Absolutely. All candidate information is securely stored with encryption, role-based access control and enterprise-grade security practices.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="bg-[#fbf9f4] py-28">

      <div className="mx-auto max-w-[900px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mb-16 text-center"
        >

          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            FAQ
          </span>

          <h2 className="mt-5 font-display text-[54px] leading-tight text-[#1b1c19]">
            Frequently Asked
            <br />
            Questions
          </h2>

          <p className="mt-6 text-[18px] leading-8 text-[#555]">
            Everything you need to know about
            AI Recruitment with RECRULYN.
          </p>

        </motion.div>

        <div className="space-y-5">

          {faqs.map((faq, index) => {

            const isOpen = open === index;

            return (

              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * 0.08,
                }}
                className="overflow-hidden rounded-2xl border border-[#e5e2dd] bg-white"
              >

                <button
                  onClick={() =>
                    setOpen(isOpen ? null : index)
                  }
                  className="flex w-full items-center justify-between px-8 py-7 text-left"
                >

                  <h3 className="font-display text-[26px] text-[#1b1c19]">
                    {faq.question}
                  </h3>

                  <ChevronDown
                    size={22}
                    className={`transition duration-300 ${
                      isOpen ? "rotate-180" : ""
                    }`}
                  />

                </button>

                <AnimatePresence>

                  {isOpen && (

                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{
                        height: "auto",
                        opacity: 1,
                      }}
                      exit={{
                        height: 0,
                        opacity: 0,
                      }}
                      transition={{ duration: 0.25 }}
                    >

                      <div className="border-t border-[#ece9e3] px-8 py-6">

                        <p className="text-[17px] leading-8 text-[#555]">
                          {faq.answer}
                        </p>

                      </div>

                    </motion.div>

                  )}

                </AnimatePresence>

              </motion.div>

            );

          })}

        </div>

      </div>

    </section>
  );
}