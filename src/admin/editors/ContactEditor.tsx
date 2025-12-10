import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

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
        if (!tenant?.id) {
            toast({ title: "Error", description: "Tenant context missing", variant: "destructive" });
            return;
        }

        setLoading(true);

        // Remove id from formData to avoid issues if it's null/undefined
        const { id, ...dataToSave } = formData as any;

        const payload: any = {
            ...dataToSave,
            tenant_id: tenant.id,
            updated_at: new Date()
        };

        if (id) {
            payload.id = id;
        }

        const { error } = await supabase.from("contact_info").upsert(payload, { onConflict: 'tenant_id' });

        if (error) {
            console.error("Error saving contact info:", error);
            if (error.code === '42501') {
                toast({
                    title: "Permission Denied",
                    description: "You do not have permission to edit this tenant.",
                    variant: "destructive"
                });
            } else {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        } else {
            toast({ title: "Success", description: "Contact info updated!" });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Contact Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Email</Label>
                            <Input name="email" value={formData.email} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label>Phone</Label>
                            <Input name="phone" value={formData.phone} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label>Location</Label>
                            <Input name="location" value={formData.location} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label>WhatsApp Number</Label>
                            <Input name="whatsapp" value={formData.whatsapp} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label>LinkedIn URL</Label>
                            <Input name="linkedin" value={formData.linkedin} onChange={handleChange} />
                        </div>

                        <div className="space-y-2">
                            <Label>GitHub URL</Label>
                            <Input name="github" value={formData.github} onChange={handleChange} />
                        </div>
                    </div>

                    <Button onClick={handleSave} disabled={loading} className="w-full">
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default ContactEditor;
