



import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Menu, X, User } from "lucide-react";
import { supabase } from "@/lib/supabase";

const Navigation = ({ tenantId }: { tenantId?: string }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [profileImage, setProfileImage] = useState<string>("");
  const [logoInitials, setLogoInitials] = useState("MK");

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Fetch profile data from Supabase
  useEffect(() => {
    fetchProfileData();

    // Subscribe to real-time changes
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
      // Extract initials from title if available
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
      el.scrollIntoView({ behavior: "smooth" });
      setIsMobileMenuOpen(false);
    }
  };

  const navItems = [
    { id: "about", label: "About" },
    { id: "skills", label: "Skills" },
    { id: "projects", label: "Projects" },
    { id: "experience", label: "Experience" },
    { id: "contact", label: "Contact" },
  ];

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${isScrolled
        ? "bg-background/80 backdrop-blur-lg border-b border-border shadow-lg"
        : "bg-transparent"
        }`}
    >
      <div className="container max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">

          {/* Dynamic Logo */}
          <button
            onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
            className="flex items-center gap-2 group"
          >
            {profileImage ? (
              <img
                src={profileImage}
                alt="Logo"
                className="h-10 w-10 rounded-full object-cover border-2 border-primary/20 transition-all duration-300 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-lg"
                onError={(e) => {
                  // Fallback if image fails to load
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
            ) : null}
            {!profileImage && (
              <div className="h-10 w-10 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center transition-all duration-300 group-hover:scale-110 group-hover:border-primary/40 group-hover:shadow-lg">
                <span className="text-sm font-bold text-primary">{logoInitials}</span>
              </div>
            )}
          </button>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => scrollToSection(item.id)}
                className="text-sm font-medium text-foreground hover:text-primary transition-colors relative group"
              >
                {item.label}
                <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </button>
            ))}
            <Button
              onClick={() => scrollToSection("contact")}
              size="sm"
              className="bg-gradient-primary shadow-glow"
            >
              Hire Me
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden py-4 animate-fade-in">
            <div className="flex flex-col gap-4">
              {navItems.map((item) => (
                <button
                  key={item.id}
                  onClick={() => scrollToSection(item.id)}
                  className="text-left px-4 py-2 hover:bg-secondary rounded-lg transition-colors"
                >
                  {item.label}
                </button>
              ))}
              <Button
                onClick={() => scrollToSection("contact")}
                size="sm"
                className="bg-gradient-primary shadow-glow"
              >
                Hire Me
              </Button>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navigation;
