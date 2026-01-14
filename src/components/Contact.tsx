import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Github, Linkedin, MessageSquare, Send, Sparkles, User, HelpCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const Contact = ({ tenantId }: { tenantId?: string }) => {
  const { toast } = useToast();
  const [contactInfo, setContactInfo] = useState({
    email: "",
    phone: "",
    location: "",
    whatsapp: "",
    linkedin: "",
    github: ""
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchContactInfo();

    const channel = supabase
      .channel("contact-changes")
      .on("postgres_changes", { event: "*", schema: "public", table: "contact_info" }, () => {
        fetchContactInfo();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [tenantId]);

  const fetchContactInfo = async () => {
    let query = supabase.from("contact_info").select("*");

    if (tenantId) {
      query = query.eq("tenant_id", tenantId);
    }

    const { data } = await query.maybeSingle();
    if (data) {
      setContactInfo({
        ...contactInfo,
        ...data
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!tenantId) {
      toast({ title: "Error", description: "Tenant ID is missing. Cannot send message.", variant: "destructive" });
      return;
    }

    setLoading(true);
    const form = e.currentTarget as HTMLFormElement;
    const formData = new FormData(form);
    const data = {
      tenant_id: tenantId,
      name: formData.get("name") as string,
      email: formData.get("email") as string,
      subject: formData.get("subject") as string,
      message: formData.get("message") as string,
    };

    try {
      const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
      const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

      const response = await fetch(`${SUPABASE_URL}/functions/v1/contact-handler`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify(data)
      });

      if (!response.ok) {
        throw new Error("Failed to send message");
      }

      toast({ title: "Inquiry Received", description: "Your message has been safely delivered to my inbox." });
      form.reset();
    } catch (error: any) {
      toast({ title: "Delivery Failed", description: "Something went wrong on our end. Please try again soon.", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-32 px-6 bg-slate-950 relative overflow-hidden">
      {/* Background Decorative Patterns */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] h-[120%] bg-sky-500/5 blur-[150px] rounded-full" />
      </div>

      <div className="container max-w-7xl mx-auto relative z-10">
        <div className="grid lg:grid-cols-2 gap-20 items-start">

          {/* Left Side: Contact Information */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="space-y-12"
          >
            <div className="space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-slate-900 border border-slate-800 text-sky-400 text-xs font-black uppercase tracking-widest">
                <MessageSquare size={14} />
                Contact Me
              </div>
              <h2 className="text-5xl md:text-7xl font-black text-white leading-tight tracking-tighter">
                Let's Start a <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">Project</span>
              </h2>
              <p className="text-slate-400 text-xl font-medium max-w-md leading-relaxed">
                Whether you have a specific project in mind or just want to say hi, my inbox is always open.
              </p>
            </div>

            <div className="space-y-8">
              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-slate-500 group-hover:text-sky-500 group-hover:border-sky-500/20 transition-all">
                  <Mail size={24} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Email Me</div>
                  <a href={`mailto:${contactInfo.email}`} className="text-xl font-bold text-slate-200 hover:text-white transition-colors">
                    {contactInfo.email || "hello@example.com"}
                  </a>
                </div>
              </div>

              {contactInfo.phone && (
                <div className="flex items-center gap-6 group">
                  <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-slate-500 group-hover:text-amber-500 group-hover:border-amber-500/20 transition-all">
                    <Phone size={24} />
                  </div>
                  <div>
                    <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Call Me</div>
                    <a href={`tel:${contactInfo.phone}`} className="text-xl font-bold text-slate-200 hover:text-white transition-colors">
                      {contactInfo.phone}
                    </a>
                  </div>
                </div>
              )}

              <div className="flex items-center gap-6 group">
                <div className="w-14 h-14 bg-slate-900 rounded-2xl flex items-center justify-center border border-slate-800 text-slate-500 group-hover:text-emerald-500 group-hover:border-emerald-500/20 transition-all">
                  <MapPin size={24} />
                </div>
                <div>
                  <div className="text-xs font-black text-slate-500 uppercase tracking-widest mb-1">Location</div>
                  <div className="text-xl font-bold text-slate-200">
                    {contactInfo.location || "Remote / Global"}
                  </div>
                </div>
              </div>
            </div>

            {/* Micro FAQ Card */}
            <div className="p-8 rounded-[2.5rem] bg-slate-900/50 border border-slate-800/50 backdrop-blur-xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 p-6 text-slate-800/30 group-hover:text-sky-500/10 transition-colors">
                <HelpCircle size={80} />
              </div>
              <h4 className="text-white font-black text-lg mb-4 flex items-center gap-2">
                <Sparkles size={18} className="text-sky-500" />
                Quick Response Guaranteed
              </h4>
              <p className="text-slate-400 font-medium leading-relaxed">
                I typically reply to all inquiries within 24-48 business hours. Looking forward to connecting!
              </p>
            </div>
          </motion.div>

          {/* Right Side: Contact Form */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <div className="p-8 md:p-12 rounded-[3.5rem] bg-white dark:bg-slate-900 shadow-3xl border border-slate-100 dark:border-slate-800 relative z-10 transition-all hover:shadow-sky-500/5">
              <form onSubmit={handleSubmit} className="space-y-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                      <User size={16} /> Name
                    </Label>
                    <Input name="name" required placeholder="John Doe" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-sky-500" />
                  </div>
                  <div className="space-y-3">
                    <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1 flex items-center gap-2">
                      <Mail size={16} /> Email
                    </Label>
                    <Input name="email" type="email" required placeholder="john@example.com" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-sky-500" />
                  </div>
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Subject</Label>
                  <Input name="subject" required placeholder="What are we building?" className="h-14 rounded-2xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-sky-500" />
                </div>

                <div className="space-y-3">
                  <Label className="text-sm font-bold text-slate-700 dark:text-slate-300 ml-1">Message</Label>
                  <Textarea name="message" required rows={6} placeholder="Tell me more about your requirements..." className="rounded-3xl bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 focus:ring-sky-500 p-6" />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full h-16 rounded-[1.5rem] bg-sky-500 hover:bg-sky-600 text-white text-xl font-black shadow-xl shadow-sky-500/20 active:scale-95 transition-all"
                >
                  {loading ? (
                    <span className="flex items-center gap-3">
                      <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1 }}>
                        <Send size={24} />
                      </motion.span>
                      Transmitting...
                    </span>
                  ) : (
                    <span className="flex items-center gap-3">
                      <Send size={24} />
                      Launch Inquiry
                    </span>
                  )}
                </Button>
              </form>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;