import "../../assets/styles/landing.css";

import Navbar from "../components/Navbar";
import Hero from "../components/Hero";
import TrustedBy from "../components/TrustedBy";
import Platform from "../components/Platform";
import ProductShowcase from "../components/ProductShowcase";
import Stats from "../components/Stats";
import CallToAction from "../components/CallToAction";
import Footer from "../components/Footer";

export default function LandingPage() {
  return (
    <div className="landing-page overflow-x-hidden">
      <Navbar />
      <Hero />
      <TrustedBy />
      <Platform />
      <ProductShowcase />
      <Stats />
      <CallToAction />
      <Footer />
    </div>
  );
}