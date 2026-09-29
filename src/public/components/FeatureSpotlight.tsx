import { ArrowRight } from "lucide-react";
import { motion } from "framer-motion";
import BrowserMockup from "./BrowserMockup";
const features = [
  {
    title: "AI Recruitment",
    description: "...",
    image: "/screenshots/recruitment.png",
  },
  {
    title: "Resume Intelligence",
    description: "...",
    image: "/screenshots/resume.png",
  },
  {
    title: "Document Automation",
    description: "...",
    image: "/screenshots/documents.png",
  },
  {
    title: "Enterprise Analytics",
    description: "...",
    image: "/screenshots/analytics.png",
  },
];

export default function FeatureSpotlight() {
  return (
    <section className="bg-gray-50 py-32">
      <div className="mx-auto max-w-7xl px-6">

        <div className="text-center">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-green-700">
            PLATFORM HIGHLIGHTS
          </p>

          <h2 className="mt-5 text-5xl font-bold text-gray-900">
            Experience every module in action.
          </h2>
        </div>

        <div className="mt-24 space-y-32">

          {features.map((feature, index) => (

            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
              className={`grid items-center gap-16 lg:grid-cols-2 ${
                index % 2 === 1 ? "lg:[&>*:first-child]:order-2" : ""
              }`}
            >

              <div>

                <h3 className="text-4xl font-bold text-gray-900">
                  {feature.title}
                </h3>

                <p className="mt-6 text-lg leading-8 text-gray-600">
                  {feature.description}
                </p>

                <button className="mt-8 flex items-center gap-2 rounded-xl bg-green-600 px-6 py-3 font-semibold text-white transition hover:bg-green-700">
                  Learn More
                  <ArrowRight size={18} />
                </button>

              </div>

           <div className="rounded-3xl">

  <BrowserMockup
    image={feature.image}
    title={feature.title}
  />

</div>
            </motion.div>

          ))}

        </div>

      </div>
    </section>
  );
}