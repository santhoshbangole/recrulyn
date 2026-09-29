import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

import SolutionsHero from "../components/solutions/SolutionsHero";
import SolutionsGrid from "../components/solutions/SolutionsGrid";
import Workflow from "../components/solutions/Workflow";
import WhyChooseUs from "../components/solutions/WhyChooseUs";
import CTA from "../components/solutions/CTA";

export default function SolutionsPage() {
  return (
    <div className="min-h-screen bg-[#fbf9f4] overflow-x-hidden">
      <Navbar />

      <SolutionsHero />

      <SolutionsGrid />

      <Workflow />

      <WhyChooseUs />

      <CTA />

      <Footer />
    </div>
  );
}