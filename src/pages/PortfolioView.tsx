import ModernTemplate from "@/templates/ModernTemplate";
import MinimalTemplate from "@/templates/MinimalTemplate";
import CreativeTemplate from "@/templates/CreativeTemplate";
import FuturisticTemplate from "@/templates/FuturisticTemplate";

interface PortfolioViewProps {
  /** UUID from tenants.id */
  tenantId: string;

  /** Template identifier from theme_config */
  templateId?: string;
}

const PortfolioView = ({ tenantId, templateId }: PortfolioViewProps) => {

  if (!tenantId) {
    console.error("PortfolioView rendered without tenantId (UUID)");
    return null;
  }


  // Handle template selection
  switch (templateId) {
    case "minimal":
      return <MinimalTemplate tenantId={tenantId} />;
    case "creative":
      return <CreativeTemplate tenantId={tenantId} />;
    case "futuristic":
      return <FuturisticTemplate tenantId={tenantId} />;
    case "modern":
    default:
      return <ModernTemplate tenantId={tenantId} />;
  }

};


export default PortfolioView;

