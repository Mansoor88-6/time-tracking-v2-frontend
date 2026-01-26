import React from "react";
import OptimizedNavbar from "./_components/OptimizedNavbar/OptimizedNavbar";
import TypographyHero from "./_components/TypographyHero/TypographyHero";
import PKIFeatures from "./_components/PKIFeatures/PKIFeatures";
import Pricing from "./_components/Pricing/Pricing";
import SoftwareUseCases from "./_components/SoftwareUseCases/SoftwareUseCases";
import MarqueeTestimonials from "./_components/MarqueeTestimonials/MarqueeTestimonials";
import PKIContact from "./_components/PKIContact/PKIContact";
import PKIFooter from "./_components/PKIFooter/PKIFooter";

const Home = () => {
  return (
    <div className="min-h-screen">
      <OptimizedNavbar />
      <TypographyHero />
      <PKIFeatures />
      <Pricing />
      <SoftwareUseCases />
      <MarqueeTestimonials />
      <PKIContact />
      <PKIFooter />
    </div>
  );
};

export default Home;
