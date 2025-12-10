import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";

const AboutEditor = () => {
    const { toast } = useToast();
    const { tenant } = useOutletContext<{ tenant: { id: string; name: string } }>();
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [formData, setFormData] = useState({
        title: "",
        description: "",
        extra_text: "",
        profile_image_url: ""
    });

    useEffect(() => {
        if (tenant?.id) {
            fetchAbout();
        }
    }, [tenant?.id]);

    const fetchAbout = async () => {
        if (!tenant?.id) return;
        const { data } = await supabase
            .from("about")
            .select("*")
            .eq("tenant_id", tenant.id)
            .maybeSingle();
        if (data) setFormData(data);
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!tenant?.id) {
            toast({ title: "Error", description: "Tenant context missing", variant: "destructive" });
            return;
        }

        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = e.target.files[0];
            const fileExt = file.name.split(".").pop();
            // Use timestamp + random hex for reliable filename
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `profile/${fileName}`;

            // Delete old image if exists
            if (formData.profile_image_url) {
                try {
                    // Extract the storage path from the URL
                    // URL format: https://.../storage/v1/object/public/Portfolio/profile/filename.png
                    const urlParts = formData.profile_image_url.split('/Portfolio/');
                    const oldPath = urlParts[1]; // Gets everything after "Portfolio/"
                    if (oldPath) {
                        await supabase.storage.from("Portfolio").remove([oldPath]);
                    }
                } catch (error) {
                    // Ignore errors when deleting old image
                    console.warn("Could not delete old image:", error);
                }
            }

            // Upload new image
            const { error: uploadError } = await supabase.storage
                .from("Portfolio")
                .upload(filePath, file);

            if (uploadError) {
                throw uploadError;
            }

            // Get public URL
            const { data } = supabase.storage.from("Portfolio").getPublicUrl(filePath);

            // Update local state
            const updatedFormData = { ...formData, profile_image_url: data.publicUrl };
            setFormData(updatedFormData);

            // Automatically save to database
            const { id, ...dataToSave } = updatedFormData as any;
            const payload: any = {
                ...dataToSave,
                tenant_id: tenant.id,
                updated_at: new Date()
            };
            if (id) payload.id = id;

            const { error: dbError } = await supabase.from("about").upsert(payload, { onConflict: 'tenant_id' });

            if (dbError) {
                throw dbError;
            }

            toast({ title: "Success", description: "Image uploaded and saved successfully!" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!tenant?.id) {
            toast({ title: "Error", description: "Tenant context missing", variant: "destructive" });
            return;
        }

        setLoading(true);

        const { id, ...dataToSave } = formData as any;
        const payload: any = {
            ...dataToSave,
            tenant_id: tenant.id,
            updated_at: new Date()
        };
        if (id) payload.id = id;

        const { error } = await supabase.from("about").upsert(payload, { onConflict: 'tenant_id' });

        if (error) {
            console.error("Error saving about:", error);
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
            toast({ title: "Success", description: "About section updated!" });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-2xl mx-auto">
            <Card>
                <CardHeader>
                    <CardTitle>Edit About Section</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Section Title</Label>
                        <Input name="title" value={formData.title} onChange={handleChange} />
                    </div>

                    <div className="space-y-2">
                        <Label>Description</Label>
                        <Textarea
                            name="description"
                            value={formData.description}
                            onChange={handleChange}
                            className="h-32"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Extra Text</Label>
                        <Textarea
                            name="extra_text"
                            value={formData.extra_text}
                            onChange={handleChange}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Profile Image</Label>
                        <div className="flex items-center gap-4">
                            {formData.profile_image_url && (
                                <img
                                    src={formData.profile_image_url}
                                    alt="Profile"
                                    className="w-20 h-20 rounded-full object-cover border"
                                />
                            )}
                            <Input
                                type="file"
                                accept="image/*"
                                onChange={handleImageUpload}
                                disabled={uploading}
                            />
                        </div>
                        {uploading && <p className="text-sm text-muted-foreground">Uploading and saving...</p>}
                    </div>

                    <Button onClick={handleSave} disabled={loading || uploading} className="w-full">
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
};

export default AboutEditor;
