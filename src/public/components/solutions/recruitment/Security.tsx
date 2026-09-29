// src/public/components/solutions/recruitment/Security.tsx

import { motion } from "framer-motion";
import {
  ShieldCheck,
  Lock,
  Fingerprint,
  Database,
  BadgeCheck,
  Cloud,
} from "lucide-react";

const security = [
  {
    icon: ShieldCheck,
    title: "Enterprise Security",
    description:
      "Protect recruitment data with enterprise-grade security architecture.",
  },
  {
    icon: Lock,
    title: "Role-Based Access",
    description:
      "Granular permissions ensure every user accesses only what they need.",
  },
  {
    icon: Fingerprint,
    title: "Multi-Factor Authentication",
    description:
      "Secure user authentication with modern MFA protection.",
  },
  {
    icon: Database,
    title: "Encrypted Storage",
    description:
      "Candidate data and documents are encrypted both at rest and in transit.",
  },
  {
    icon: BadgeCheck,
    title: "Audit Logs",
    description:
      "Track every action with detailed activity logs and compliance records.",
  },
  {
    icon: Cloud,
    title: "Cloud Infrastructure",
    description:
      "Highly available cloud architecture built for enterprise workloads.",
  },
];

export default function Security() {
  return (
    <section className="border-y border-[#e8e5df] bg-white py-28">

      <div className="mx-auto max-w-[1200px] px-6">

        <motion.div
          initial={{ opacity: 0, y: 25 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: .6 }}
          className="mx-auto mb-16 max-w-3xl text-center"
        >

          <span className="font-mono text-[11px] uppercase tracking-[0.35em] text-[#775a19]">
            SECURITY
          </span>

          <h2 className="mt-5 font-display text-[54px] leading-tight text-[#1b1c19]">

            Enterprise security
            <br />
            built into every layer.

          </h2>

          <p className="mt-6 text-[18px] leading-8 text-[#555]">

            Your recruitment data remains protected with
            enterprise-grade security, compliance and
            infrastructure.

          </p>

        </motion.div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">

          {security.map((item, index) => {

            const Icon = item.icon;

            return (

              <motion.div
                key={item.title}
                initial={{ opacity: 0, y: 25 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{
                  delay: index * .08,
                  duration: .45,
                }}
                className="
                group
                rounded-2xl
                border
                border-[#e6e3dc]
                bg-[#fbf9f4]
                p-8
                transition-all
                duration-300
                hover:border-green-500
                hover:bg-white
                hover:shadow-xl
                "
              >

                <div className="mb-8 flex h-14 w-14 items-center justify-center rounded-xl bg-green-600 text-white">

                  <Icon size={28} />

                </div>

                <h3 className="font-display text-[28px] leading-tight text-[#1b1c19]">

                  {item.title}

                </h3>

                <p className="mt-5 text-[16px] leading-8 text-[#555]">

                  {item.description}

                </p>

              </motion.div>

            );

          })}

        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          transition={{ delay: .4 }}
          className="
          mt-16
          rounded-3xl
          bg-[#16a34a]
          p-10
          text-white
          "
        >

          <div className="grid gap-8 md:grid-cols-4">

            <div>
              <h3 className="text-5xl font-bold">256-bit</h3>
              <p className="mt-3 text-green-100">
                AES Encryption
              </p>
            </div>

            <div>
              <h3 className="text-5xl font-bold">99.9%</h3>
              <p className="mt-3 text-green-100">
                Platform Uptime
              </p>
            </div>

            <div>
              <h3 className="text-5xl font-bold">24×7</h3>
              <p className="mt-3 text-green-100">
                Monitoring
              </p>
            </div>

            <div>
              <h3 className="text-5xl font-bold">100%</h3>
              <p className="mt-3 text-green-100">
                Secure Infrastructure
              </p>
            </div>

          </div>

        </motion.div>

      </div>

    </section>
  );
}