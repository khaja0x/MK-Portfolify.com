import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ExternalLink, Github, Code, Layers, Sparkles, Monitor, Cpu, Rocket } from "lucide-react";
import { motion } from "framer-motion";

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
    <section id="projects" className="py-32 px-6 bg-slate-950 relative overflow-hidden">
      {/* Dynamic Background Elements */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/4 left-0 w-96 h-96 bg-sky-500/5 rounded-full blur-[120px]" />
        <div className="absolute bottom-1/4 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-[120px]" />
      </div>

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800/80 border border-slate-700 text-sky-400 text-xs font-black uppercase tracking-widest backdrop-blur-md"
          >
            <Monitor size={14} />
            Showcase
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            Selected <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400 font-serif italic">Works</span>
          </h2>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            A collection of high-impact projects where code meets creativity to solve complex challenges.
          </p>
        </div>

        <div className="space-y-32">
          {projects.map((project, index) => (
            <motion.div
              key={project.id}
              initial={{ opacity: 0, y: 50 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.8 }}
              className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${index % 2 === 1 ? "lg:grid-flow-dense" : ""
                }`}
            >
              {/* Image Side with Premium Mockup Style */}
              <div className={`${index % 2 === 1 ? "lg:col-start-2" : ""} group relative`}>
                <div className="relative aspect-[16/10] rounded-[2.5rem] bg-slate-900 border border-slate-800 overflow-hidden shadow-3xl transform transition-all duration-700 group-hover:scale-[1.02] group-hover:-rotate-1">
                  {project.image_url ? (
                    <img
                      src={project.image_url}
                      alt={project.title}
                      className="w-full h-full object-cover transition-all duration-700 group-hover:scale-110"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 flex flex-col items-center justify-center p-12">
                      <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center text-sky-500 mb-6 group-hover:rotate-12 transition-transform">
                        <Layers size={40} />
                      </div>
                      <div className="h-4 w-48 bg-slate-800 rounded-full mb-3" />
                      <div className="h-4 w-32 bg-slate-800/50 rounded-full" />
                    </div>
                  )}

                  {/* Glass Card Overlay Link */}
                  <div className="absolute inset-0 bg-slate-950/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center backdrop-blur-sm">
                    <div className="flex gap-4 p-2 bg-white/10 rounded-3xl border border-white/20">
                      {project.demo_link && (
                        <Button
                          variant="default"
                          className="rounded-2xl h-14 px-6 font-black bg-white text-slate-900 hover:bg-slate-100 shadow-xl"
                          onClick={() => window.open(project.demo_link, '_blank')}
                        >
                          Visit Live <ExternalLink className="ml-2 h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>

                {/* Visual Flair Elements */}
                <div className="absolute -z-10 -top-6 -right-6 w-32 h-32 bg-sky-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
                <div className="absolute -z-10 -bottom-6 -left-6 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>

              {/* Content Side */}
              <div className="space-y-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sky-500 font-black text-sm uppercase tracking-widest">
                    <span className="w-10 h-px bg-sky-500" />
                    Project 0{index + 1}
                  </div>
                  <h3 className="text-4xl md:text-5xl font-black text-white tracking-tight group-hover:text-sky-400 transition-colors cursor-default">
                    {project.title}
                  </h3>
                </div>

                <p className="text-slate-400 text-xl font-medium leading-relaxed">
                  {project.description}
                </p>

                <div className="flex flex-wrap gap-3">
                  {project.tech_stack?.map((tech) => (
                    <span
                      key={tech}
                      className="px-5 py-2.5 text-xs font-black bg-slate-900 border border-slate-800 text-slate-300 rounded-2xl flex items-center gap-2 hover:bg-sky-500/5 hover:border-sky-500/30 hover:text-white transition-all cursor-default"
                    >
                      <Cpu size={14} className="text-sky-500" />
                      {tech}
                    </span>
                  ))}
                </div>

                <div className="flex gap-4 pt-4">
                  {project.github_link && (
                    <Button
                      variant="ghost"
                      className="h-14 px-8 rounded-2xl text-slate-400 font-bold hover:bg-slate-900 hover:text-white group"
                      onClick={() => window.open(project.github_link, '_blank')}
                    >
                      <Github className="mr-3 h-5 w-5 group-hover:scale-110 transition-transform" />
                      View Source
                    </Button>
                  )}
                  {project.demo_link && (
                    <Button
                      variant="ghost"
                      className="h-14 px-8 rounded-2xl text-slate-400 font-bold hover:bg-slate-900 hover:text-white group lg:hidden"
                      onClick={() => window.open(project.demo_link, '_blank')}
                    >
                      <ExternalLink className="mr-3 h-5 w-5" />
                      Live Site
                    </Button>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {projects.length === 0 && (
          <div className="text-center py-40 bg-slate-900/40 rounded-[3rem] border border-dashed border-slate-800">
            <Rocket size={64} className="mx-auto text-slate-700 mb-6" />
            <h3 className="text-2xl font-bold text-slate-300">Engineering in Progress</h3>
            <p className="text-slate-500 mt-2">Check back soon to see the latest missions.</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Projects;