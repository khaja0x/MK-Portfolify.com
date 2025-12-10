import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Pencil, Trash2, ExternalLink, Github } from "lucide-react";

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

    // Form state
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
            // Use timestamp + random hex for reliable filename
            const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
            const filePath = `projects/${fileName}`;

            // Delete old image if exists and we are editing
            if (editingProject && formData.image_url) {
                try {
                    // Extract the storage path from the URL
                    // URL format: https://.../storage/v1/object/public/Portfolio/projects/filename.png
                    const urlParts = formData.image_url.split('/Portfolio/');
                    const oldPath = urlParts[1]; // Gets everything after "Portfolio/"
                    if (oldPath) {
                        await supabase.storage.from("Portfolio").remove([oldPath]);
                    }
                } catch (error) {
                    // Ignore errors when deleting old image
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
        if (!tenant?.id) {
            toast({ title: "Error", description: "Tenant context missing", variant: "destructive" });
            return;
        }

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
                console.error("Error saving project:", error);
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
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-2xl font-bold">Projects</h2>
                <Button onClick={() => handleOpenDialog()}>
                    <Plus className="h-4 w-4 mr-2" /> Add Project
                </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
                    <Card key={project.id} className="flex flex-col">
                        <div className="aspect-video w-full bg-muted relative overflow-hidden rounded-t-lg">
                            {project.image_url ? (
                                <>
                                    <img
                                        src={project.image_url}
                                        alt={project.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                    <div className="flex items-center justify-center h-full text-muted-foreground" style={{ display: 'none' }}>
                                        No Image
                                    </div>
                                </>
                            ) : (
                                <div className="flex items-center justify-center h-full text-muted-foreground">No Image</div>
                            )}
                        </div>
                        <CardHeader>
                            <CardTitle>{project.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="flex-1">
                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{project.description}</p>
                            <div className="flex flex-wrap gap-2">
                                {project.tech_stack?.map(tech => (
                                    <span key={tech} className="text-xs bg-secondary px-2 py-1 rounded-md">{tech}</span>
                                ))}
                            </div>
                        </CardContent>
                        <CardFooter className="flex justify-between border-t p-4">
                            <div className="flex gap-2">
                                {project.github_link && <a href={project.github_link} target="_blank" rel="noreferrer"><Github className="h-4 w-4" /></a>}
                                {project.demo_link && <a href={project.demo_link} target="_blank" rel="noreferrer"><ExternalLink className="h-4 w-4" /></a>}
                            </div>
                            <div className="flex gap-2">
                                <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(project)}>
                                    <Pencil className="h-4 w-4" />
                                </Button>
                                <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(project.id)}>
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </Card>
                ))}
            </div>

            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle>{editingProject ? "Edit Project" : "Add New Project"}</DialogTitle>
                        <DialogDescription>
                            {editingProject
                                ? "Edit the details of your project below."
                                : "Fill out the form below to add a new project to your portfolio."}
                        </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="space-y-2">
                            <Label>Title</Label>
                            <Input
                                value={formData.title}
                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Description</Label>
                            <Textarea
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Tech Stack</Label>
                            <div className="flex gap-2">
                                <Input
                                    value={techInput}
                                    onChange={(e) => setTechInput(e.target.value)}
                                    onKeyDown={(e) => e.key === "Enter" && addTech()}
                                    placeholder="Type and press Enter"
                                />
                                <Button type="button" onClick={addTech} variant="secondary">Add</Button>
                            </div>
                            <div className="flex flex-wrap gap-2 mt-2">
                                {formData.tech_stack?.map(tech => (
                                    <span key={tech} className="text-xs bg-secondary px-2 py-1 rounded-md flex items-center gap-1">
                                        {tech}
                                        <button onClick={() => removeTech(tech)} className="hover:text-destructive">×</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>GitHub Link</Label>
                                <Input
                                    value={formData.github_link}
                                    onChange={(e) => setFormData({ ...formData, github_link: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label>Demo Link</Label>
                                <Input
                                    value={formData.demo_link}
                                    onChange={(e) => setFormData({ ...formData, demo_link: e.target.value })}
                                />
                            </div>
                        </div>


                        <div className="space-y-2">
                            <Label>Project Image</Label>
                            <div className="flex items-center gap-4">
                                {formData.image_url && (
                                    <img
                                        src={formData.image_url}
                                        alt="Preview"
                                        className="w-20 h-20 object-cover rounded-md border"
                                        onError={(e) => {
                                            // Hide broken image and show error message
                                            (e.target as HTMLImageElement).style.display = 'none';
                                        }}
                                    />
                                )}
                                <Input type="file" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                            </div>
                            {uploading && <p className="text-sm text-muted-foreground">Uploading image...</p>}
                        </div>

                        <Button onClick={handleSave} disabled={loading || uploading} className="w-full">
                            {loading ? "Saving..." : "Save Project"}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ProjectsEditor;
