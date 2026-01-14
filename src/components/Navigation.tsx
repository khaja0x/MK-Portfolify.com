import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User, Zap, Sparkles } from "lucide-react";
import { supabase } from "@/lib/supabase";
import { motion, AnimatePresence } from "framer-motion";

const Navigation = ({ tenantId }: { tenantId?: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [logoInitials, setLogoInitials] = useState("MK");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    fetchProfileData();

    const channel = supabase
      .channel("about-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "about" }, () => {
        fetchProfileData();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const fetchProfileData = async () => {
    let query = supabase.from("about").select("profile_image_url, title");

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data } = await query.maybeSingle();
    if (data) {
      setProfileImage(data.profile_image_url || "");
      if (data.title) {
        const words = data.title.split(" ");
        const initials = words.map(w => w[0]).join("").substring(0, 2).toUpperCase();
        setLogoInitials(initials || "MK");
      }
    }
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = el.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth"
      });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: "about", label: "Identity" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Work" },
    { id: "experience", label: "Journey" },
    { id: "contact", label: "Connect" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-500 ${isScrolled
          ? "py-4"
          : "py-8"
        }`}
    >
      <div className="container max-w-7xl mx-auto px-6">
        <div className={`
          flex items-center justify-between px-6 h-20 rounded-[2rem] transition-all duration-500
          ${isScrolled
            ? "bg-slate-950/80 backdrop-blur-2xl border border-slate-800/50 shadow-3xl"
            : "bg-transparent border border-transparent"}
        `}>

          {/* Dynamic Logo / Brand */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-4 group hover:scale-105 transition-transform"
          >
            <div className="relative">
              {profileImage ? (
                <img
                  src={profileImage}
                  alt="Logo"
                  className="h-12 w-12 rounded-2xl object-cover border-2 border-slate-800 group-hover:border-sky-500/50 transition-all shadow-xl"
                />
              ) : (
                <div className="h-12 w-12 rounded-2xl bg-slate-900 border-2 border-slate-800 flex items-center justify-center text-sky-400 font-black shadow-xl">
                  {logoInitials}
                </div>
              )}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950 animate-pulse" />
            </div>
            <div className="text-left leading-tight hidden sm:block">
              <div className="text-white font-black tracking-tighter uppercase text-sm">System Status</div>
              <div className="text-sky-400 font-bold text-xs uppercase tracking-widest">Active</div>
            </div>
          </button>

          {/* Desktop Navigation Link Group */}
          <div className="hidden lg:flex items-center gap-2">
            <div className="flex items-center p-1.5 bg-slate-900/50 rounded-2xl border border-slate-800/50 mr-2">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="px-6 py-2.5 text-sm font-bold text-slate-400 hover:text-white transition-all rounded-xl hover:bg-slate-800 relative group"
                >
                  {item.label}
                  <motion.div
                    initial={{ opacity: 0, scale: 0 }}
                    whileHover={{ opacity: 1, scale: 1 }}
                    className="absolute -top-1 -right-1"
                  >
                    <Sparkles size={8} className="text-sky-500" />
                  </motion.div>
                </button>
              ))}
            </div>

            <Button
              onClick={() => scrollToSection("contact")}
              size="lg"
              className="h-14 px-8 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-black shadow-lg shadow-sky-500/20 group overflow-hidden"
            >
              Contact Me
              <Zap size={16} fill="currentColor" className="ml-2 group-hover:scale-125 transition-transform" />
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="lg:hidden w-12 h-12 flex items-center justify-center bg-slate-900 border border-slate-800 rounded-2xl text-white hover:bg-slate-800 transition-colors"
          >
            {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="lg:hidden mt-4 p-6 bg-slate-950/95 backdrop-blur-3xl border border-slate-800 rounded-[2.5rem] shadow-3xl"
            >
              <div className="flex flex-col gap-3">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => scrollToSection(item.id)}
                    className="text-left px-6 py-4 text-lg font-bold text-slate-300 hover:text-white hover:bg-slate-900 rounded-2xl transition-all border border-transparent hover:border-slate-800"
                  >
                    {item.label}
                  </button>
                ))}
                <div className="h-px bg-slate-800 my-2" />
                <Button
                  onClick={() => scrollToSection("contact")}
                  size="lg"
                  className="h-16 rounded-2xl bg-sky-400 text-slate-950 font-black"
                >
                  Launch Collaboration
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </nav>
  );
};

export default Navigation;
