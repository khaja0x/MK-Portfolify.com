import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const HeroEditor = () => {
    const { toast } = useToast();
    const { tenant } = useOutletContext<{ tenant: { id: string; name: string } }>();
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: "",
        title: "",
        subtitle: "",
        cta_text: "",
        cta_link: "",
        resume_url: "",
        social_links: { github: "", linkedin: "", twitter: "", email: "" }
    });

    useEffect(() => {
        if (tenant?.id) {
            fetchHero();
        }
    }, [tenant?.id]);

    const fetchHero = async () => {
        if (!tenant?.id) return;

        const { data, error } = await supabase
            .from("hero")
            .select("*")
            .eq("tenant_id", tenant.id)
            .maybeSingle();

        if (data) {
            setFormData({
                ...data,
                social_links: data.social_links || { github: "", linkedin: "", twitter: "", email: "" }
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({
            ...formData,
            social_links: { ...formData.social_links, [e.target.name]: e.target.value }
        });
    };

    const handleSave = async () => {
        if (!tenant?.id) {
            toast({ title: "Error", description: "Tenant context missing", variant: "destructive" });
            return;
        }

        setLoading(true);

        // Destructure to get the rest of the fields, ignoring current ID if we want to rely on tenant_id constraint
        const { id, ...dataFields } = formData as any;

        const payload: any = {
            ...dataFields,
            tenant_id: tenant.id,
            updated_at: new Date()
        };

        // If we have an existing ID, we include it to ensure we update the specific row
        // But the constraint on tenant_id is our safety net
        if (id) {
            payload.id = id;
        }

        const { error } = await supabase
            .from("hero")
            .upsert(payload, { onConflict: 'tenant_id' });

        if (error) {
            console.error("Error saving hero:", error);
            if (error.code === '42501') {
                const toastId = toast({
                    title: "Permission Denied",
                    description: "You don't have permission to edit this tenant.",
                    variant: "destructive",
                    action: (
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={async () => {
                                try {
                                    // Extract tenant slug from URL
                                    const slug = window.location.pathname.split('/admin/')[1]?.split('/')[0];
                                    if (!slug) throw new Error("Could not determine tenant slug from URL");

                                    const { data, error: fnError } = await supabase.functions.invoke('add-admin-user', {
                                        body: { tenant_slug: slug, role: 'owner' }
                                    });

                                    if (fnError) throw fnError;

                                    toast({
                                        title: "Success",
                                        description: "Permissions fixed! Please try saving again.",
                                    });
                                } catch (err: any) {
                                    toast({
                                        title: "Auto-Fix Failed",
                                        description: err.message,
                                        variant: "destructive"
                                    });
                                }
                            }}
                        >
                            Fix Now
                        </Button>
                    )
                });
            } else {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            }
        } else {
            toast({ title: "Success", description: "Hero section updated!" });
            fetchHero();
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Edit Hero Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Name</Label>
                        <Input name="name" value={formData.name} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label>Title</Label>
                        <Input name="title" value={formData.title} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label>Subtitle</Label>
                        <Textarea name="subtitle" value={formData.subtitle} onChange={handleChange} />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>CTA Text</Label>
                            <Input name="cta_text" value={formData.cta_text} onChange={handleChange} />
                        </div>
                        <div className="space-y-2">
                            <Label>CTA Link</Label>
                            <Input name="cta_link" value={formData.cta_link} onChange={handleChange} />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Resume URL</Label>
                        <Input name="resume_url" value={formData.resume_url} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label>Social Links</Label>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                name="github"
                                placeholder="GitHub URL"
                                value={formData.social_links.github}
                                onChange={handleSocialChange}
                            />
                            <Input
                                name="linkedin"
                                placeholder="LinkedIn URL"
                                value={formData.social_links.linkedin}
                                onChange={handleSocialChange}
                            />
                            <Input
                                name="twitter"
                                placeholder="Twitter URL"
                                value={formData.social_links.twitter}
                                onChange={handleSocialChange}
                            />
                            <Input
                                name="email"
                                placeholder="Email Address"
                                value={formData.social_links.email}
                                onChange={handleSocialChange}
                            />
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

export default HeroEditor;
