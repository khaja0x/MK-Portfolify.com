import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { User, Loader2, Upload } from "lucide-react";

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
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `profile/${fileName}`;

            if (formData.profile_image_url) {
                try {
                    const urlParts = formData.profile_image_url.split('/Portfolio/');
                    const oldPath = urlParts[1];
                    if (oldPath) {
                        await supabase.storage.from("Portfolio").remove([oldPath]);
                    }
                } catch (error) {
                    console.warn("Could not delete old image:", error);
                }
            }

            const { error: uploadError } = await supabase.storage
                .from("Portfolio")
                .upload(filePath, file);

            if (uploadError) throw uploadError;

            const { data } = supabase.storage.from("Portfolio").getPublicUrl(filePath);

            const updatedFormData = { ...formData, profile_image_url: data.publicUrl };
            setFormData(updatedFormData);

            const { id, ...dataToSave } = updatedFormData as any;
            const payload: any = {
                ...dataToSave,
                tenant_id: tenant.id,
                updated_at: new Date()
            };
            if (id) payload.id = id;

            await supabase.from("about").upsert(payload, { onConflict: 'tenant_id' });

            toast({ title: "Success", description: "Image uploaded and saved successfully!" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
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

        const { error } = await supabase.from("about").upsert(payload, { onConflict: 'tenant_id' });

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            toast({ title: "Success", description: "About section updated!" });
        }
        setLoading(false);
    };

    return (
        <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Card className="border-0 shadow-2xl bg-white rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 md:p-12">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
                            <User size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Edit About Section</h2>
                    </div>

                    <div className="space-y-8">
                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-700 ml-1">Section Title</Label>
                            <Input
                                name="title"
                                value={formData.title}
                                onChange={handleChange}
                                placeholder="e.g. Hi, I'm Mohammed Khaja"
                                className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-700 ml-1">Description</Label>
                            <Textarea
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                placeholder="Write a brief intro about yourself..."
                                className="min-h-[160px] bg-slate-50 border-slate-100 rounded-2xl p-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 resize-none leading-relaxed"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-700 ml-1">Extra Text</Label>
                            <Textarea
                                name="extra_text"
                                value={formData.extra_text}
                                onChange={handleChange}
                                placeholder="Additional details or specializations..."
                                className="min-h-[120px] bg-slate-50 border-slate-100 rounded-2xl p-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 resize-none leading-relaxed"
                            />
                        </div>

                        <div className="space-y-3">
                            <Label className="text-sm font-bold text-slate-700 ml-1">Profile Image</Label>
                            <div className="flex flex-col md:flex-row items-center gap-6 p-6 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                <div className="relative group">
                                    <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-200">
                                        {formData.profile_image_url ? (
                                            <img
                                                src={formData.profile_image_url}
                                                alt="Profile"
                                                className="w-full h-full object-cover transition-transform group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <User size={32} />
                                            </div>
                                        )}
                                    </div>
                                    {uploading && (
                                        <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center backdrop-blur-sm">
                                            <Loader2 className="w-6 h-6 text-white animate-spin" />
                                        </div>
                                    )}
                                </div>
                                <div className="flex-1 space-y-2">
                                    <p className="text-sm font-medium text-slate-600">Upload a professional headshot</p>
                                    <p className="text-xs text-slate-400">JPG, PNG or WebP. Max 2MB recommended.</p>
                                    <div className="relative mt-2">
                                        <input
                                            type="file"
                                            id="about-image"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={uploading}
                                            className="hidden"
                                        />
                                        <label
                                            htmlFor="about-image"
                                            className="inline-flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm"
                                        >
                                            <Upload size={16} />
                                            {uploading ? "Uploading..." : "Choose File"}
                                        </label>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={handleSave}
                            disabled={loading || uploading}
                            className="w-full h-16 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] mt-4"
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
                    </div>
                </CardContent>
            </Card>
        </div>
    );
};

export default AboutEditor;
