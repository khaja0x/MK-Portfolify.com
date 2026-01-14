import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import { User, Sparkles, Code, Cpu } from "lucide-react";

const About = ({ tenantId }: { tenantId?: string }) => {
  const [aboutData, setAboutData] = useState({
    title: "",
    description: "",
    extra_text: "",
    profile_image_url: ""
  });
  const [imageError, setImageError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAbout();

    const channel = supabase
      .channel("about-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "about" }, () => {
        fetchAbout();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const fetchAbout = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from("about").select("*");

      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Error fetching about data:", error);
        return;
      }

      if (data) {
        setAboutData({
          title: data.title || "",
          description: data.description || "",
          extra_text: data.extra_text || "",
          profile_image_url: data.profile_image_url || ""
        });
        setImageError(false);
      }
    } catch (error) {
      console.error("Unexpected error fetching about data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <section id="about" className="py-32 px-6 bg-slate-950 relative overflow-hidden">
      {/* Decorative Grid Background */}
      <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-[0.02] pointer-events-none" />

      <div className="container max-w-6xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-center">

          {/* Image Side with Premium Border */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="relative z-10 aspect-square rounded-[3rem] overflow-hidden border-2 border-slate-800 bg-slate-900 group shadow-3xl">
              {aboutData.profile_image_url && !imageError ? (
                <img
                  src={aboutData.profile_image_url}
                  alt={aboutData.title || "Profile"}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-700 scale-105 group-hover:scale-100"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900">
                  <User size={120} className="text-slate-800" />
                  <div className="mt-4 text-slate-700 font-bold tracking-widest uppercase text-xs">Aesthetic Loading</div>
                </div>
              )}
              {/* Overlay Gradient */}
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            </div>

            {/* Glowing Accent Border Behinds */}
            <div className="absolute -top-6 -left-6 w-full h-full rounded-[3rem] border-2 border-sky-500/20 -z-10 animate-pulse" />
            <div className="absolute -bottom-6 -right-6 w-full h-full rounded-[3rem] bg-indigo-500/5 -z-20 blur-2xl" />

            {/* Floating Achievement Card */}
            <div className="absolute -bottom-10 -left-10 bg-white dark:bg-slate-900 rounded-3xl p-6 shadow-3xl border border-slate-100 dark:border-slate-800 animate-float hidden md:block">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-2xl flex items-center justify-center text-emerald-600">
                  <Sparkles size={24} />
                </div>
                <div>
                  <div className="text-sm font-black text-slate-900 dark:text-white uppercase tracking-tighter">Status</div>
                  <div className="text-xs text-emerald-500 font-bold">Open for Innovation</div>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Content Side */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 text-sky-500 font-black text-sm uppercase tracking-widest">
                <span className="w-8 h-px bg-sky-500" />
                Who Am I
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tight">
                {aboutData.title || "The Story Behind The Code"}
              </h2>
            </div>

            <div className="space-y-8 text-slate-400 text-xl leading-relaxed font-medium">
              <p className="first-letter:text-5xl first-letter:font-black first-letter:text-white first-letter:mr-3 first-letter:float-left">
                {aboutData.description}
              </p>

              {aboutData.extra_text && (
                <div className="p-8 rounded-[2rem] bg-slate-900/50 border border-slate-800/50 italic text-slate-300 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 p-4 text-slate-800 group-hover:text-sky-500/20 transition-colors">
                    <Code size={64} />
                  </div>
                  {aboutData.extra_text}
                </div>
              )}
            </div>

            {/* Micro Stats or Qualities */}
            <div className="grid grid-cols-2 gap-6 pt-6">
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
                  <Cpu size={20} className="text-sky-500" />
                </div>
                <span className="text-slate-300 font-bold">Problem Solver</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center border border-slate-800">
                  <Sparkles size={20} className="text-purple-500" />
                </div>
                <span className="text-slate-300 font-bold">Creative Thinker</span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;