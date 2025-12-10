import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Check, X, Loader2 } from "lucide-react";

const AdminRegister = () => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [checkingAvailability, setCheckingAvailability] = useState(false);
    const [tenantIdAvailable, setTenantIdAvailable] = useState<boolean | null>(null);
    const navigate = useNavigate();
    const { toast } = useToast();

    // Form data
    const [formData, setFormData] = useState({
        userName: "",
        tenantId: "",
        adminEmail: "",
        password: "",
        confirmPassword: "",
    });

    const [manuallyEditedTenantId, setManuallyEditedTenantId] = useState(false);

    // Auto-generate tenant ID from user name
    useEffect(() => {
        if (step === 1 && formData.userName && !manuallyEditedTenantId) {
            const generated = formData.userName
                .toLowerCase()
                .replace(/[^a-z0-9\s-]/g, "")
                .replace(/\s+/g, "-")
                .substring(0, 50);
            setFormData(prev => ({ ...prev, tenantId: generated }));
        }
    }, [formData.userName, step, manuallyEditedTenantId]);

    // Check tenant ID availability
    useEffect(() => {
        const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

        const checkAvailability = async () => {
            if (!formData.tenantId || formData.tenantId.length < 3) {
                setTenantIdAvailable(null);
                return;
            }

            setCheckingAvailability(true);
            try {
                const response = await fetch(
                    `${BASE_URL}/api/tenants/check-availability/${formData.tenantId}`
                );

                if (!response.ok) {
                    console.error('Availability check failed:', response.status);
                    setTenantIdAvailable(false);
                    return;
                }

                const data = await response.json();
                setTenantIdAvailable(data.available);

                if (!data.available && data.reason) {
                    toast({
                        title: "Tenant ID Unavailable",
                        description: data.reason,
                        variant: "destructive",
                    });
                }
            } catch (error) {
                console.error("Error checking availability:", error);
                setTenantIdAvailable(false);
                toast({
                    title: "Connection Error",
                    description: "Unable to check availability. Please ensure the server is running.",
                    variant: "destructive",
                });
            } finally {
                setCheckingAvailability(false);
            }
        };

        const debounce = setTimeout(checkAvailability, 500);
        return () => clearTimeout(debounce);
    }, [formData.tenantId, toast]);

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        const BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5000";

        if (formData.password !== formData.confirmPassword) {
            toast({
                title: "Error",
                description: "Passwords do not match",
                variant: "destructive",
            });
            return;
        }

        if (formData.password.length < 6) {
            toast({
                title: "Error",
                description: "Password must be at least 6 characters",
                variant: "destructive",
            });
            return;
        }

        setLoading(true);

        try {
            const response = await fetch(`${BASE_URL}/api/tenants/register`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    tenantName: formData.userName,
                    tenantId: formData.tenantId,
                    adminEmail: formData.adminEmail,
                    password: formData.password,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || "Registration failed");
            }

            // Store session if provided
            if (data.session) {
                localStorage.setItem("supabase.auth.token", JSON.stringify(data.session));
            }

            toast({
                title: "Success!",
                description: "Your account has been created successfully.",
            });

            // Redirect to admin dashboard
            navigate(`/admin/${data.tenant.tenantId}`);

        } catch (error: any) {
            console.error("Registration error:", error);
            toast({
                title: "Registration Failed",
                description: error.message || "An error occurred during registration",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const nextStep = () => {
        if (step === 1) {
            if (!formData.userName || !formData.tenantId) {
                toast({
                    title: "Missing Information",
                    description: "Please fill in all required fields",
                    variant: "destructive",
                });
                return;
            }
            if (!tenantIdAvailable) {
                toast({
                    title: "Invalid Tenant ID",
                    description: "Please choose an available tenant ID",
                    variant: "destructive",
                });
                return;
            }
        }
        setStep(step + 1);
    };

    const prevStep = () => setStep(step - 1);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
            <Card className="w-full max-w-2xl shadow-xl">
                <CardHeader>
                    <CardTitle className="text-3xl text-center">Create Your Portfolio</CardTitle>
                    <CardDescription className="text-center">
                        Step {step} of 2 - {step === 1 ? "Personal Details" : "Admin Account"}
                    </CardDescription>

                    {/* Progress Bar */}
                    <div className="flex gap-2 mt-4">
                        <div className={`h-2 flex-1 rounded ${step >= 1 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                        <div className={`h-2 flex-1 rounded ${step >= 2 ? 'bg-blue-500' : 'bg-gray-200'}`} />
                    </div>
                </CardHeader>

                <CardContent>
                    <form onSubmit={handleRegister} className="space-y-6">
                        {step === 1 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        User Name <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.userName}
                                        onChange={(e) => setFormData({ ...formData, userName: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Tenant ID <span className="text-red-500">*</span>
                                    </label>
                                    <div className="relative">
                                        <Input
                                            type="text"
                                            placeholder="john-doe"
                                            value={formData.tenantId}
                                            onChange={(e) => {
                                                setFormData({ ...formData, tenantId: e.target.value });
                                                setManuallyEditedTenantId(true);
                                            }}
                                            required
                                            pattern="[a-z0-9\-]+"
                                            minLength={3}
                                            maxLength={50}
                                            className="pr-10"
                                        />
                                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                            {checkingAvailability && <Loader2 className="h-5 w-5 animate-spin text-gray-400" />}
                                            {!checkingAvailability && tenantIdAvailable === true && (
                                                <Check className="h-5 w-5 text-green-500" />
                                            )}
                                            {!checkingAvailability && tenantIdAvailable === false && (
                                                <X className="h-5 w-5 text-red-500" />
                                            )}
                                        </div>
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Your portfolio will be available at: yoursite.com/portfolio/{formData.tenantId || "your-id"}
                                    </p>
                                </div>

                                <Button type="button" onClick={nextStep} className="w-full" disabled={!tenantIdAvailable}>
                                    Next Step
                                </Button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Admin Email <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="email"
                                        placeholder="john@example.com"
                                        value={formData.adminEmail}
                                        onChange={(e) => setFormData({ ...formData, adminEmail: e.target.value })}
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Password <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium mb-2">
                                        Confirm Password <span className="text-red-500">*</span>
                                    </label>
                                    <Input
                                        type="password"
                                        placeholder="••••••••"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                                        required
                                        minLength={6}
                                    />
                                </div>

                                <div className="flex gap-3">
                                    <Button type="button" onClick={prevStep} variant="outline" className="flex-1">
                                        Back
                                    </Button>
                                    <Button type="submit" className="flex-1" disabled={loading}>
                                        {loading ? (
                                            <>
                                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                                Creating...
                                            </>
                                        ) : (
                                            "Create Account"
                                        )}
                                    </Button>
                                </div>
                            </div>
                        )}
                    </form>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        Already have an account?{" "}
                        <a href="/login" className="text-blue-600 hover:underline">
                            Login here
                        </a>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AdminRegister;
