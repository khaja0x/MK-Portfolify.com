import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Briefcase, Calendar, Award, Code, MapPin, Sparkles } from 'lucide-react';
import { motion } from "framer-motion";

interface Experience {
  id: string;
  company: string;
  role: string;
  period: string;
  details: string[];
  skills_used: string[];
}

const Experience = ({ tenantId }: { tenantId?: string }) => {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  useEffect(() => {
    fetchExperience();

    const channel = supabase
      .channel("experience-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "experience" }, () => {
        fetchExperience();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const fetchExperience = async () => {
    let query = supabase.from("experience").select("*").order("created_at", { ascending: false });

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data } = await query;
    if (data) setExperiences(data);
  };

  return (
    <section id="experience" className="py-32 px-6 bg-slate-950 relative">
      {/* Background Timeline Glow */}
      <div className="absolute left-1/2 -translate-x-1/2 top-0 bottom-0 w-px bg-gradient-to-b from-transparent via-slate-800 to-transparent hidden lg:block" />

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="text-center mb-24 space-y-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-800 border border-slate-700 text-sky-400 text-xs font-black uppercase tracking-widest"
          >
            <Briefcase size={14} />
            Professional Journey
          </motion.div>
          <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
            Career <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Milestones</span>
          </h2>
          <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto leading-relaxed">
            A chronological timeline of my professional growth, key achievements, and the teams I've helped succeed.
          </p>
        </div>

        <div className="space-y-24">
          {experiences.map((exp, index) => (
            <motion.div
              key={exp.id}
              initial={{ opacity: 0, x: index % 2 === 0 ? -30 : 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
              className={`relative flex flex-col lg:flex-row gap-12 items-center ${index % 2 === 1 ? "lg:flex-row-reverse" : ""
                }`}
              onMouseEnter={() => setActiveIndex(index)}
              onMouseLeave={() => setActiveIndex(null)}
            >
              {/* Timeline Center Point */}
              <div className="absolute left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-sky-500 hidden lg:block border-4 border-slate-950 shadow-[0_0_15px_rgba(14,165,233,0.5)] z-20" />

              {/* Date Column */}
              <div className={`lg:w-1/2 flex ${index % 2 === 0 ? "lg:justify-end" : "lg:justify-start"}`}>
                <div className="inline-flex items-center gap-3 px-6 py-3 rounded-2xl bg-slate-900 border border-slate-800 text-sky-400 font-black text-lg shadow-2xl backdrop-blur-md">
                  <Calendar size={20} />
                  {exp.period}
                </div>
              </div>

              {/* Card Column */}
              <div className={`lg:w-1/2 flex ${index % 2 === 0 ? "lg:justify-start" : "lg:justify-end"}`}>
                <div className="w-full max-w-2xl p-8 md:p-10 rounded-[2.5rem] bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl hover:border-sky-500/30 transition-all duration-500 shadow-3xl group">
                  <div className="space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <h3 className="text-3xl font-black text-white group-hover:text-sky-400 transition-colors">{exp.role}</h3>
                        <div className="flex items-center gap-2 text-slate-400 font-bold">
                          <Sparkles size={16} className="text-sky-500" />
                          {exp.company}
                        </div>
                      </div>
                      <div className="w-12 h-12 bg-slate-950 rounded-2xl flex items-center justify-center border border-slate-800 text-slate-500 group-hover:text-sky-500 group-hover:border-sky-500/20 transition-all">
                        <Award size={24} />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="text-sm font-black text-slate-500 uppercase tracking-widest">Key Accomplishments</div>
                      <ul className="space-y-4">
                        {exp.details?.map((detail, i) => (
                          <li key={i} className="flex items-start gap-3 text-slate-400 font-medium leading-relaxed group/li">
                            <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-sky-500 group-hover/li:scale-150 transition-transform" />
                            {detail}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="pt-4 flex flex-wrap gap-2">
                      {exp.skills_used?.map((skill, i) => (
                        <span
                          key={i}
                          className="px-4 py-2 rounded-xl bg-slate-950 border border-slate-800 text-slate-500 text-xs font-black uppercase tracking-tighter hover:bg-sky-500/10 hover:border-sky-500/30 hover:text-sky-400 transition-all"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {experiences.length === 0 && (
          <div className="text-center py-32 bg-slate-900 shadow-inner rounded-[3rem]">
            <p className="text-slate-500 font-bold italic">The timeline is being written...</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default Experience;