import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Github, Linkedin, Mail, Twitter, Zap, ArrowUp, Heart } from "lucide-react";
import { motion } from "framer-motion";

const Footer = ({ tenantId }: { tenantId?: string }) => {
  const currentYear = new Date().getFullYear();
  const [footerData, setFooterData] = useState({
    name: "Portfolio",
    social_links: {
      github: "",
      linkedin: "",
      twitter: "",
      email: ""
    }
  });

  useEffect(() => {
    fetchFooterData();
  }, [tenantId]);

  const fetchFooterData = async () => {
    let query = supabase.from("hero").select("name, social_links");

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data } = await query.maybeSingle();
    if (data) {
      setFooterData({
        name: data.name || "Portfolio",
        social_links: data.social_links || { github: "", linkedin: "", twitter: "", email: "" }
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="py-20 px-6 bg-slate-950 border-t border-slate-900 relative overflow-hidden">
      {/* Decorative Light Burst */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[200%] h-32 bg-sky-500/5 blur-[100px] pointer-events-none" />

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="flex flex-col md:flex-row justify-between items-start gap-16 mb-20">

          {/* Brand Left */}
          <div className="space-y-6 max-w-md">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                <Zap size={22} fill="currentColor" />
              </div>
              <h3 className="text-3xl font-black text-white tracking-tighter">
                {footerData.name}
              </h3>
            </div>
            <p className="text-slate-400 text-lg font-medium leading-relaxed">
              Design-driven developer focused on building high-performance digital products and memorable user experiences.
            </p>
            <div className="flex gap-4">
              {footerData.social_links.github && (
                <a href={footerData.social_links.github} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 hover:text-white hover:bg-slate-800 transition-all border border-slate-800/50">
                  <Github size={20} />
                </a>
              )}
              {footerData.social_links.linkedin && (
                <a href={footerData.social_links.linkedin} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 hover:text-[#0077b5] hover:bg-slate-800 transition-all border border-slate-800/50">
                  <Linkedin size={20} />
                </a>
              )}
              {footerData.social_links.twitter && (
                <a href={footerData.social_links.twitter} target="_blank" rel="noopener noreferrer" className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 hover:text-[#1da1f2] hover:bg-slate-800 transition-all border border-slate-800/50">
                  <Twitter size={20} />
                </a>
              )}
              <a href={`mailto:${footerData.social_links.email}`} className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center text-slate-500 hover:text-sky-400 hover:bg-slate-800 transition-all border border-slate-800/50">
                <Mail size={20} />
              </a>
            </div>
          </div>

          {/* Quick Nav Right */}
          <div className="grid grid-cols-2 gap-16">
            <div className="space-y-6">
              <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Explore</h4>
              <ul className="space-y-4">
                {['About', 'Skills', 'Projects', 'Experience'].map((item) => (
                  <li key={item}>
                    <a href={`#${item.toLowerCase()}`} className="text-slate-400 hover:text-sky-400 font-bold transition-all flex items-center gap-2 group">
                      <span className="w-0 h-0.5 bg-sky-500 group-hover:w-4 transition-all" />
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
            <div className="space-y-6">
              <h4 className="text-sm font-black text-white uppercase tracking-[0.2em]">Utilities</h4>
              <ul className="space-y-4">
                <li><button onClick={scrollToTop} className="text-slate-400 hover:text-sky-400 font-bold transition-all flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-sky-500 group-hover:w-4 transition-all" />
                  Back to Top
                </button></li>
                <li><a href="/" className="text-slate-400 hover:text-sky-400 font-bold transition-all flex items-center gap-2 group">
                  <span className="w-0 h-0.5 bg-sky-500 group-hover:w-4 transition-all" />
                  Portfolify Home
                </a></li>
              </ul>
            </div>
          </div>
        </div>

        {/* Legal / Credit Bottom */}
        <div className="pt-12 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-8">
          <p className="text-slate-500 font-medium">
            &copy; {currentYear} {footerData.name}. All systems operational.
          </p>
          <div className="flex items-center gap-2 font-black text-xs text-slate-500 uppercase tracking-widest bg-slate-900/50 px-5 py-2.5 rounded-full border border-slate-800">
            Design with <Heart size={14} className="text-rose-500 fill-rose-500 mx-1" /> from the future
          </div>
        </div>
      </div>

      {/* Scroll to Top Floating Button (Static in footer context but fits the theme) */}
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={scrollToTop}
        className="absolute right-10 bottom-10 w-14 h-14 bg-white rounded-2xl flex items-center justify-center text-slate-950 shadow-3xl hover:bg-sky-500 hover:text-white transition-all group"
      >
        <ArrowUp className="group-hover:-translate-y-1 transition-transform" />
      </motion.button>
    </footer>
  );
};

export default Footer;
