
import { useEffect, useRef, useState } from "react";
import { useParams, Link } from "react-router-dom";

import { supabase } from "@/lib/supabase";
import PortfolioView from "./PortfolioView";
import { Loader2, Rocket, Globe, Home, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tenant {
  id: string; // UUID
  tenant_id: string; // slug
  theme_config?: {
    primaryColor?: string;
    darkMode?: boolean;
    templateId?: string;
  };
}

const TenantPortfolio = () => {

  const { tenantId: tenantSlug } = useParams<{ tenantId: string }>();
  const [tenant, setTenant] = useState<Tenant | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const viewIncrementedRef = useRef(false);

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
          .eq("tenant_id", tenantSlug)
          .eq("is_active", true)
          .single();

        if (error || !data) {
          setNotFound(true);
          return;
        }

        setTenant(data);

        // 🎨 Apply theme
        if (data.theme_config) {
          const { primaryColor, darkMode } = data.theme_config;

          if (primaryColor) {
            document.documentElement.style.setProperty(
              "--primary-color",
              primaryColor
            );
          }

          document.documentElement.classList.toggle("dark", Boolean(darkMode));
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

  useEffect(() => {
    if (!tenant?.id || viewIncrementedRef.current) return;

    viewIncrementedRef.current = true;

    supabase.rpc("increment_portfolio_view", {
      t_id: tenant.id,
    });
  }, [tenant]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 text-white">
        <div className="relative">
          <div className="w-24 h-24 bg-sky-500/20 rounded-full flex items-center justify-center animate-pulse">
            <Rocket className="h-10 w-10 text-sky-500" />
          </div>
          <Loader2 className="h-24 w-24 animate-spin text-sky-500 absolute inset-0 opacity-20" />
        </div>
        <div className="mt-8 text-center">
          <h2 className="text-2xl font-black tracking-tight mb-2">Preparing Experience</h2>
          <p className="text-slate-400 font-medium">Gathering assets for {tenantSlug}...</p>

        </div>
      </div>
    );
  }


  if (notFound || !tenant) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-slate-950 px-6 py-20 relative overflow-hidden text-center">
        {/* Decorative Background */}
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/5 rounded-full blur-[120px]" />

        <div className="relative z-10 max-w-lg">
          <div className="w-24 h-24 bg-slate-900 border border-slate-800 rounded-[2rem] flex items-center justify-center mx-auto mb-10 shadow-2xl">
            <Globe className="h-12 w-12 text-slate-400" />
          </div>

          <h1 className="text-7xl font-black text-white mb-6">404</h1>
          <h2 className="text-3xl font-bold text-slate-200 mb-4">Portfolio Disconnected</h2>
          <p className="text-slate-400 text-lg leading-relaxed mb-12">
            The workspace <span className="text-sky-400 font-bold">"{tenantSlug}"</span> either doesn't exist, is inactive, or has been relocated to another dimension.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link to="/">
              <Button size="lg" className="h-14 px-8 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black shadow-lg shadow-sky-500/20">
                <Home className="mr-2 h-5 w-5" /> Back to Home
              </Button>
            </Link>
            <Button variant="ghost" className="h-14 px-8 rounded-2xl text-slate-400 font-bold hover:bg-slate-900" onClick={() => window.history.back()}>
              <ArrowLeft className="mr-2 h-5 w-5" /> Return Previous
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <PortfolioView
      tenantId={tenant.id}
      templateId={tenant.theme_config?.templateId}
    />
  );

};

export default TenantPortfolio;
