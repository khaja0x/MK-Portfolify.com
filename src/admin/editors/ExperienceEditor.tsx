import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Briefcase, Calendar, Building, ListChecks, Sparkles, X, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Experience {
    id: string;
    company: string;
    role: string;
    period: string;
    details: string[];
    skills_used: string[];
}

const ExperienceEditor = () => {
    const { toast } = useToast();
    const { tenant } = useOutletContext<{ tenant: { id: string; name: string } }>();
    const [experiences, setExperiences] = useState<Experience[]>([]);
    const [editingExp, setEditingExp] = useState<Experience | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);

    const [formData, setFormData] = useState<Partial<Experience>>({
        company: "",
        role: "",
        period: "",
        details: [],
        skills_used: []
    });
    const [detailInput, setDetailInput] = useState("");
    const [skillInput, setSkillInput] = useState("");

    useEffect(() => {
        if (tenant?.id) {
            fetchExperience();
        }
    }, [tenant?.id]);

    const fetchExperience = async () => {
        if (!tenant?.id) return;
        const { data } = await supabase
            .from("experience")
            .select("*")
            .eq("tenant_id", tenant.id)
            .order("created_at", { ascending: false });
        if (data) setExperiences(data);
    };

    const handleOpenDialog = (exp?: Experience) => {
        if (exp) {
            setEditingExp(exp);
            setFormData(exp);
        } else {
            setEditingExp(null);
            setFormData({
                company: "",
                role: "",
                period: "",
                details: [],
                skills_used: []
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        if (!tenant?.id) return;

        setLoading(true);
        try {
            const expData = {
                ...formData,
                tenant_id: tenant.id,
                details: Array.isArray(formData.details) ? formData.details : [],
                skills_used: Array.isArray(formData.skills_used) ? formData.skills_used : [],
                updated_at: new Date()
            };

            let error;
            if (editingExp) {
                const { error: updateError } = await supabase
                    .from("experience")
                    .update(expData)
                    .eq("id", editingExp.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("experience")
                    .insert([expData]);
                error = insertError;
            }

            if (error) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            } else {
                toast({ title: "Success", description: "Experience saved!" });
                setIsDialogOpen(false);
                fetchExperience();
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this experience?")) return;

        const { error } = await supabase.from("experience").delete().eq("id", id);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            setExperiences(experiences.filter(e => e.id !== id));
            toast({ title: "Success", description: "Experience deleted!" });
        }
    };

    const addItem = (field: 'details' | 'skills_used', value: string, setter: (v: string) => void) => {
        if (!value.trim()) return;
        setFormData({
            ...formData,
            [field]: [...(formData[field] || []), value.trim()]
        });
        setter("");
    };

    const removeItem = (field: 'details' | 'skills_used', index: number) => {
        setFormData({
            ...formData,
            [field]: (formData[field] || []).filter((_, i) => i !== index)
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Briefcase className="text-sky-500" />
                        Professional Journey
                    </h2>
                    <p className="text-slate-400 mt-1">Showcase your career growth and achievements</p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-6 h-12 font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                >
                    <Plus className="h-5 w-5 mr-2" /> Add Experience
                </Button>
            </div>

            <div className="space-y-6">
                {experiences.map((exp, idx) => (
                    <Card
                        key={exp.id}
                        className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl group overflow-hidden animate-in fade-in slide-in-from-left duration-300"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <CardContent className="p-8">
                            <div className="flex flex-col md:flex-row justify-between items-start gap-6">
                                <div className="flex gap-6">
                                    <div className="w-14 h-14 bg-sky-500/10 rounded-2xl flex items-center justify-center text-sky-500 shrink-0 border border-sky-500/20 shadow-inner group-hover:scale-110 transition-transform">
                                        <Building size={28} />
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className="text-2xl font-bold text-white group-hover:text-sky-400 transition-colors">{exp.role}</h3>
                                        <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-slate-400 font-medium">
                                            <span className="flex items-center gap-1.5"><Building size={16} className="text-slate-500" /> {exp.company}</span>
                                            <span className="flex items-center gap-1.5"><Calendar size={16} className="text-slate-500" /> {exp.period}</span>
                                        </div>

                                        <ul className="mt-6 space-y-3">
                                            {exp.details?.map((detail, i) => (
                                                <li key={i} className="flex items-start gap-3 text-sm text-slate-300 leading-relaxed">
                                                    <div className="w-1.5 h-1.5 bg-sky-500 rounded-full mt-2 shrink-0 shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                                                    {detail}
                                                </li>
                                            ))}
                                        </ul>

                                        <div className="flex flex-wrap gap-2 mt-6">
                                            {exp.skills_used?.map(skill => (
                                                <Badge key={skill} className="bg-slate-800/80 text-slate-300 hover:bg-slate-700 border-0 rounded-lg font-medium px-3 py-1">
                                                    {skill}
                                                </Badge>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex md:flex-col gap-2 shrink-0">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                        onClick={() => handleOpenDialog(exp)}
                                    >
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-10 w-10 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                        onClick={() => handleDelete(exp.id)}
                                    >
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {experiences.length === 0 && (
                    <div className="py-20 text-center">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                            <Briefcase size={32} />
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">No experience added yet</h3>
                        <p className="text-slate-400">Share your professional history with the world.</p>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl p-0 bg-white border-0 rounded-[2rem] overflow-hidden shadow-2xl">
                    <div className="p-8 md:p-12">
                        <DialogHeader className="mb-10 text-center md:text-left">
                            <div className="w-14 h-14 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600 mb-4 mx-auto md:mx-0">
                                <Plus size={28} />
                            </div>
                            <DialogTitle className="text-3xl font-bold text-slate-900">
                                {editingExp ? "Update Experience" : "Add Journey Entry"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 text-lg">
                                Tell us about your role and what you achieved there.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-8 max-h-[55vh] overflow-y-auto pr-2 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                        <Building size={16} className="text-slate-400" />
                                        Company Name
                                    </Label>
                                    <Input
                                        placeholder="e.g. Acme Corp"
                                        value={formData.company}
                                        onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 text-lg"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                        <Briefcase size={16} className="text-slate-400" />
                                        Your Role
                                    </Label>
                                    <Input
                                        placeholder="e.g. Senior Developer"
                                        value={formData.role}
                                        onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 text-lg"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                    <Calendar size={16} className="text-slate-400" />
                                    Employment Period
                                </Label>
                                <Input
                                    placeholder="e.g. Jan 2023 - Present"
                                    value={formData.period}
                                    onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                                    className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 text-lg"
                                />
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                    <ListChecks size={16} className="text-slate-400" />
                                    Key Accomplishments
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={detailInput}
                                        onChange={(e) => setDetailInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addItem('details', detailInput, setDetailInput)}
                                        placeholder="Describe a achievement..."
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                                    />
                                    <Button type="button" onClick={() => addItem('details', detailInput, setDetailInput)} className="h-14 bg-slate-900 text-white px-6 rounded-2xl font-bold">Add</Button>
                                </div>
                                <div className="space-y-2">
                                    {formData.details?.map((detail, i) => (
                                        <div key={i} className="flex items-center gap-3 bg-slate-50 p-4 rounded-xl border border-slate-100 group">
                                            <span className="flex-1 text-slate-700 font-medium">{detail}</span>
                                            <button
                                                onClick={() => removeItem('details', i)}
                                                className="text-slate-400 hover:text-red-500 transition-colors p-1"
                                            >
                                                <X size={18} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-sm font-bold text-slate-700 ml-1 flex items-center gap-2">
                                    <Sparkles size={16} className="text-slate-400" />
                                    Skills & Technologies
                                </Label>
                                <div className="flex gap-2">
                                    <Input
                                        value={skillInput}
                                        onChange={(e) => setSkillInput(e.target.value)}
                                        onKeyDown={(e) => e.key === "Enter" && addItem('skills_used', skillInput, setSkillInput)}
                                        placeholder="Add a skill used..."
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                                    />
                                    <Button type="button" onClick={() => addItem('skills_used', skillInput, setSkillInput)} className="h-14 bg-slate-900 text-white px-6 rounded-2xl font-bold">Add</Button>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {formData.skills_used?.map((skill, i) => (
                                        <Badge key={i} className="bg-sky-50 text-sky-600 border-sky-100 rounded-xl px-4 py-1.5 flex items-center gap-2 text-sm">
                                            {skill}
                                            <button onClick={() => removeItem('skills_used', i)} className="hover:text-red-500 transition-colors">
                                                <X size={14} />
                                            </button>
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-12">
                            <Button
                                variant="ghost"
                                onClick={() => setIsDialogOpen(false)}
                                className="h-16 flex-1 rounded-2xl text-lg font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={loading}
                                className="h-16 flex-[2] bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingExp ? "Update Journey" : "Publish Entry")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ExperienceEditor;
