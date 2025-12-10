import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Code2, Database, Layers, Wrench, Terminal, Cpu, Globe } from "lucide-react";

interface Skill {
  id: string;
  category: string;
  skill_name: string;
}

const iconMap: Record<string, any> = {
  "Frontend": Code2,
  "Backend": Database,
  "Tools": Layers,
  "Soft Skills": Wrench,
  "DevOps": Terminal,
  "Languages": Globe,
  "Other": Cpu
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

  // Group skills by category
  const groupedSkills = skills.reduce((acc, skill) => {
    if (!acc[skill.category]) acc[skill.category] = [];
    acc[skill.category].push(skill.skill_name);
    return acc;
  }, {} as Record<string, string[]>);

  // Default categories if empty (to avoid empty section on first load if no data)
  const displaySkills = Object.keys(groupedSkills).length > 0 ? groupedSkills : {
    "Frontend": ["React", "TypeScript", "Tailwind CSS"],
    "Backend": ["Node.js", "Supabase", "PostgreSQL"],
    "Tools": ["Git", "VS Code", "Docker"]
  };

  return (
    <section id="skills" className="py-24 px-4">
      <div className="container max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">Skills & Expertise</span>
          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            What I Bring to the <span className="text-gradient">Table</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            A comprehensive toolkit of modern technologies and professional skills
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {Object.entries(displaySkills).map(([category, skillsList], index) => {
            const Icon = iconMap[category] || Layers;
            return (
              <div
                key={category}
                className="p-6 rounded-2xl bg-card border border-border hover:border-primary/50 transition-all duration-300 hover:shadow-lg group"
                style={{ animationDelay: `${index * 100}ms` }}
              >
                <div className="mb-4 p-3 rounded-xl bg-primary/10 w-fit group-hover:scale-110 transition-transform duration-300">
                  <Icon className="h-6 w-6 text-primary" />
                </div>

                <h3 className="text-xl font-semibold mb-4">{category}</h3>

                <ul className="space-y-2">
                  {skillsList.map((skill) => (
                    <li key={skill} className="flex items-center text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                      {skill}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default Skills;
