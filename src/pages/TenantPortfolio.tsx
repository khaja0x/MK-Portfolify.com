import { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import PortfolioView from "./PortfolioView";
import { Loader2 } from "lucide-react";

const TenantPortfolio = () => {
    const { tenantId } = useParams<{ tenantId: string }>();
    const [tenant, setTenant] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    useEffect(() => {
        const loadTenant = async () => {
            if (!tenantId) {
                setNotFound(true);
                setLoading(false);
                return;
            }

            try {
                // Load tenant info
                const { data: tenantData, error: tenantError } = await supabase
                    .from('tenants')
                    .select('*')
                    .eq('tenant_id', tenantId)
                    .eq('is_active', true)
                    .single();

                if (tenantError || !tenantData) {
                    console.error('Tenant not found:', tenantError);
                    setNotFound(true);
                    setLoading(false);
                    return;
                }

                setTenant(tenantData);

                // Apply theme if available
                if (tenantData.theme_config) {
                    const theme = tenantData.theme_config;
                    if (theme.primaryColor) {
                        document.documentElement.style.setProperty('--primary-color', theme.primaryColor);
                    }
                    if (theme.darkMode) {
                        document.documentElement.classList.add('dark');
                    }
                }

                setLoading(false);
            } catch (error) {
                console.error('Error loading tenant:', error);
                setNotFound(true);
                setLoading(false);
            }
        };

        loadTenant();
    }, [tenantId]);

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-blue-500 mx-auto mb-4" />
                    <p className="text-gray-600">Loading portfolio...</p>
                </div>
            </div>
        );
    }

    if (notFound) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <h1 className="text-4xl font-bold text-gray-800 mb-4">404</h1>
                    <p className="text-xl text-gray-600 mb-4">Portfolio not found</p>
                    <p className="text-gray-500">The tenant "{tenantId}" does not exist or is inactive.</p>
                </div>
            </div>
        );
    }

    // Render the regular PortfolioView page - it will automatically filter by tenant
    // because we've set up RLS policies
    return <PortfolioView tenantId={tenant.id} />;
};

export default TenantPortfolio;
