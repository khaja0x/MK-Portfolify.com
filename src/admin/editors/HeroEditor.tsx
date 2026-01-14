




import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Rocket, Loader2, Github, Linkedin, Twitter, Mail, Link as LinkIcon } from "lucide-react";

const HeroEditor = () => {
  const { toast } = useToast();

  const { tenant } = useOutletContext<{ tenant: { id: string; tenant_id: string } }>();

  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    title: "",
    subtitle: "",
    cta_text: "",
    cta_link: "",
    resume_url: "",
    social_links: { github: "", linkedin: "", twitter: "", email: "" },
  });

  useEffect(() => {
    if (tenant?.id) fetchHero();
  }, [tenant?.id]);

  const fetchHero = async () => {
    const { data } = await supabase
      .from("hero")
      .select("*")
      .eq("tenant_id", tenant.id)
      .maybeSingle();

    if (data) {
      setFormData({
        ...data,
        social_links: data.social_links || {
          github: "",
          linkedin: "",
          twitter: "",
          email: "",
        },
      });
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSocialChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      social_links: { ...formData.social_links, [e.target.name]: e.target.value },
    });
  };

  const handleSave = async () => {
    if (!tenant?.id) return;

    setLoading(true);

    const payload = {
      ...formData,
      tenant_id: tenant.id,
      updated_at: new Date(),
    };

    const { error } = await supabase
      .from("hero")
      .upsert(payload, { onConflict: "tenant_id" });

    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } else {
      toast({ title: "Success", description: "Hero updated successfully" });
      fetchHero();
    }

    setLoading(false);
  };


  const socialIcons = {
    github: <Github size={18} />,
    linkedin: <Linkedin size={18} />,
    twitter: <Twitter size={18} />,
    email: <Mail size={18} />,
  };

  return (
    <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-4 duration-500">
      <Card className="border-0 shadow-2xl bg-white rounded-[2rem] overflow-hidden">
        <CardContent className="p-8 md:p-12">
          <div className="flex items-center gap-4 mb-10">
            <div className="w-12 h-12 bg-sky-100 rounded-2xl flex items-center justify-center text-sky-600">
              <Rocket size={24} />
            </div>
            <h2 className="text-2xl font-bold text-slate-900">Edit Hero Section</h2>
          </div>

          <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 ml-1">Your Name</Label>
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Mohammed Khaja"
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 ml-1">Professional Title</Label>
                <Input
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g. Full-Stack Developer"
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 ml-1">Catchy Subtitle</Label>
              <Textarea
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="Briefly describe what you do..."
                className="min-h-[100px] bg-slate-50 border-slate-100 rounded-2xl p-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900 resize-none leading-relaxed"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 ml-1">CTA Button Text</Label>
                <Input
                  name="cta_text"
                  value={formData.cta_text}
                  onChange={handleChange}
                  placeholder="e.g. View My Work"
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl px-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                />
              </div>
              <div className="space-y-3">
                <Label className="text-sm font-bold text-slate-700 ml-1">CTA Button Link</Label>
                <div className="relative">
                  <LinkIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                  <Input
                    name="cta_link"
                    value={formData.cta_link}
                    onChange={handleChange}
                    placeholder="#projects"
                    className="h-14 bg-slate-50 border-slate-100 rounded-2xl pl-14 pr-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <Label className="text-sm font-bold text-slate-700 ml-1">Resume Link (Optional)</Label>
              <div className="relative">
                <LinkIcon size={18} className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400" />
                <Input
                  name="resume_url"
                  value={formData.resume_url}
                  onChange={handleChange}
                  placeholder="Paste your Google Drive or Dropbox link..."
                  className="h-14 bg-slate-50 border-slate-100 rounded-2xl pl-14 pr-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                />
              </div>
            </div>

            <div className="space-y-4">
              <Label className="text-sm font-bold text-slate-700 ml-1">Social Profiles</Label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {Object.keys(formData.social_links).map((key) => (
                  <div key={key} className="relative">
                    <div className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400">
                      {socialIcons[key as keyof typeof socialIcons]}
                    </div>
                    <Input
                      name={key}
                      placeholder={key.toUpperCase() + " URL"}
                      value={formData.social_links[key as keyof typeof formData.social_links]}
                      onChange={handleSocialChange}
                      className="h-14 bg-slate-50 border-slate-100 rounded-2xl pl-14 pr-6 focus:ring-sky-500 focus:border-sky-500 transition-all text-slate-900"
                    />
                  </div>
                ))}
              </div>
            </div>

            <Button
              onClick={handleSave}
              disabled={loading}
              className="w-full h-16 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl text-lg font-bold shadow-lg shadow-sky-500/20 transition-all active:scale-[0.98] mt-4"
            >
              {loading ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Updating Hero...
                </span>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>

        </CardContent>
      </Card>
    </div>
  );
};

export default HeroEditor;
