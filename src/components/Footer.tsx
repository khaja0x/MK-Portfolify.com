import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Github, Linkedin, Mail, Heart, Twitter } from "lucide-react";

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

  return (
    <footer className="py-12 px-4 border-t border-border">
      <div className="container max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <div>
            <h3 className="text-xl font-bold text-gradient mb-2">{footerData.name}</h3>
            <p className="text-sm text-muted-foreground">
              Building digital experiences that make a difference.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-3">Quick Links</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#about" className="text-muted-foreground hover:text-primary transition-colors">
                  About
                </a>
              </li>
              <li>
                <a href="#skills" className="text-muted-foreground hover:text-primary transition-colors">
                  Skills
                </a>
              </li>
              <li>
                <a href="#projects" className="text-muted-foreground hover:text-primary transition-colors">
                  Projects
                </a>
              </li>
              <li>
                <a href="#experience" className="text-muted-foreground hover:text-primary transition-colors">
                  Experience
                </a>
              </li>
              <li>
                <a href="#contact" className="text-muted-foreground hover:text-primary transition-colors">
                  Contact
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold mb-3">Connect</h4>
            <div className="flex gap-3">
              {footerData.social_links.github && (
                <a
                  href={footerData.social_links.github}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <Github className="h-5 w-5" />
                </a>
              )}
              {footerData.social_links.linkedin && (
                <a
                  href={footerData.social_links.linkedin}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <Linkedin className="h-5 w-5" />
                </a>
              )}
              {footerData.social_links.twitter && (
                <a
                  href={footerData.social_links.twitter}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <Twitter className="h-5 w-5" />
                </a>
              )}
              {footerData.social_links.email && (
                <a
                  href={`mailto:${footerData.social_links.email}`}
                  className="p-2 rounded-lg bg-secondary hover:bg-primary hover:text-primary-foreground transition-all duration-300"
                >
                  <Mail className="h-5 w-5" />
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Bottom */}
        <div className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            © {currentYear} {footerData.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
