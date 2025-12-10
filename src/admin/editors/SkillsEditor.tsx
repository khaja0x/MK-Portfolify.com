import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Trash2, Plus } from "lucide-react";
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
        if (!tenant?.id) {
            toast({ title: "Error", description: "Tenant context missing", variant: "destructive" });
            return;
        }
        if (!newSkill.category || !newSkill.skill_name) return;

        setLoading(true);
        const { data, error } = await supabase
            .from("skills")
            .insert([{ ...newSkill, tenant_id: tenant.id }])
            .select()
            .single();

        if (error) {
            console.error("Error adding skill:", error);
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

    // Group skills by category
    const groupedSkills = skills.reduce((acc, skill) => {
        if (!acc[skill.category]) acc[skill.category] = [];
        acc[skill.category].push(skill);
        return acc;
    }, {} as Record<string, Skill[]>);

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle>Add New Skill</CardTitle>
                </CardHeader>
                <CardContent className="flex gap-4 items-end">
                    <div className="space-y-2 flex-1">
                        <Label>Category</Label>
                        <Input
                            placeholder="e.g. Frontend, Backend, Tools"
                            value={newSkill.category}
                            onChange={(e) => setNewSkill({ ...newSkill, category: e.target.value })}
                        />
                    </div>
                    <div className="space-y-2 flex-1">
                        <Label>Skill Name</Label>
                        <Input
                            placeholder="e.g. React, Node.js"
                            value={newSkill.skill_name}
                            onChange={(e) => setNewSkill({ ...newSkill, skill_name: e.target.value })}
                        />
                    </div>
                    <Button onClick={handleAddSkill} disabled={loading}>
                        <Plus className="h-4 w-4 mr-2" /> Add
                    </Button>
                </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {Object.entries(groupedSkills).map(([category, categorySkills]) => (
                    <Card key={category}>
                        <CardHeader>
                            <CardTitle>{category}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-2">
                                {categorySkills.map((skill) => (
                                    <Badge key={skill.id} variant="secondary" className="pl-3 pr-1 py-1 flex items-center gap-2">
                                        {skill.skill_name}
                                        <Button
                                            variant="ghost"
                                            size="icon"
                                            className="h-4 w-4 hover:bg-destructive hover:text-destructive-foreground rounded-full"
                                            onClick={() => handleDeleteSkill(skill.id)}
                                        >
                                            <XIcon className="h-3 w-3" />
                                        </Button>
                                    </Badge>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        </div>
    );
};

// Helper icon component since I used XIcon above but imported Trash2/Plus
const XIcon = ({ className }: { className?: string }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M18 6 6 18" />
        <path d="m6 6 12 12" />
    </svg>
);

export default SkillsEditor;
