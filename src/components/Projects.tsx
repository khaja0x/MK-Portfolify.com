// import { Button } from "@/components/ui/button";
// import { ExternalLink, Github } from "lucide-react";

// const projects = [
//   {
//     title: "E-Commerce Platform",
//     description: "A full-featured online shopping platform with real-time inventory management, secure payment processing, and personalized recommendations.",
//     problem: "Local retailers needed an affordable way to expand their business online",
//     solution: "Built a scalable platform with React, Node.js, and Stripe integration",
//     impact: "Increased client revenue by 150% in first 6 months",
//     tech: ["React", "Node.js", "MongoDB", "Stripe", "AWS"],
//     image: "bg-gradient-to-br from-blue-500 to-cyan-400",
//   },
//   {
//     title: "Task Management SaaS",
//     description: "Collaborative project management tool with real-time updates, team chat, and advanced analytics dashboard.",
//     problem: "Teams struggled with scattered communication and task tracking",
//     solution: "Created an all-in-one platform with WebSocket for live collaboration",
//     impact: "Improved team productivity by 40%, reduced meeting time by 30%",
//     tech: ["Next.js", "TypeScript", "PostgreSQL", "Socket.io", "Tailwind"],
//     image: "bg-gradient-to-br from-purple-500 to-pink-400",
//   },
//   {
//     title: "Healthcare Dashboard",
//     description: "Patient management system with appointment scheduling, medical records, and telemedicine integration.",
//     problem: "Clinic needed to digitize patient records and reduce administrative work",
//     solution: "Developed secure, HIPAA-compliant platform with role-based access",
//     impact: "Reduced paperwork by 80%, improved patient satisfaction by 65%",
//     tech: ["React", "Express", "MySQL", "Redis", "Docker"],
//     image: "bg-gradient-to-br from-green-500 to-emerald-400",
//   },
// ];

// const Projects = () => {
//   return (
//     <section id="projects" className="py-24 px-4 bg-gradient-subtle">
//       <div className="container max-w-6xl mx-auto">
//         <div className="text-center mb-16">
//           <span className="text-primary font-semibold text-sm uppercase tracking-wider">Portfolio</span>
//           <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
//             Featured <span className="text-gradient">Projects</span>
//           </h2>
//           <p className="text-muted-foreground max-w-2xl mx-auto">
//             Real solutions for real problems. Here are some projects I'm proud of.
//           </p>
//         </div>

//         <div className="space-y-12">
//           {projects.map((project, index) => (
//             <div
//               key={project.title}
//               className={`grid md:grid-cols-2 gap-8 items-center ${
//                 index % 2 === 1 ? "md:grid-flow-dense" : ""
//               }`}
//             >
//               {/* Image */}
//               <div className={index % 2 === 1 ? "md:col-start-2" : ""}>
//                 <div className={`aspect-video rounded-2xl ${project.image} shadow-lg relative overflow-hidden group`}>
//                   <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
//                   <div className="absolute bottom-4 left-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
//                     <div className="flex gap-2">
//                       <Button size="sm" variant="secondary" className="gap-2">
//                         <Github className="h-4 w-4" />
//                         Code
//                       </Button>
//                       <Button size="sm" variant="secondary" className="gap-2">
//                         <ExternalLink className="h-4 w-4" />
//                         Live Demo
//                       </Button>
//                     </div>
//                   </div>
//                 </div>
//               </div>

//               {/* Content */}
//               <div className="space-y-4">
//                 <h3 className="text-3xl font-bold">{project.title}</h3>
//                 <p className="text-muted-foreground leading-relaxed">{project.description}</p>

//                 <div className="space-y-3">
//                   <div>
//                     <span className="text-sm font-semibold text-primary">Problem:</span>
//                     <p className="text-sm text-muted-foreground mt-1">{project.problem}</p>
//                   </div>
//                   <div>
//                     <span className="text-sm font-semibold text-primary">Solution:</span>
//                     <p className="text-sm text-muted-foreground mt-1">{project.solution}</p>
//                   </div>
//                   <div>
//                     <span className="text-sm font-semibold text-accent">Impact:</span>
//                     <p className="text-sm text-muted-foreground mt-1">{project.impact}</p>
//                   </div>
//                 </div>

