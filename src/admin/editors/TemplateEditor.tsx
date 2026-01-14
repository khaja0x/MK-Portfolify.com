import { useState, useEffect } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Check, Layout, Monitor, Smartphone, Palette, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

interface Template {
    id: string;
    name: string;
    description: string;
    image: string;
    features: string[];
}

const templates: Template[] = [
    {
        id: "modern",
        name: "Modern Premium",
        description: "A high-impact, dark-themed experience with glassmorphism, mesh gradients, and sophisticated micro-animations. Perfect for standing out.",
        image: "https://images.unsplash.com/photo-1620641788421-7a1c342ea42e?q=80&w=1074&auto=format&fit=crop",
        features: ["Mesh Gradients", "Glassmorphism", "Dynamic Animations", "Dark Mode Focused"]
    },
    {
        id: "minimal",
        name: "Minimalist Light",
        description: "Clean, elegant, and focused on readability. Uses high contrast, plenty of whitespace, and subtle transitions for a professional feel.",
        image: "https://images.unsplash.com/photo-1483058712412-4245e9b90334?q=80&w=1170&auto=format&fit=crop",
        features: ["High Contrast", "Clean Typography", "Minimalist Layout", "Mobile Optimized"]
    },
    {
        id: "creative",
        name: "Creative Visionary",
        description: "An expressive, asymmetric layout with vibrant gradients and bold serif typography. Ideal for artists and creative developers.",
        image: "https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1170&auto=format&fit=crop",
        features: ["Asymmetric Layout", "Serif Typography", "Vibrant Accents", "Dynamic Shapes"]
    },
    {
        id: "futuristic",
        name: "Cyber HUD",
        description: "A futuristic, sci-fi inspired console experience with neon accents, grid systems, and monospaced data streams.",
        image: "https://images.unsplash.com/photo-1555680202-c86f0e12f086?q=80&w=1170&auto=format&fit=crop",
        features: ["HUD Elements", "Neon Colorway", "Font Mono", "Grid Systems"]
    }
];

const TemplateEditor = () => {
    const { tenant } = useOutletContext<{ tenant: any }>();
    const [selectedId, setSelectedId] = useState<string>("");
    const [isSaving, setIsSaving] = useState(false);

    useEffect(() => {
        if (tenant?.theme_config?.templateId) {
            setSelectedId(tenant.theme_config.templateId);
        } else {
            setSelectedId("modern");
        }
    }, [tenant]);

    const handleSave = async () => {
        if (!tenant?.id) return;

        try {
            setIsSaving(true);
            const newThemeConfig = {
                ...(tenant.theme_config || {}),
                templateId: selectedId
            };

            const { error } = await supabase
                .from("tenants")
                .update({ theme_config: newThemeConfig })
                .eq("id", tenant.id);

            if (error) throw error;
            toast.success("Design Template Updated Successfully!");
        } catch (err) {
            console.error(err);
            toast.error("Failed to update template.");
        } finally {
            setIsSaving(false);
        }
    };

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-slate-900/50 p-8 rounded-[2.5rem] border border-slate-800 backdrop-blur-sm">
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-sky-400 font-black text-xs uppercase tracking-widest">
                        <Palette size={14} />
                        Visual Identity
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">Design <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 font-serif italic">Templates</span></h1>
                    <p className="text-slate-400 font-medium">Choose a layout that best represents your professional brand.</p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="h-14 px-10 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black shadow-xl shadow-sky-500/20 transition-all hover:-translate-y-1"
                >
                    {isSaving ? "Saving..." : "Apply Changes"}
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {templates.map((template) => (
                    <motion.div
                        key={template.id}
                        whileHover={{ y: -5 }}
                        className={`group relative flex flex-col rounded-[2.5rem] border-2 transition-all duration-500 overflow-hidden cursor-pointer ${selectedId === template.id
                            ? "border-sky-500 bg-sky-500/5 shadow-2xl shadow-sky-500/10"
                            : "border-slate-800 bg-slate-900/30 hover:border-slate-700 hover:bg-slate-900/50"
                            }`}
                        onClick={() => setSelectedId(template.id)}
                    >
                        <div className="relative aspect-video overflow-hidden">
                            <img
                                src={template.image}
                                alt={template.name}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950 via-slate-950/20 to-transparent" />

                            {selectedId === template.id && (
                                <div className="absolute top-6 right-6 w-12 h-12 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-xl animate-in zoom-in duration-300">
                                    <Check size={28} strokeWidth={3} />
                                </div>
                            )}

                            <div className="absolute bottom-6 left-8 flex gap-3">
                                <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white">
                                    <Monitor size={16} />
                                </div>
                                <div className="p-2 bg-white/10 backdrop-blur-md rounded-lg text-white">
                                    <Smartphone size={16} />
                                </div>
                            </div>
                        </div>

                        <div className="p-10 space-y-6 flex-1 flex flex-col">
                            <div className="space-y-4">
                                <h3 className="text-3xl font-black text-white">{template.name}</h3>
                                <p className="text-slate-400 font-medium leading-relaxed">{template.description}</p>
                            </div>

                            <div className="flex flex-wrap gap-2 mt-auto pt-6">
                                {template.features.map(feature => (
                                    <span key={feature} className="px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800 text-slate-500 text-xs font-bold flex items-center gap-2">
                                        <Zap size={12} className="text-sky-500" />
                                        {feature}
                                    </span>
                                ))}
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="p-8 bg-sky-500/10 border border-sky-500/20 rounded-[2rem] flex items-center gap-6">
                <div className="w-16 h-16 bg-sky-500 rounded-2xl flex items-center justify-center text-white shadow-lg shrink-0">
                    <Sparkles size={32} />
                </div>
                <div>
                    <h4 className="text-xl font-bold text-white mb-1">Customization Pro-Tip</h4>
                    <p className="text-slate-400 font-medium">Templates determine the layout and vibe. You can still customize colors and dark mode settings in the <strong>Global Settings</strong> coming soon!</p>
                </div>
            </div>
        </div>
    );
};

export default TemplateEditor;
