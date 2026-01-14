import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2, User, Globe, Mail, Lock, ArrowRight, ArrowLeft, Rocket, Sparkles, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import { Label } from "@/components/ui/label";

// Validation Schemas
const step1Schema = z.object({
    userName: z.string().min(2, "Name must be at least 2 characters"),
    tenantId: z.string()
        .min(3, "ID must be at least 3 characters")
        .max(50, "ID too long")
        .regex(/^[a-z0-9-]+$/, "Use only lowercase letters, numbers, and hyphens"),
});

const step2Schema = z.object({
    adminEmail: z.string().email("Enter a valid professional email"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    confirmPassword: z.string().min(6, "Please confirm your password"),
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
});

type Step1Data = z.infer<typeof step1Schema>;
type Step2Data = z.infer<typeof step2Schema>;

const AdminRegister = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [tenantIdAvailable, setTenantIdAvailable] = useState<boolean | null>(null);
    const [manuallyEditedTenantId, setManuallyEditedTenantId] = useState(false);

    const navigate = useNavigate();
    const { toast } = useToast();

    // Step 1 Form
    const step1Form = useForm<Step1Data>({
        resolver: zodResolver(step1Schema),
        defaultValues: {
            userName: "",
            tenantId: "",
        },
        mode: "onChange"
    });

    // Step 2 Form
    const step2Form = useForm<Step2Data>({
        resolver: zodResolver(step2Schema),
        defaultValues: {
            adminEmail: "",
            password: "",
            confirmPassword: "",
        },
        mode: "onChange"
    });

    const userName = step1Form.watch("userName");
    const tenantId = step1Form.watch("tenantId");

    // Auto-generate tenant ID from user name
    useEffect(() => {
        if (step === 1 && userName && !manuallyEditedTenantId) {
            const generated = userName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .substring(0, 50);
            step1Form.setValue("tenantId", generated, { shouldValidate: true });
        }
    }, [userName, step, manuallyEditedTenantId, step1Form]);

    // Check tenant ID availability
    useEffect(() => {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        const checkAvailability = async () => {
            if (!tenantId || tenantId.length < 3) {
                setTenantIdAvailable(null);
                return;
            }

            setCheckingAvailability(true);
            try {
                const response = await fetch(

                    `${SUPABASE_URL}/functions/v1/tenant-lookup/check-availability/${tenantId}`,

                    {
                        headers: {
                            "apikey": SUPABASE_ANON_KEY,
                            "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
                        }
                    }
                );

                if (!response.ok) {
                    setTenantIdAvailable(false);
                    return;
                }

                const data = await response.json();
                setTenantIdAvailable(data.available);

                if (!data.available && data.reason) {
                    step1Form.setError("tenantId", { message: data.reason });
                }
            } catch (error) {
                console.error("Error checking availability:", error);
                setTenantIdAvailable(false);


            } finally {
                setCheckingAvailability(false);
            }
        };

        const debounce = setTimeout(checkAvailability, 500);
        return () => clearTimeout(debounce);
    }, [tenantId, step1Form]);


    const handleNext = async () => {
        const isValid = await step1Form.trigger();
        if (isValid && tenantIdAvailable) {
            setStep(2);
        } else if (!tenantIdAvailable) {

            toast({
                title: "Validation Error",
                description: "This portfolio ID is already taken. Please try another.",
                variant: "destructive"
            });
        }
    };

    const onSubmit = async (data2: Step2Data) => {
        const data1 = step1Form.getValues();
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
        const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

        setLoading(true);
        try {
            const response = await fetch(`${SUPABASE_URL}/functions/v1/tenant-register`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "apikey": SUPABASE_ANON_KEY,
                    "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
                },
                body: JSON.stringify({
                    tenantName: data1.userName,
                    tenantId: data1.tenantId,
                    adminEmail: data2.adminEmail,
                    password: data2.password,
                }),
            });

            const result = await response.json();

            if (!response.ok) {

                throw new Error(result.error || "Registration failed");
            }

            toast({
                title: "Welcome to Portfolify!",
                description: `Your space is ready at /portfolio/${result.tenant.tenantId}`,
            });

            navigate(`/admin/${result.tenant.tenantId}`);


        } catch (error: any) {
            toast({
                title: "Registration Failed",
                description: error.message || "Something went wrong during account creation.",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex items-center justify-center min-h-screen bg-slate-950 px-4 py-12 relative overflow-hidden">
            {/* Background Decorations */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px]" />
            </div>

            <Card className="w-full max-w-xl border-0 shadow-3xl bg-white rounded-[2.5rem] overflow-hidden animate-in fade-in zoom-in-95 duration-500 z-10">
                <CardHeader className="pt-12 pb-8 px-8 md:px-12 text-center">
                    <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center text-white mx-auto mb-6 shadow-xl shadow-sky-500/20 rotate-3 transform transition-transform hover:rotate-0">
                        <Rocket size={32} />
                    </div>
                    <CardTitle className="text-4xl font-black text-slate-900 tracking-tight">
                        Launch Your Site
                    </CardTitle>
                    <CardDescription className="text-slate-500 text-lg mt-2">
                        {step === 1 ? "Step 1: Define your presence" : "Step 2: Secure your controls"}
                    </CardDescription>

                    {/* Modern Progress Bar */}
                    <div className="flex gap-3 mt-8 max-w-[200px] mx-auto">
                        <div className={cn("h-2.5 flex-1 rounded-full transition-all duration-500", step >= 1 ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]" : "bg-slate-100")} />
                        <div className={cn("h-2.5 flex-1 rounded-full transition-all duration-500", step >= 2 ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.4)]" : "bg-slate-100")} />
                    </div>
                </CardHeader>

                <CardContent className="px-8 md:px-12 pb-12">
                    {step === 1 ? (
                        <div className="space-y-8 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                    <User size={16} className="text-slate-400" />
                                    Your Full Name
                                </Label>
                                <Input
                                    {...step1Form.register("userName")}
                                    placeholder="e.g. Alex Rivera"
                                    className={cn(
                                        "h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 text-lg",
                                        step1Form.formState.errors.userName && "border-red-200 bg-red-50/30"
                                    )}
                                />
                                {step1Form.formState.errors.userName && (
                                    <p className="text-xs text-red-500 ml-1 font-medium">{step1Form.formState.errors.userName.message}</p>
                                )}
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                    <Globe size={16} className="text-slate-400" />
                                    Your Portfolio URL slug
                                </Label>
                                <div className="relative">
                                    <Input
                                        {...step1Form.register("tenantId")}
                                        placeholder="alex-rivera"
                                        onChange={(e) => {
                                            step1Form.setValue("tenantId", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""), { shouldValidate: true });
                                            setManuallyEditedTenantId(true);
                                        }}
                                        className={cn(
                                            "h-14 bg-slate-50 border-slate-100 rounded-2xl pl-6 pr-12 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 font-mono tracking-tight",
                                            tenantIdAvailable === false && "border-red-200 bg-red-50/30"
                                        )}
                                    />
                                    <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center">
                                        {checkingAvailability ? (
                                            <Loader2 className="h-5 w-5 animate-spin text-slate-300" />
                                        ) : tenantIdAvailable === true ? (
                                            <div className="bg-green-100 text-green-600 p-1 rounded-full"><Check size={14} strokeWidth={3} /></div>
                                        ) : tenantIdAvailable === false ? (
                                            <div className="bg-red-100 text-red-600 p-1 rounded-full"><X size={14} strokeWidth={3} /></div>
                                        ) : null}
                                    </div>
                                </div>
                                {step1Form.formState.errors.tenantId && (
                                    <p className="text-xs text-red-500 ml-1 font-medium">{step1Form.formState.errors.tenantId.message}</p>
                                )}
                                <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100">
                                    <p className="text-xs text-slate-400 flex items-center gap-2">
                                        <Sparkles size={12} className="text-sky-400" />
                                        Preview: <span className="text-slate-600 font-bold select-all">/portfolio/{tenantId || '...'}</span>
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={handleNext}
                                className="w-full h-16 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] group"
                            >
                                Continue Adventure
                                <ArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={step2Form.handleSubmit(onSubmit)} className="space-y-6 animate-in slide-in-from-right-4 duration-300">
                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                    <Mail size={16} className="text-slate-400" />
                                    Work Email
                                </Label>
                                <Input
                                    {...step2Form.register("adminEmail")}
                                    type="email"
                                    placeholder="alex@example.com"
                                    className={cn(
                                        "h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 text-lg",
                                        step2Form.formState.errors.adminEmail && "border-red-200 bg-red-50/30"
                                    )}
                                />
                                {step2Form.formState.errors.adminEmail && (
                                    <p className="text-xs text-red-500 ml-1 font-medium">{step2Form.formState.errors.adminEmail.message}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                        <Lock size={16} className="text-slate-400" />
                                        Secret Password
                                    </Label>
                                    <Input
                                        {...step2Form.register("password")}
                                        type="password"
                                        placeholder="••••••••"
                                        className={cn(
                                            "h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 text-lg",
                                            step2Form.formState.errors.password && "border-red-200 bg-red-50/30"
                                        )}
                                    />
                                    {step2Form.formState.errors.password && (
                                        <p className="text-xs text-red-500 ml-1 font-medium">{step2Form.formState.errors.password.message}</p>
                                    )}
                                </div>

                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                        <ShieldCheck size={16} className="text-slate-400" />
                                        Match it
                                    </Label>
                                    <Input
                                        {...step2Form.register("confirmPassword")}
                                        type="password"
                                        placeholder="••••••••"
                                        className={cn(
                                            "h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 text-lg",
                                            step2Form.formState.errors.confirmPassword && "border-red-200 bg-red-50/30"
                                        )}
                                    />
                                    {step2Form.formState.errors.confirmPassword && (
                                        <p className="text-xs text-red-500 ml-1 font-medium">{step2Form.formState.errors.confirmPassword.message}</p>
                                    )}
                                </div>
                            </div>

                            <div className="flex gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => setStep(1)}
                                    className="h-16 flex-1 rounded-2xl text-lg font-bold text-slate-500 hover:bg-slate-50 group"
                                >
                                    <ArrowLeft className="mr-2 group-hover:-translate-x-1 transition-transform" />
                                    Back
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={loading}
                                    className="h-16 flex-[2] bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98]"
                                >
                                    {loading ? (
                                        <div className="flex items-center gap-3">
                                            <Loader2 className="h-6 w-6 animate-spin" />
                                            <span>Igniting Engines...</span>
                                        </div>
                                    ) : (
                                        "Let's Go!"
                                    )}
                                </Button>
                            </div>
                        </form>
                    )}

                    <div className="mt-10 text-center border-t border-slate-50 pt-8">
                        <p className="text-slate-500 font-medium">
                            Already have account?{" "}
                            <Link to="/login" className="text-sky-500 font-black hover:text-sky-600 transition-colors ml-1">
                                Sign In
                            </Link>
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminRegister;
