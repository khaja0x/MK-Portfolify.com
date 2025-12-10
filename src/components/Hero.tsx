
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { ArrowRight, Github, Linkedin, Mail, Twitter, ChevronDown } from "lucide-react";

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
      <section id="hero" className="min-h-screen flex items-center justify-center px-4 py-20 pt-24 relative overflow-hidden bg-background">
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]" />
        <div className="container max-w-6xl mx-auto">
          <div className="text-center space-y-8 animate-pulse">
            <div className="h-6 bg-muted rounded w-32 mx-auto"></div>
            <div className="h-20 bg-muted rounded w-3/4 mx-auto"></div>
            <div className="h-8 bg-muted rounded w-2/3 mx-auto"></div>
            <div className="h-6 bg-muted rounded w-1/2 mx-auto"></div>
            <div className="flex gap-4 justify-center pt-8">
              <div className="h-12 w-12 bg-muted rounded-full"></div>
              <div className="h-12 w-12 bg-muted rounded-full"></div>
              <div className="h-12 w-12 bg-muted rounded-full"></div>
            </div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section id="hero" className="min-h-screen flex items-center justify-center px-4 py-20 pt-24 relative overflow-hidden bg-background">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-grid-pattern opacity-[0.3] pointer-events-none" />
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <div className="container max-w-5xl mx-auto relative z-10">
        <div className="text-center space-y-8 animate-fade-in">
          {/* Greeting */}
          <div className="inline-block animate-slide-up" style={{ animationDelay: "0.1s" }}>
            <span className="px-4 py-1.5 rounded-full bg-secondary/50 border border-border/50 text-sm font-medium text-primary backdrop-blur-sm">
              Hi there, I'm
            </span>
          </div>

          {/* Name */}
          <h1 className="text-6xl md:text-8xl lg:text-9xl font-bold tracking-tight animate-slide-up" style={{ animationDelay: "0.2s" }}>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-foreground via-foreground/80 to-foreground/50">
              {heroData.name}
            </span>
          </h1>

          {/* Tagline */}
          <p className="text-2xl md:text-3xl lg:text-4xl text-muted-foreground max-w-3xl mx-auto font-light leading-tight animate-slide-up" style={{ animationDelay: "0.3s" }}>
            {heroData.title}
          </p>

          {/* Description */}
          <p className="text-lg text-muted-foreground/80 max-w-2xl mx-auto leading-relaxed animate-slide-up" style={{ animationDelay: "0.4s" }}>
            {heroData.subtitle}
          </p>

          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center pt-8 animate-slide-up" style={{ animationDelay: "0.5s" }}>
            <Button
              size="lg"
              className="h-14 px-8 rounded-full text-lg bg-primary hover:bg-primary/90 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-1 group"
              onClick={() => document.getElementById(heroData.cta_link || 'projects')?.scrollIntoView({ behavior: 'smooth' })}
            >
              {heroData.cta_text}
              <ArrowRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-14 px-8 rounded-full text-lg border-2 hover:bg-secondary/50 transition-all duration-300 hover:-translate-y-1"
              onClick={() => document.getElementById('contact')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Get In Touch
            </Button>
            {heroData.resume_url && (
              <Button
                size="lg"
                variant="ghost"
                className="h-14 px-8 rounded-full text-lg hover:bg-secondary/50 transition-all duration-300"
                asChild
              >
                <a
                  href={heroData.resume_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  download
                >
                  Resume
                </a>
              </Button>
            )}
          </div>

          {/* Social Links */}
          <div className="flex gap-6 justify-center pt-12 animate-slide-up" style={{ animationDelay: "0.6s" }}>
            {heroData.social_links.github && (
              <a
                href={heroData.social_links.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110 duration-300"
              >
                <Github className="h-6 w-6" />
              </a>
            )}
            {heroData.social_links.linkedin && (
              <a
                href={heroData.social_links.linkedin}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-[#0077b5] transition-colors transform hover:scale-110 duration-300"
              >
                <Linkedin className="h-6 w-6" />
              </a>
            )}
            {heroData.social_links.twitter && (
              <a
                href={heroData.social_links.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110 duration-300"
              >
                <Twitter className="h-6 w-6" />
              </a>
            )}
            {heroData.social_links.email && (
              <a
                href={`mailto:${heroData.social_links.email}`}
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-foreground transition-colors transform hover:scale-110 duration-300"
              >
                <Mail className="h-6 w-6" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Scroll indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 animate-bounce cursor-pointer" onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
        <div className="flex flex-col items-center gap-2 text-muted-foreground/50 hover:text-muted-foreground transition-colors">
          <span className="text-xs font-medium uppercase tracking-widest">Scroll</span>
          <ChevronDown className="h-4 w-4" />
        </div>
      </div>
    </section>
  );
};

export default Hero;
