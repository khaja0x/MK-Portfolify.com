import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";

interface PortfolioViewProps {
  /** UUID from tenants.id */
  tenantId: string;
}

const PortfolioView = ({ tenantId }: PortfolioViewProps) => {
  if (!tenantId) {
    console.error("PortfolioView rendered without tenantId (UUID)");
    return null;
  }

  return (
    <div className="min-h-screen">
      <Navigation tenantId={tenantId} />
      <Hero tenantId={tenantId} />
      <About tenantId={tenantId} />
      <Skills tenantId={tenantId} />
      <Projects tenantId={tenantId} />
      <Experience tenantId={tenantId} />
      <Contact tenantId={tenantId} />
      <Footer tenantId={tenantId} />
    </div>
  );
};

export default PortfolioView;
