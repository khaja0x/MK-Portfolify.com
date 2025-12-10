import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, Briefcase } from "lucide-react";

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

    // Form state
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
        if (!tenant?.id) {
            toast({ title: "Error", description: "Tenant context missing", variant: "destructive" });
            return;
        }

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
                console.error("Error saving experience:", error);
                if (error.code === '42501') {
                    toast({
                        title: "Permission Denied",
                        description: "You do not have permission to edit this tenant.",
                        variant: "destructive"
                    });
                } else {
                    throw error;
                }
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Experience</h2>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" /> Add Experience
                </Button>
            </div>

            <div className="space-y-4">
                {experiences.map((exp) => (
                    <Card key={exp.id}>
                        <CardContent className="p-6">
                            <div className="flex justify-between items-start">
                                <div className="flex gap-4">
                                    <div className="bg-primary/10 p-3 rounded-lg h-fit">
                                        <Briefcase className="h-6 w-6 text-primary" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-semibold">{exp.role}</h3>
                                        <p className="text-muted-foreground font-medium">{exp.company}</p>
                                        <p className="text-sm text-muted-foreground mt-1">{exp.period}</p>

                                        <ul className="mt-4 list-disc list-inside space-y-1 text-sm">
                                            {exp.details?.map((detail, i) => (
                                                <li key={i}>{detail}</li>
                                            ))}
                                        </ul>

                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {exp.skills_used?.map(skill => (
                                                <span key={skill} className="text-xs bg-secondary px-2 py-1 rounded-md">{skill}</span>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(exp)}>
                                        <Pencil className="h-4 w-4" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(exp.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingExp ? "Edit Experience" : "Add Experience"}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Company</Label>
                                <Input
                                    value={formData.company}
                                    onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Role</Label>
                                <Input
                                    value={formData.role}
                                    onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Period</Label>
                            <Input
                                placeholder="e.g. Jan 2023 - Present"
                                value={formData.period}
                                onChange={(e) => setFormData({ ...formData, period: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Details (Bullet Points)</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={detailInput}
                                    onChange={(e) => setDetailInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addItem('details', detailInput, setDetailInput)}
                                    placeholder="Type and press Enter"
                                />
                                <Button type="button" onClick={() => addItem('details', detailInput, setDetailInput)} variant="secondary">Add</Button>
                            </div>
                            <ul className="mt-2 space-y-1">
                                {formData.details?.map((detail, i) => (
                                    <li key={i} className="text-sm flex items-center gap-2 bg-muted p-2 rounded">
                                        <span className="flex-1">{detail}</span>
                                        <button onClick={() => removeItem('details', i)} className="text-destructive hover:underline">Remove</button>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className="space-y-2">
                            <Label>Skills Used</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={skillInput}
                                    onChange={(e) => setSkillInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addItem('skills_used', skillInput, setSkillInput)}
                                    placeholder="Type and press Enter"
                                />
                                <Button type="button" onClick={() => addItem('skills_used', skillInput, setSkillInput)} variant="secondary">Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.skills_used?.map((skill, i) => (
                                    <span key={i} className="text-xs bg-secondary px-2 py-1 rounded-md flex items-center gap-1">
                                        {skill}
                                        <button onClick={() => removeItem('skills_used', i)} className="hover:text-destructive">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <Button onClick={handleSave} disabled={loading} className="w-full">
                            {loading ? "Saving..." : "Save Experience"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ExperienceEditor;
