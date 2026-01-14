import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { useNavigate, useParams, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, LogIn, Sparkles } from "lucide-react";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const loginSchema = z.object({
    email: z.string().email("Enter a valid professional email"),
    password: z.string().min(1, "Password is required"),
});

type LoginData = z.infer<typeof loginSchema>;

const Login = () => {
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { toast } = useToast();
    const { tenantId } = useParams<{ tenantId?: string }>();

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginData>({
        resolver: zodResolver(loginSchema),
    });

    const onSubmit = async (data: LoginData) => {
        setLoading(true);

        try {
            const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
                email: data.email,
                password: data.password,
            });

            if (authError) throw new Error(authError.message);

            const { data: adminUsers, error: adminError } = await supabase
                .from('admin_users')
                .select('tenant_id, role')
                .eq('user_id', authData.user.id);

            if (adminError || !adminUsers || adminUsers.length === 0) {
                await supabase.auth.signOut();
                throw new Error('No portfolio access found. Have you registered?');
            }

            const tenantIds = adminUsers.map((au: any) => au.tenant_id);
            const { data: tenants, error: tenantsError } = await supabase
                .from('tenants')
                .select('id, tenant_id, name')
                .in('id', tenantIds);

            if (tenantsError || !tenants || tenants.length === 0) {
                await supabase.auth.signOut();
                throw new Error('Session mismatch. Please contact support.');
            }

            if (tenantId) {
                const hasAccess = tenants.some((t: any) => t.tenant_id === tenantId);
                if (!hasAccess) {
                    await supabase.auth.signOut();
                    throw new Error('Access denied to this portfolio workspace.');
                }
                navigate(`/admin/${tenantId}`);
            } else {
                const firstTenantId = tenants[0]?.tenant_id;
                if (firstTenantId) {
                    navigate(`/admin/${firstTenantId}`);
                } else {
                    throw new Error('Could not resolve your workspace.');
                }
            }

            toast({
                title: "Welcome Back!",
                description: "You've successfully logged in.",
            });

        } catch (error: any) {
            toast({
                title: "Authentication Failed",
                description: error.message || "Invalid credentials provided.",
                variant: "destructive"
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 py-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px]" />
            </div>

            <Card className="w-full max-w-md border-0 shadow-3xl bg-white rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-500 z-10">
                <CardHeader className="pt-12 pb-8 px-8 md:px-12 text-center">
                    <div className="w-16 h-16 bg-slate-900 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-slate-900/10 -rotate-3 transform transition-transform hover:rotate-0">
                        <LogIn size={32} />
                    </div>
                    <CardTitle className="text-4xl font-black text-slate-900 tracking-tight">
                        Admin Login
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-lg mt-2">
                        {tenantId ? (
                            <span className="flex items-center justify-center gap-2">
                                Workspace: <span className="text-sky-500 font-bold">{tenantId}</span>
                            </span>
                        ) : (
                            "Access your portfolio controls"
                        )}
                    </CardDescription>
                </CardHeader>

                <CardContent className="px-8 md:px-12 pb-12">
                    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                <Mail size={16} className="text-slate-400" />
                                Email Address
                            </Label>
                            <Input
                                {...register("email")}
                                type="email"
                                placeholder="name@example.com"
                                className={cn(
                                    "h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 text-lg",
                                    errors.email && "border-red-200 bg-red-50/30"
                                )}
                            />
                            {errors.email && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{errors.email.message}</p>
                            )}
                        </div>

                        <div className="space-y-3">
                            <div className="flex justify-between items-center ml-1">
                                <Label className="text-sm font-bold text-slate-700 flex items-center gap-2">
                                    <Lock size={16} className="text-slate-400" />
                                    Password
                                </Label>
                            </div>
                            <Input
                                {...register("password")}
                                type="password"
                                placeholder="••••••••"
                                className={cn(
                                    "h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 text-lg",
                                    errors.password && "border-red-200 bg-red-50/30"
                                )}
                            />
                            {errors.password && (
                                <p className="text-xs text-red-500 ml-1 font-medium">{errors.password.message}</p>
                            )}
                        </div>

                        <Button
                            type="submit"
                            disabled={loading}
                            className="w-full h-16 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] mt-4"
                        >
                            {loading ? (
                                <div className="flex items-center gap-3">
                                    <Loader2 className="h-6 w-6 animate-spin" />
                                    <span>Entering Vault...</span>
                                </div>
                            ) : (
                                "Sign In"
                            )}
                        </Button>
                    </form>

                    <div className="mt-10 text-center border-t border-slate-50 pt-8">
                        <p className="text-slate-500 font-medium">
                            Need a portfolio?{" "}
                            <Link to="/register" className="text-sky-500 font-black hover:text-sky-600 transition-colors ml-1">
                                Get Started Free
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default Login;
