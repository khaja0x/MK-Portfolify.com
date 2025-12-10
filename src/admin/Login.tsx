import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, useParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { tenantId } = useParams<{ tenantId?: string }>();

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            // Sign in with Supabase
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email,
                password,
            });

            if (authError) {
                throw new Error(authError.message);
            }

            // Get user's admin_users records
            const { data: adminUsers, error: adminError } = await supabase
                .from('admin_users')
                .select('tenant_id, role')
                .eq('user_id', authData.user.id);

            if (adminError || !adminUsers || adminUsers.length === 0) {
                console.log('Admin error or no users:', { adminError, adminUsers });
                await supabase.auth.signOut();
                throw new Error('User is not associated with any tenant. Please register using the registration page.');
            }

            // Get the tenant details
            const tenantIds = adminUsers.map((au: any) => au.tenant_id);
            const { data: tenants, error: tenantsError } = await supabase
                .from('tenants')
                .select('id, tenant_id, name')
                .in('id', tenantIds);

            if (tenantsError || !tenants || tenants.length === 0) {
                console.log('Tenants error:', { tenantsError, tenants });
                await supabase.auth.signOut();
                throw new Error('No tenant found for user');
            }

            console.log('Admin users:', adminUsers);
            console.log('Tenants:', tenants);

            // If tenant ID specified in URL, verify access
            if (tenantId) {
                const hasAccess = tenants.some(
                    (t: any) => t.tenant_id === tenantId
                );

                if (!hasAccess) {
                    await supabase.auth.signOut();
                    throw new Error('Access denied to this tenant');
                }

                navigate(`/admin/${tenantId}`);
            } else {
                // Redirect to first tenant's dashboard
                const firstTenant = tenants[0];
                if (firstTenant?.tenant_id) {
                    navigate(`/admin/${firstTenant.tenant_id}`);
                } else {
                    throw new Error('No tenant found for user');
                }
            }

        } catch (error: any) {
            console.error('Login error:', error);
            toast({
                title: "Login Failed",
                description: error.message || "Invalid credentials",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-md shadow-xl">
                <CardHeader>
                    <CardTitle className="text-center text-2xl">Admin Login</CardTitle>
                    {tenantId && (
                        <p className="text-center text-sm text-gray-600 mt-2">
                            Logging in to: <span className="font-semibold">{tenantId}</span>
                        </p>
                    )}
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <Input
                            type="email"
                            placeholder="Email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                        <Input
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                        <Button type="submit" className="w-full" disabled={loading}>
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Logging in...
                                </>
                            ) : (
                                "Login"
                            )}
                        </Button>
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Don't have an account?{" "}
                        <a href="/register" className="text-blue-600 hover:underline">
                            Register here
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;

