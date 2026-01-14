import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import {
  Code2,
  Database,
  Layers,
  Wrench,
  Terminal,
  Cpu,
  Globe,
  Sparkles,
  CheckCircle2,
  Binary,
  Layers3,
  Container,
  Layout,
  Server,
  Workflow
} from "lucide-react";
import { motion } from "framer-motion";

interface Skill {
  id: string;
  category: string;
  skill_name: string;
}

const iconMap: Record<string, any> = {
  "Frontend": Layout,
  "Backend": Server,
  "Tools": Workflow,
  "Soft Skills": CheckCircle2,
  "DevOps": Container,
  "Languages": Binary,
  "Other": Cpu
};

const categoryColors: Record<string, { main: string; glow: string; border: string }> = {
  "Frontend": { main: "text-sky-400", glow: "bg-sky-400/10", border: "border-sky-400/20" },
  "Backend": { main: "text-emerald-400", glow: "bg-emerald-400/10", border: "border-emerald-400/20" },
  "Tools": { main: "text-purple-400", glow: "bg-purple-400/10", border: "border-purple-400/20" },
  "Languages": { main: "text-amber-400", glow: "bg-amber-400/10", border: "border-amber-400/20" },
  "Soft Skills": { main: "text-rose-400", glow: "bg-rose-400/10", border: "border-rose-400/20" },
  "DevOps": { main: "text-indigo-400", glow: "bg-indigo-400/10", border: "border-indigo-400/20" },
};

const Skills = ({ tenantId }: { tenantId?: string }) => {
  const [skills, setSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetchSkills();

    const channel = supabase
      .channel("skills-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "skills" }, () => {
        fetchSkills();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const fetchSkills = async () => {
    let query = supabase.from("skills").select("*").order("category");

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data } = await query;
    if (data) setSkills(data);
  };

  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill.skill_name);
    return acc;
  }, {} as Record<string, string[]>);

  const displaySkills = Object.keys(groupedSkills).length > 0 ? groupedSkills : {
    "Frontend": ["React", "TypeScript", "Tailwind CSS", "Next.js", "Framer Motion"],
    "Backend": ["Node.js", "Supabase", "PostgreSQL", "Prisma", "Express.js"],
    "DevOps": ["Git", "Docker", "CI/CD", "AWS", "Vercel"],
    "Tools": ["VS Code", "Figma", "Postman", "TablePlus"]
  };

  return (
    <section id="skills" className="py-32 px-6 bg-slate-950 relative overflow-hidden">
      {/* Premium Background Ambiance */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-sky-500/5 rounded-full blur-[140px] opacity-50" />
        <div className="absolute -top-40 -left-40 w-[600px] h-[600px] bg-purple-500/5 rounded-full blur-[140px]" />
        <div className="absolute -bottom-40 -right-40 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px]" />
      </div>

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-28 space-y-6">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-900/80 border border-slate-800 text-sky-400 text-xs font-black uppercase tracking-[0.3em] backdrop-blur-xl shadow-2xl"
          >
            <Sparkles size={14} className="animate-pulse" />
            Capabilities
          </motion.div>

          <h2 className="text-6xl md:text-8xl font-black text-white tracking-tighter">
            Technical <span className="text-transparent bg-clip-text bg-gradient-to-br from-sky-400 via-indigo-400 to-purple-400 font-serif italic py-4">Arsenal</span>
          </h2>

          <p className="text-slate-400 text-xl font-medium max-w-3xl mx-auto leading-relaxed">
            Meticulously crafted solutions using a robust ecosystem of cutting-edge technologies and modern development practices.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 xl:grid-cols-4 gap-8">
          {Object.entries(displaySkills).map(([category, skillsList], index) => {
            const Icon = iconMap[category] || Layers3;
            const colors = categoryColors[category] || { main: "text-slate-400", glow: "bg-slate-400/10", border: "border-slate-400/20" };

            return (
              <motion.div
                key={category}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.7, delay: index * 0.1 }}
                className="group relative h-full"
              >
                {/* Glow Effect Layer */}
                <div className={`absolute inset-0 ${colors.glow} blur-3xl opacity-0 group-hover:opacity-40 transition-opacity duration-700 rounded-[3rem]`} />

                <div className="h-full p-10 rounded-[3rem] bg-slate-900/40 border border-slate-800/50 backdrop-blur-xl relative z-10 hover:border-slate-700/80 transition-all duration-500 flex flex-col items-start overflow-hidden">

                  {/* Category Accent */}
                  <div className={`mb-10 p-5 rounded-3xl ${colors.glow} ${colors.main} ${colors.border} border shadow-inner transform transition-transform duration-500 group-hover:scale-110 group-hover:rotate-6`}>
                    <Icon size={32} strokeWidth={2.5} />
                  </div>

                  <div className="w-full space-y-2 mb-8">
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-500 flex items-center gap-2">
                      <span className={`w-2 h-2 rounded-full ${colors.glow} border ${colors.border}`} />
                      Category 0{index + 1}
                    </div>
                    <h3 className="text-3xl font-black text-white tracking-tight">{category}</h3>
                  </div>

                  <div className="flex flex-wrap gap-2.5 mt-auto">
                    {skillsList.map((skill) => (
                      <span
                        key={skill}
                        className="px-4 py-2 rounded-xl bg-slate-950/50 border border-slate-800/80 text-slate-300 font-bold text-xs flex items-center gap-2 hover:bg-white hover:text-slate-950 transition-all duration-300 cursor-default shadow-sm"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>

                  {/* Visual Pattern Overlays */}
                  <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                    <Binary size={120} className="text-white" />
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Bottom Status Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          className="mt-24 pt-10 border-t border-slate-900 flex flex-col md:flex-row items-center justify-between gap-6 text-slate-500"
        >
          <div className="flex items-center gap-3">
            <div className="flex -space-x-2">
              {[1, 2, 3].map(i => (
                <div key={i} className="w-8 h-8 rounded-full border-2 border-slate-950 bg-slate-800 flex items-center justify-center">
                  <Cpu size={14} className="text-sky-500" />
                </div>
              ))}
            </div>
            <span className="text-sm font-medium tracking-wide">Continuous Learning & Evolution</span>
          </div>
          <div className="flex gap-8 text-xs font-black uppercase tracking-widest italic">
            <span>Adaptive Design</span>
            <span>Performant Code</span>
            <span>Scalable Systems</span>
          </div>
        </motion.div>
      </div>
    </section>
  );
};

export default Skills;
