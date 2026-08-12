import NavBar from "../components/landing/NavBar.jsx";
import Hero from "../components/landing/Hero.jsx";
import Stats from "../components/landing/Stats.jsx";
import Features from "../components/landing/Features.jsx";
import AgentLab from "../components/landing/AgentLab.jsx";
import Pricing from "../components/landing/Pricing.jsx";
import Faq from "../components/landing/Faq.jsx";
import Footer from "../components/landing/Footer.jsx";

export default function LandingPage() {
  return (
    <div className="bg-background text-on-background font-body-md text-body-md antialiased overflow-x-hidden">
      <NavBar />
      <main className="pt-24 md:pt-32 pb-xl">
        <Hero />
        <Stats />
        <Features />
        <AgentLab />
        <Pricing />
        <Faq />
      </main>
      <Footer />
    </div>
  );
}
