


import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Mail, MapPin, Phone, Github, Linkedin } from "lucide-react";
import { motion } from "framer-motion";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
};

const Contact = ({ tenantId }: { tenantId?: string }) => {
  const { toast } = useToast();
  const [contactInfo, setContactInfo] = useState({

    "email": "",
    "phone": "",
    "location": "",
    "whatsapp": "",
    "linkedin": "",
    "github": ""
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
      const { error } = await supabase.from("messages").insert([data]);

      if (error) throw error;

      toast({ title: "Success", description: "Message sent successfully!" });
      form.reset();
    } catch (error: any) {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="py-24 px-4 bg-gradient-subtle">
      <div className="container max-w-6xl mx-auto">

        {/* Header */}
        <motion.div
          initial="hidden"
          whileInView="show"
          variants={fadeUp}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-sm uppercase tracking-wider">
            Get In Touch
          </span>

          <h2 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
            Let's Work <span className="text-gradient">Together</span>
          </h2>

          <p className="text-muted-foreground max-w-2xl mx-auto">
            Have a project in mind? I'd love to hear about it. Send me a message and let's make something amazing.
          </p>
        </motion.div>

        {/* Grid */}
        <div className="grid md:grid-cols-2 gap-12">

          {/* Contact Info */}
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            className="space-y-8"
          >
            <h3 className="text-2xl font-bold">Contact Information</h3>

            <div className="space-y-6">
              {/* Email */}
              <div className="flex items-start gap-4 group">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Mail className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Email</p>
                  <a className="text-muted-foreground hover:text-primary" href={`mailto:${contactInfo.email}`}>
                    {contactInfo.email}
                  </a>
                </div>
              </div>

              {/* Phone */}
              <div className="flex items-start gap-4 group">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <Phone className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Phone</p>
                  <a className="text-muted-foreground hover:text-primary" href={`tel:${contactInfo.phone}`}>
                    {contactInfo.phone}
                  </a>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-start gap-4 group">
                <div className="p-3 rounded-xl bg-primary/10 group-hover:bg-primary/20 transition-colors">
                  <MapPin className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <p className="font-medium">Location</p>
                  <p className="text-muted-foreground">{contactInfo.location}</p>
                </div>
              </div>

              {/* Socials */}
              <div className="flex gap-4 pt-4">
                {contactInfo.github && (
                  <a href={contactInfo.github} target="_blank" rel="noreferrer" className="p-2 bg-secondary rounded-full hover:bg-primary hover:text-white transition-colors">
                    <Github className="h-5 w-5" />
                  </a>
                )}
                {contactInfo.linkedin && (
                  <a href={contactInfo.linkedin} target="_blank" rel="noreferrer" className="p-2 bg-secondary rounded-full hover:bg-primary hover:text-white transition-colors">
                    <Linkedin className="h-5 w-5" />
                  </a>
                )}
              </div>
            </div>

            {/* Why Work With Me */}
            <div className="p-6 rounded-2xl bg-card border border-border hover:shadow-lg transition-shadow">
              <h4 className="font-semibold mb-4">Why Work With Me?</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                  Fast turnaround and reliable delivery
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                  Clean, maintainable code
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                  Regular communication and updates
                </li>
                <li className="flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary mr-2" />
                  Post-launch support
                </li>
              </ul>
            </div>
          </motion.div>

          {/* Form */}
          <motion.form
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true }}
            onSubmit={handleSubmit}
            className="space-y-6"
          >
            <div className="space-y-4">
              <Input id="name" name="name" required placeholder="Your name" />
              <Input id="email" name="email" required type="email" placeholder="your.email@example.com" />
              <Input id="subject" name="subject" required placeholder="What's this about?" />
              <Textarea id="message" name="message" required rows={6} placeholder="Tell me about your project..." />
            </div>

            <Button type="submit" size="lg" disabled={loading} className="w-full bg-gradient-primary shadow-glow hover:scale-[1.03] transition-all">
              {loading ? "Sending..." : "Send Message"}
            </Button>
          </motion.form>
        </div>
      </div>
    </section>
  );
};

export default Contact;