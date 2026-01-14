import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ExternalLink, Github, Rocket, Loader2, Link as LinkIcon, X, Briefcase } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface Project {
    id: string;
    title: string;
    description: string;
    tech_stack: string[];
    image_url: string;
    github_link: string;
    demo_link: string;
}

const ProjectsEditor = () => {
    const { toast } = useToast();
    const { tenant } = useOutletContext<{ tenant: { id: string; name: string } }>();
    const [projects, setProjects] = useState<Project[]>([]);
    const [editingProject, setEditingProject] = useState<Project | null>(null);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [formData, setFormData] = useState<Partial<Project>>({
        title: "",
        description: "",
        tech_stack: [],
        image_url: "",
        github_link: "",
        demo_link: ""
    });
    const [techInput, setTechInput] = useState("");

    useEffect(() => {
        if (tenant?.id) {
            fetchProjects();
        }
    }, [tenant?.id]);

    const fetchProjects = async () => {
        if (!tenant?.id) return;
        const { data } = await supabase
            .from("projects")
            .select("*")
            .eq("tenant_id", tenant.id)
            .order("created_at", { ascending: false });
        if (data) setProjects(data);
    };

    const handleOpenDialog = (project?: Project) => {
        if (project) {
            setEditingProject(project);
            setFormData(project);
        } else {
            setEditingProject(null);
            setFormData({
                title: "",
                description: "",
                tech_stack: [],
                image_url: "",
                github_link: "",
                demo_link: ""
            });
        }
        setIsDialogOpen(true);
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        try {
            setUploading(true);
            if (!e.target.files || e.target.files.length === 0) {
                throw new Error("You must select an image to upload.");
            }

            const file = e.target.files[0];
            const fileExt = file.name.split(".").pop();
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `projects/${fileName}`;

            if (editingProject && formData.image_url) {
                try {
                    const urlParts = formData.image_url.split('/Portfolio/');
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
            setFormData({ ...formData, image_url: data.publicUrl });
            toast({ title: "Success", description: "Image uploaded!" });
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleSave = async () => {
        if (!tenant?.id) return;

        setLoading(true);
        try {
            const projectData = {
                ...formData,
                tenant_id: tenant.id,
                tech_stack: Array.isArray(formData.tech_stack) ? formData.tech_stack : [],
                updated_at: new Date()
            };

            let error;
            if (editingProject) {
                const { error: updateError } = await supabase
                    .from("projects")
                    .update(projectData)
                    .eq("id", editingProject.id);
                error = updateError;
            } else {
                const { error: insertError } = await supabase
                    .from("projects")
                    .insert([projectData]);
                error = insertError;
            }

            if (error) {
                toast({ title: "Error", description: error.message, variant: "destructive" });
            } else {
                toast({ title: "Success", description: "Project saved!" });
                setIsDialogOpen(false);
                fetchProjects();
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this project?")) return;

        const { error } = await supabase.from("projects").delete().eq("id", id);
        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            setProjects(projects.filter(p => p.id !== id));
            toast({ title: "Success", description: "Project deleted!" });
        }
    };

    const addTech = () => {
        if (!techInput.trim()) return;
        setFormData({
            ...formData,
            tech_stack: [...(formData.tech_stack || []), techInput.trim()]
        });
        setTechInput("");
    };

    const removeTech = (tech: string) => {
        setFormData({
            ...formData,
            tech_stack: (formData.tech_stack || []).filter(t => t !== tech)
        });
    };

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <Briefcase className="text-sky-500" />
                        My Projects
                    </h2>
                    <p className="text-slate-400 mt-1">Manage and showcase your best work</p>
                </div>
                <Button
                    onClick={() => handleOpenDialog()}
                    className="bg-sky-500 hover:bg-sky-600 text-white rounded-xl px-6 h-12 font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-95"
                >
                    <Plus className="h-5 w-5 mr-2" /> Add Project
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project, idx) => (
                    <Card
                        key={project.id}
                        className="border-slate-800 bg-slate-900/50 backdrop-blur-sm shadow-xl flex flex-col group overflow-hidden animate-in fade-in slide-in-from-bottom-2 duration-300"
                        style={{ animationDelay: `${idx * 100}ms` }}
                    >
                        <div className="aspect-video w-full bg-slate-800 relative overflow-hidden">
                            {project.image_url ? (
                                <img
                                    src={project.image_url}
                                    alt={project.title}
                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                />
                            ) : (
                                <div className="flex items-center justify-center h-full text-slate-500 bg-slate-800">
                                    <Rocket size={32} />
                                </div>
                            )}
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                                <div className="flex gap-2">
                                    {project.github_link && (
                                        <a href={project.github_link} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                                            <Github size={20} />
                                        </a>
                                    )}
                                    {project.demo_link && (
                                        <a href={project.demo_link} target="_blank" rel="noreferrer" className="w-10 h-10 bg-white/20 backdrop-blur-md rounded-xl flex items-center justify-center text-white hover:bg-white/40 transition-colors">
                                            <ExternalLink size={20} />
                                        </a>
                                    )}
                                </div>
                            </div>
                        </div>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-xl font-bold text-white group-hover:text-sky-400 transition-colors truncate">
                                {project.title}
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-slate-400 line-clamp-3 mb-4 leading-relaxed">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {project.tech_stack?.slice(0, 3).map(tech => (
                                    <Badge key={tech} className="bg-slate-800 text-slate-300 hover:bg-slate-700 border-0 rounded-lg font-medium">
                                        {tech}
                                    </Badge>
                                ))}
                                {project.tech_stack?.length > 3 && (
                                    <Badge className="bg-slate-800 text-slate-500 border-0 rounded-lg">
                                        +{project.tech_stack.length - 3} more
                                    </Badge>
                                )}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-end gap-2 p-4 pt-0">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl"
                                onClick={() => handleOpenDialog(project)}
                            >
                                <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-10 w-10 text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl"
                                onClick={() => handleDelete(project.id)}
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                        </CardFooter>
                    </Card>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full py-20 text-center">
                        <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-500">
                            <Rocket size={32} />
                        </div>
                        <h3 className="text-white text-xl font-bold mb-2">No projects yet</h3>
                        <p className="text-slate-400">Time to showcase your amazing work!</p>
                    </div>
                )}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-3xl p-0 bg-white border-0 rounded-[2rem] overflow-hidden">
                    <div className="p-8 md:p-12">
                        <DialogHeader className="mb-8">
                            <DialogTitle className="text-3xl font-bold text-slate-900">
                                {editingProject ? "Edit Project" : "Add New Project"}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500">
                                Provide details about your project to showcase it on your portfolio.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-8 max-h-[60vh] overflow-y-auto pr-4 custom-scrollbar">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 ml-1">Project Title</Label>
                                    <Input
                                        value={formData.title}
                                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                        placeholder="Awesome Web App"
                                        className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                                    />
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 ml-1">Tech Stack</Label>
                                    <div className="flex gap-2">
                                        <Input
                                            value={techInput}
                                            onChange={(e) => setTechInput(e.target.value)}
                                            onKeyDown={(e) => e.key === "Enter" && addTech()}
                                            placeholder="Add tech (React, etc)..."
                                            className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                                        />
                                        <Button type="button" onClick={addTech} className="h-14 bg-slate-900 text-white px-6 rounded-2xl font-bold">Add</Button>
                                    </div>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {formData.tech_stack?.map(tech => (
                                            <Badge key={tech} className="bg-sky-50 text-sky-600 border-sky-100 rounded-xl px-3 py-1 flex items-center gap-1">
                                                {tech}
                                                <button onClick={() => removeTech(tech)} className="hover:text-red-500">
                                                    <X size={14} />
                                                </button>
                                            </Badge>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 ml-1">Description</Label>
                                <Textarea
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    placeholder="Explain what this project is about, the challenges you solved..."
                                    className="min-h-[160px] bg-slate-50 border-slate-100 rounded-2xl p-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 resize-none leading-relaxed"
                                />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 ml-1">GitHub Repository</Label>
                                    <div className="relative">
                                        <Github size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            value={formData.github_link}
                                            onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                                            placeholder="https://github.com/..."
                                            className="h-14 bg-slate-50 border-slate-100 rounded-2xl pl-14 pr-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-sm font-bold text-slate-700 ml-1">Live Demo URL</Label>
                                    <div className="relative">
                                        <ExternalLink size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                                        <Input
                                            value={formData.demo_link}
                                            onChange={(e) => setFormData({ ...formData, demo_link: e.target.value })}
                                            placeholder="https://myprojects.com/..."
                                            className="h-14 bg-slate-50 border-slate-100 rounded-2xl pl-14 pr-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-sm font-bold text-slate-700 ml-1">Project Image</Label>
                                <div className="flex flex-col md:flex-row items-center gap-6 p-8 bg-slate-50 rounded-[2rem] border border-dashed border-slate-200">
                                    <div className="w-32 h-32 rounded-2xl overflow-hidden border-4 border-white shadow-lg bg-slate-200 shrink-0">
                                        {formData.image_url ? (
                                            <img
                                                src={formData.image_url}
                                                alt="Preview"
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-slate-400">
                                                <Rocket size={32} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 space-y-3">
                                        <p className="text-sm font-medium text-slate-600">Add a stunning preview for your project</p>
                                        <div className="relative">
                                            <input
                                                type="file"
                                                id="project-image"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="hidden"
                                            />
                                            <label
                                                htmlFor="project-image"
                                                className="inline-flex items-center gap-2 px-6 py-3 bg-white border border-slate-200 rounded-xl text-sm font-semibold text-slate-700 hover:bg-slate-50 cursor-pointer transition-colors shadow-sm"
                                            >
                                                {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Rocket size={16} />}
                                                {uploading ? "Uploading..." : "Click to Upload"}
                                            </label>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 mt-10">
                            <Button
                                variant="ghost"
                                onClick={() => setIsDialogOpen(false)}
                                className="h-16 flex-1 rounded-2xl text-lg font-bold text-slate-600 hover:bg-slate-50"
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleSave}
                                disabled={loading || uploading}
                                className="h-16 flex-[2] bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-sky-500/20 transition-all"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : (editingProject ? "Update Project" : "Create Project")}
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectsEditor;
