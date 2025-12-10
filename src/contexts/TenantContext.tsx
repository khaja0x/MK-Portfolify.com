import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface Tenant {
    id: string;
    tenantId: string;
    name: string;
    logoUrl?: string;
    themeConfig?: {
        primaryColor?: string;
        fontFamily?: string;
        darkMode?: boolean;
    };
}

interface TenantContextType {
    currentTenant: Tenant | null;
    setCurrentTenant: (tenant: Tenant | null) => void;
    loadTenant: (tenantId: string) => Promise<boolean>;
    isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export const TenantProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currentTenant, setCurrentTenant] = useState<Tenant | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    const loadTenant = async (tenantId: string): Promise<boolean> => {
        setIsLoading(true);
        try {
            const { data, error } = await supabase
                .from('tenants')
                .select('id, tenant_id, name, logo_url, theme_config')
                .eq('tenant_id', tenantId)
                .eq('is_active', true)
                .single();

            if (error || !data) {
                console.error('Tenant not found:', error);
                setCurrentTenant(null);
                return false;
            }

            setCurrentTenant({
                id: data.id,
                tenantId: data.tenant_id,
                name: data.name,
                logoUrl: data.logo_url,
                themeConfig: data.theme_config,
            });
            return true;
        } catch (error) {
            console.error('Error loading tenant:', error);
            setCurrentTenant(null);
            return false;
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <TenantContext.Provider value={{ currentTenant, setCurrentTenant, loadTenant, isLoading }}>
            {children}
        </TenantContext.Provider>
    );
};

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (context === undefined) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};
