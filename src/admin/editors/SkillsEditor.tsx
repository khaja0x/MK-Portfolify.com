import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Plus, X, Code, Loader2, Sparkles, Trash2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Skill {
    id: string;
    category: string;
    skill_name: string;
}

const SkillsEditor = () => {
    const { toast } = useToast();
    const { tenant } = useOutletContext<{ tenant: { id: string; name: string } }>();
    const [skills, setSkills] = useState<Skill[]>([]);
    const [newSkill, setNewSkill] = useState({ category: "", skill_name: "" });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (tenant?.id) {
            fetchSkills();
        }
    }, [tenant?.id]);

    const fetchSkills = async () => {
        if (!tenant?.id) return;
        const { data } = await supabase
            .from("skills")
            .select("*")
            .eq("tenant_id", tenant.id)
            .order("category");
        if (data) setSkills(data);
    };

    const handleAddSkill = async () => {
        if (!tenant?.id) return;
        if (!newSkill.category || !newSkill.skill_name) return;

        setLoading(true);
        const { data, error } = await supabase
            .from("skills")
            .insert([{ ...newSkill, tenant_id: tenant.id }])
            .select()
            .single();

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            setSkills([...skills, data]);
            setNewSkill({ category: "", skill_name: "" });
            toast({ title: "Success", description: "Skill added!" });
        }
        setLoading(false);
    };

    const handleDeleteSkill = async (id: string) => {
        const { error } = await supabase.from("skills").delete().eq("id", id);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            setSkills(skills.filter(s => s.id !== id));
            toast({ title: "Success", description: "Skill deleted!" });
        }
    };

    const groupedSkills = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, Skill[]>);

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Add Skill Card */}
            <Card className="border-0 shadow-2xl bg-white rounded-[2rem] overflow-hidden">
                <CardContent className="p-8 md:p-10">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
                            <Plus size={24} />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-900">Add New Skill</h2>
                    </div>

                    <div className="flex flex-col md:flex-row gap-6 items-end">
                        <div className="space-y-3 flex-1 w-full">
                            <Label className="text-sm font-bold text-slate-700 ml-1">Category</Label>
                            <Input
                                placeholder="e.g. Frontend"
                                value={newSkill.category}
                                onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                                className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                            />
                        </div>
                        <div className="space-y-3 flex-1 w-full">
                            <Label className="text-sm font-bold text-slate-700 ml-1">Skill Name</Label>
                            <Input
                                placeholder="e.g. React.js"
                                value={newSkill.skill_name}
                                onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                                className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                            />
                        </div>
                        <Button
                            onClick={handleAddSkill}
                            disabled={loading || !newSkill.category || !newSkill.skill_name}
                            className="h-14 bg-sky-500 hover:bg-sky-600 text-white px-8 rounded-2xl font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] w-full md:w-auto"
                        >
                            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Add Skill"}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {/* Display Grouped Skills */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedSkills).length > 0 ? (
                    Object.entries(groupedSkills).map(([category, categorySkills], idx) => (
                        <Card key={category} className="border-0 shadow-lg bg-white rounded-[2rem] animate-in fade-in slide-in-from-bottom-2 duration-300" style={{ animationDelay: `${idx * 100}ms` }}>
                            <CardContent className="p-8">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-lg text-slate-800 flex items-center gap-2">
                                        <Sparkles size={18} className="text-sky-500" />
                                        {category}
                                    </h3>
                                    <Badge variant="outline" className="bg-slate-50 text-slate-500 border-slate-100 rounded-full py-0.5">
                                        {categorySkills.length} {categorySkills.length === 1 ? 'skill' : 'skills'}
                                    </Badge>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {categorySkills.map((skill) => (
                                        <div
                                            key={skill.id}
                                            className="group flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-sky-50 border border-slate-100 hover:border-sky-200 rounded-xl transition-all"
                                        >
                                            <span className="text-sm font-semibold text-slate-700 group-hover:text-sky-700 transition-colors">
                                                {skill.skill_name}
                                            </span>
                                            <button
                                                onClick={() => handleDeleteSkill(skill.id)}
                                                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-red-500 transition-all transform scale-75 group-hover:scale-100"
                                            >
                                                <X size={14} strokeWidth={3} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Code size={32} className="text-slate-500" />
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">No skills added yet</h3>
                        <p className="text-slate-400">Start by adding your first skill above.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default SkillsEditor;