//                 <div className="flex flex-wrap gap-2 pt-2">
//                   {project.tech.map((tech) => (
//                     <span
//                       key={tech}
//                       className="px-3 py-1 text-xs font-medium bg-secondary text-secondary-foreground rounded-full"
//                     >
//                       {tech}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           ))}
//         </div>
//       </div>
//     </section>
//   );
// };

// export default Projects;





/////1



import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Code, Layers } from "lucide-react";

interface Project {
  id: string;
  title: string;
  description: string;
  tech_stack: string[];
  image_url: string;
  github_link: string;
  demo_link: string;
}

const Projects = ({ tenantId }: { tenantId?: string }) => {
  const [projects, setProjects] = useState<Project[]>([]);

  useEffect(() => {
    fetchProjects();

    const channel = supabase
      .channel("projects-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "projects" }, () => {
        fetchProjects();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const fetchProjects = async () => {
    let query = supabase.from("projects").select("*").order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data } = await query;
    if (data) setProjects(data);
  };

  return (
    <section id="projects" className="py-24 px-4 bg-gradient-subtle relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider inline-block px-3 py-1 bg-primary/10 rounded-full mb-4">Portfolio</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            Featured <span className="text-gradient">Projects</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Real solutions for real problems. Here are some projects I'm proud of.
          </p>
        </div>

        <div className="space-y-16">
          {projects.map((project, index) => (
            <div
              key={project.id}
              className={`grid md:grid-cols-2 gap-8 lg:gap-12 items-center ${index % 2 === 1 ? "md:grid-flow-dense" : ""
                } group`}
            >
              {/* Image */}
              <div className={index % 2 === 1 ? "md:col-start-2" : ""}>
                <div className="aspect-video rounded-2xl bg-muted shadow-xl relative overflow-hidden transition-all duration-500 group-hover:shadow-2xl group-hover:scale-[1.02]">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        // Fallback to placeholder if image fails to load
                        const target = e.target as HTMLImageElement;
                        target.style.display = 'none';
                        const fallback = target.nextElementSibling as HTMLElement;
                        if (fallback) fallback.style.display = 'flex';
                      }}
                    />
                  ) : null}
                  <div
                    className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center"
                    style={{ display: project.image_url ? 'none' : 'flex' }}
                  >
                    <Layers className="h-12 w-12 text-muted-foreground/50" />
                  </div>

                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-end p-6">
                    <div className="w-full">
                      <div className="flex gap-3 mb-4">
                        {project.github_link && (
                          <Button size="sm" variant="secondary" className="gap-2 shadow-md hover:shadow-lg transition-shadow" onClick={() => window.open(project.github_link, '_blank')}>
                            <Github className="h-4 w-4" />
                            Code
                          </Button>
                        )}
                        {project.demo_link && (
                          <Button size="sm" variant="secondary" className="gap-2 shadow-md hover:shadow-lg transition-shadow" onClick={() => window.open(project.demo_link, '_blank')}>
                            <ExternalLink className="h-4 w-4" />
                            Live Demo
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-5">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <Code className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-3xl font-bold">{project.title}</h3>
                </div>

                <p className="text-muted-foreground leading-relaxed text-lg">{project.description}</p>

                <div className="flex flex-wrap gap-2 pt-2">
                  {project.tech_stack?.map((tech) => (
                    <span
                      key={tech}
                      className="px-3 py-1.5 text-xs font-medium bg-primary/10 text-primary rounded-full flex items-center gap-1"
                    >
                      <Code className="h-3 w-3" />
                      {tech}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-20 text-muted-foreground">
            <p>No projects added yet. Check back soon!</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;