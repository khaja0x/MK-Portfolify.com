import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Linkedin, Mail, Twitter, ChevronDown, Rocket, FileText, Send } from "lucide-react";
import { motion } from "framer-motion";

const Hero = ({ tenantId }: { tenantId?: string }) => {
  const [heroData, setHeroData] = useState({
    name: "",
    title: "",
    subtitle: "",
    cta_text: "View My Work",
    cta_link: "projects",
    resume_url: "",
    social_links: {
      github: "",
      linkedin: "",
      twitter: "",
      email: ""
    }
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHero();

    const channel = supabase
      .channel("hero-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "hero" }, () => {
        fetchHero();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const fetchHero = async () => {
    try {
      setIsLoading(true);
      let query = supabase.from("hero").select("*");

      if (tenantId) {
        query = query.eq("tenant_id", tenantId);
      }

      const { data, error } = await query.maybeSingle();

      if (error) {
        console.error("Error fetching hero data:", error);
        return;
      }

      if (data) {
        setHeroData(prevData => ({
          name: data.name || prevData.name,
          title: data.title || prevData.title,
          subtitle: data.subtitle || prevData.subtitle,
          cta_text: data.cta_text || prevData.cta_text,
          cta_link: data.cta_link || prevData.cta_link,
          resume_url: data.resume_url || prevData.resume_url,
          social_links: {
            github: data.social_links?.github || prevData.social_links.github,
            linkedin: data.social_links?.linkedin || prevData.social_links.linkedin,
            twitter: data.social_links?.twitter || prevData.social_links.twitter,
            email: data.social_links?.email || prevData.social_links.email
          }
        }));
      }
    } catch (error) {
      console.error("Unexpected error fetching hero data:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <section className="min-h-screen flex items-center justify-center bg-slate-950 px-6 py-20 pt-24 overflow-hidden">
        <div className="container max-w-6xl mx-auto text-center space-y-8 animate-pulse">
          <div className="h-4 w-32 bg-slate-800 rounded-full mx-auto" />
          <div className="h-24 w-3/4 bg-slate-800 rounded-[2.5rem] mx-auto" />
          <div className="h-10 w-2/3 bg-slate-800 rounded-full mx-auto" />
          <div className="h-16 w-1/2 bg-slate-800/50 rounded-2xl mx-auto" />
          <div className="flex gap-4 justify-center pt-8">
            <div className="h-14 w-40 bg-slate-800 rounded-2xl" />
            <div className="h-14 w-40 bg-slate-800 rounded-2xl" />
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-6 py-20 pt-32 relative overflow-hidden bg-background">
      {/* Background Decorative Elements */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-[0.03]" />
      </div>

      <div className="container max-w-6xl mx-auto relative z-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="space-y-10"
        >
          {/* Badge Greeting */}
          <div className="inline-flex items-center gap-2.5 px-6 py-2.5 rounded-full bg-slate-900/80 border border-slate-800 text-sm font-bold tracking-widest text-sky-400 uppercase backdrop-blur-md shadow-2xl">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-sky-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-sky-500" />
            </span>
            Discovery Mode Active
          </div>

          {/* Name & Title */}
          <div className="space-y-6">
            <h1 className="text-7xl md:text-9xl font-black tracking-tight text-foreground leading-none">
              <span className="inline-block hover:scale-[1.02] transition-transform cursor-default">
                {heroData.name}
              </span>
            </h1>
            <h2 className="text-3xl md:text-5xl font-bold bg-gradient-to-r from-slate-200 via-slate-400 to-slate-500 bg-clip-text text-transparent max-w-4xl mx-auto leading-tight italic">
              {heroData.title}
            </h2>
          </div>

          {/* Subtitle */}
          <p className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed font-medium">
            {heroData.subtitle}
          </p>

          {/* CTA Group */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center pt-10">
            <Button
              size="lg"
              className="h-16 px-10 rounded-[1.5rem] bg-sky-500 hover:bg-sky-600 text-white text-xl font-black shadow-2xl shadow-sky-500/30 group transition-all hover:-translate-y-1 active:scale-95"
              onClick={() => document.getElementById(heroData.cta_link || 'projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {heroData.cta_text}
              <ArrowRight className="ml-3 h-6 w-6 group-hover:translate-x-1.5 transition-transform" />
            </Button>

            <div className="flex gap-4">
              {heroData.resume_url && (
                <Button
                  size="lg"
                  variant="outline"
                  className="h-16 px-8 rounded-[1.5rem] border-slate-700 bg-slate-900/50 text-white text-lg font-bold hover:bg-slate-800 hover:border-slate-600 transition-all hover:-translate-y-1 active:scale-95"
                  asChild
                >
                  <a href={heroData.resume_url} target="_blank" rel="noopener noreferrer">
                    <FileText className="mr-2 h-5 w-5" /> Resume
                  </a>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="h-16 px-8 rounded-[1.5rem] border-border bg-card text-foreground text-lg font-bold hover:bg-accent hover:border-slate-600 transition-all hover:-translate-y-1 active:scale-95"
                onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
              >
                <Send className="mr-2 h-5 w-5" /> Let's Chat
              </Button>
            </div>
          </div>

          {/* Social Icons Bar */}
          <div className="flex items-center justify-center gap-8 pt-16">
            <div className="h-px w-12 bg-slate-800 md:block hidden" />
            <div className="flex gap-8">
              {heroData.social_links.github && (
                <a href={heroData.social_links.github} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-all transform hover:scale-125 duration-300">
                  <Github size={28} />
                </a>
              )}
              {heroData.social_links.linkedin && (
                <a href={heroData.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#0077b5] transition-all transform hover:scale-125 duration-300">
                  <Linkedin size={28} />
                </a>
              )}
              {heroData.social_links.twitter && (
                <a href={heroData.social_links.twitter} target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-[#1da1f2] transition-all transform hover:scale-125 duration-300">
                  <Twitter size={28} />
                </a>
              )}
              {heroData.social_links.email && (
                <a href={`mailto:${heroData.social_links.email}`} className="text-slate-500 hover:text-sky-400 transition-all transform hover:scale-125 duration-300">
                  <Mail size={28} />
                </a>
              )}
            </div>
            <div className="h-px w-12 bg-slate-800 md:block hidden" />
          </div>
        </motion.div>
      </div>

      {/* Modern Mouse Scroll Indicator */}
      <div
        className="absolute bottom-12 left-1/2 -translate-x-1/2 cursor-pointer flex flex-col items-center gap-4 group"
        onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}
      >
        <div className="w-8 h-12 rounded-full border-2 border-slate-700 p-2 flex justify-center">
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 1.5, repeat: Infinity, ease: "easeInOut" }}
            className="w-1.5 h-3 bg-sky-500 rounded-full"
          />
        </div>
        <span className="text-[10px] font-black uppercase text-slate-500 tracking-[0.3em] group-hover:text-slate-300 transition-colors">Navigation</span>
      </div>
    </section>
  );
};

export default Hero;
