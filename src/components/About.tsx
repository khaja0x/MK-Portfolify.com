import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";

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
        // Validate image URL
        let imageUrl = data.profile_image_url || "";

        // Check if URL is valid and accessible
        if (imageUrl && imageUrl.includes('supabase.co/storage')) {
          // URL looks like a Supabase storage URL, will attempt to load
          // If it fails, onError will handle it
        } else if (imageUrl) {
          // Not a Supabase URL, might be external
          console.warn("Profile image URL is not from Supabase storage:", imageUrl);
        }

        setAboutData({
          title: data.title || "",
          description: data.description || "",
          extra_text: data.extra_text || "",
          profile_image_url: imageUrl
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
    <section id="about" className="py-24 px-4 bg-gradient-subtle">
      <div className="container max-w-6xl mx-auto">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          {/* Image container */}
          <div className="relative group overflow-hidden">
            {/* Main image container */}
            <div className="aspect-square rounded-2xl bg-muted overflow-hidden shadow-lg transition-all duration-300 group-hover:shadow-xl">
              {isLoading ? (
                <div className="w-full h-full flex items-center justify-center bg-secondary animate-pulse">
                  <div className="text-muted-foreground">Loading...</div>
                </div>
              ) : aboutData.profile_image_url && !imageError ? (
                <img
                  src={aboutData.profile_image_url}
                  alt={aboutData.title || "Profile"}
                  className="w-full h-full object-cover"
                  onError={() => setImageError(true)}
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/10 to-accent/10">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="120"
                    height="120"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="text-primary/40"
                  >
                    <path d="M19 21 v-2 a 4 4 0 0 0 -4 -4 H9 a 4 4 0 0 0 -4 4 v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                </div>
              )}
            </div>

            {/* Animated shadow effect */}
            <div className="absolute inset-0 rounded-2xl bg-primary/30 -z-10 
                        group-hover:translate-x-2 group-hover:translate-y-2 
                        transition-transform duration-300 ease-out" />
          </div>

          {/* Content */}
          <div className="space-y-6">
            <div>
              <span className="text-primary font-semibold text-sm uppercase tracking-wider">About Me</span>
              <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
                {aboutData.title}
              </h2>
            </div>

            <div className="space-y-4 text-muted-foreground leading-relaxed">
              <p>{aboutData.description}</p>

              {aboutData.extra_text && (
                <p>{aboutData.extra_text}</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default About;