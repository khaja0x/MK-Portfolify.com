import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Mail, Phone, MapPin, MessageCircle, Linkedin, Github, Loader2, Contact } from "lucide-react";

const ContactEditor = () => {
    const { toast } = useToast();
    const { tenant } = useOutletContext<{ tenant: { id: string; name: string } }>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        email: "",
        phone: "",
        location: "",
        whatsapp: "",
        linkedin: "",
        github: ""
    });

    useEffect(() => {
        if (tenant?.id) {
            fetchContact();
        }
    }, [tenant?.id]);

    const fetchContact = async () => {
        if (!tenant?.id) return;
        const { data } = await supabase
            .from("contact_info")
            .select("*")
            .eq("tenant_id", tenant.id)
            .maybeSingle();
        if (data) setFormData(data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSave = async () => {
        if (!tenant?.id) return;

        setLoading(true);
        const { id, ...dataToSave } = formData as any;
        const payload: any = {
            ...dataToSave,
            tenant_id: tenant.id,
            updated_at: new Date()
        };
        if (id) payload.id = id;

        const { error } = await supabase.from("contact_info").upsert(payload, { onConflict: 'tenant_id' });

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "Contact info updated!" });
        }
        setLoading(false);
    };

    const fields = [
        { name: "email", label: "Email Address", icon: Mail, placeholder: "hello@example.com" },
        { name: "phone", label: "Phone Number", icon: Phone, placeholder: "+1 (555) 000-0000" },
        { name: "location", label: "Location", icon: MapPin, placeholder: "City, Country" },
        { name: "whatsapp", label: "WhatsApp Number", icon: MessageCircle, placeholder: "Include country code" },
        { name: "linkedin", label: "LinkedIn Profile", icon: Linkedin, placeholder: "linkedin.com/in/username" },
        { name: "github", label: "GitHub Profile", icon: Github, placeholder: "github.com/username" },
    ];

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-2xl bg-white rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
                            <Contact size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Edit Contact Information</h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
                        {fields.map((field) => (
                            <div key={field.name} className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 ml-1">{field.label}</Label>
                                <div className="relative">
                                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                                        <field.icon size={18} />
                                    </div>
                                    <Input
                                        name={field.name}
                                        value={formData[field.name as keyof typeof formData]}
                                        onChange={handleChange}
                                        placeholder={field.placeholder}
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl pl-14 pr-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                                    />
                                </div>
                            </div>
                        ))}
                    </div>

                    <Button
                        onClick={handleSave}
                        disabled={loading}
                        className="w-full h-16 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] mt-10"
                    >
                        {loading ? (
                            <span className="flex items-center gap-2">
                                <Loader2 className="w-5 h-5 animate-spin" />
                                Saving Changes...
                            </span>
                        ) : (
                            "Save Changes"
                        )}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ContactEditor;
