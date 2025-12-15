
import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import PortfolioView from "./PortfolioView";
import { Loader2 } from "lucide-react";

const TenantPortfolio = () => {
  const { tenantId: tenantSlug } = useParams(); // slug from URL
  const [tenant, setTenant] = useState(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    const loadTenant = async () => {
      if (!tenantSlug) {
        setNotFound(true);
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("tenants")
          .select("id, tenant_id, theme_config")
          .eq("tenant_id", tenantSlug) // slug match
          .eq("is_active", true)
          .single();

        if (error || !data) {
          console.error("Tenant not found:", error);
          setNotFound(true);
          setLoading(false);
          return;
        }

        setTenant(data);

        // Apply theme
        if (data.theme_config) {
          const theme = data.theme_config;

          if (theme.primaryColor) {
            document.documentElement.style.setProperty(
              "--primary-color",
              theme.primaryColor
            );
          }

          document.documentElement.classList.toggle(
            "dark",
            Boolean(theme.darkMode)
          );
        }
      } catch (err) {
        console.error("Tenant load error:", err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };

    loadTenant();
  }, [tenantSlug]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Loader2 className="h-12 w-12 animate-spin text-blue-500" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-4xl font-bold mb-2">404</h1>
          <p className="text-gray-600">
            Portfolio <b>{tenantSlug}</b> not found or inactive.
          </p>
        </div>
      </div>
    );
  }

  // ✅ PASS UUID (NOT SLUG)
  return <PortfolioView tenantId={tenant.id} />;
};

export default TenantPortfolio;
