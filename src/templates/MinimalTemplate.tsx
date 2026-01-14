import Navigation from "@/components/Navigation";
import Hero from "@/components/Hero";
import About from "@/components/About";
import Skills from "@/components/Skills";
import Projects from "@/components/Projects";
import Experience from "@/components/Experience";
import Contact from "@/components/Contact";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";

interface TemplateProps {
    tenantId: string;
}

const MinimalTemplate = ({ tenantId }: TemplateProps) => {
    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 selection:bg-sky-100 selection:text-sky-900">
            {/* Custom Styles for Minimal Override */}
            <style dangerouslySetInnerHTML={{
                __html: `
        #hero, #about, #skills, #projects, #experience, #contact {
          background-color: transparent !important;
          color: inherit !important;
        }
        #hero h1, #hero h2, #about h2, #skills h2, #projects h2, #experience h2, #contact h2 {
          color: #0f172a !important;
        }
        #hero p, #about p, #skills p, #projects p, #experience p, #contact p {
          color: #475569 !important;
        }
        .bg-slate-950, .bg-slate-900, .bg-slate-900/20, .bg-slate-900/50 {
          background-color: transparent !important;
        }
        .border-slate-800, .border-slate-700 {
          border-color: #e2e8f0 !important;
        }
        .text-white {
          color: #0f172a !important;
        }
        .text-slate-400 {
          color: #64748b !important;
        }
        /* Navigation Override */
        nav .bg-slate-950\/80 {
          background-color: rgba(255, 255, 255, 0.8) !important;
          border-color: rgba(226, 232, 240, 0.8) !important;
        }
        nav .text-white {
          color: #0f172a !important;
        }
      `}} />

            <Navigation tenantId={tenantId} />

            <main className="relative">
                <div className="max-w-6xl mx-auto px-6 py-20 divide-y divide-slate-200/60">
                    <motion.div
                        initial={{ opacity: 0 }}
                        whileInView={{ opacity: 1 }}
                        transition={{ duration: 1 }}
                        className="pb-32"
                    >
                        <Hero tenantId={tenantId} />
                    </motion.div>

                    <section className="py-32">
                        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
                            <div className="lg:col-span-4">
                                <div className="sticky top-32">
                                    <span className="text-sky-500 font-black text-xs uppercase tracking-widest block mb-4">01. Identity</span>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Personal Narrative</h2>
                                </div>
                            </div>
                            <div className="lg:col-span-8">
                                <About tenantId={tenantId} />
                            </div>
                        </div>
                    </section>

                    <section className="py-32">
                        <div className="grid lg:grid-cols-12 gap-12 lg:gap-24">
                            <div className="lg:col-span-4">
                                <div className="sticky top-32">
                                    <span className="text-indigo-500 font-black text-xs uppercase tracking-widest block mb-4">02. Capabilities</span>
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tight">Technical Proficiency</h2>
                                </div>
                            </div>
                            <div className="lg:col-span-8">
                                <Skills tenantId={tenantId} />
                            </div>
                        </div>
                    </section>

                    <section className="py-32">
                        <div className="space-y-12">
                            <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-20">
                                <span className="text-purple-500 font-black text-xs uppercase tracking-widest block mb-4">03. Showcase</span>
                                <h2 className="text-5xl font-black text-slate-900 tracking-tight mb-6">Selected Projects</h2>
                                <div className="h-1.5 w-20 bg-slate-900 rounded-full" />
                            </div>
                            <Projects tenantId={tenantId} />
                        </div>
                    </section>

                    <section className="py-32">
                        <Experience tenantId={tenantId} />
                    </section>

                    <section className="py-40">
                        <div className="bg-slate-900 rounded-[3rem] p-12 md:p-24 relative overflow-hidden text-center group">
                            <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-transparent opacity-50" />
                            <div className="relative z-10 space-y-8">
                                <h2 className="text-4xl md:text-6xl font-black text-white tracking-tight">Let's create something extraordinary together.</h2>
                                <p className="text-slate-400 text-xl font-medium max-w-2xl mx-auto">Currently open to new opportunities and interesting projects.</p>
                                <Contact tenantId={tenantId} />
                            </div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer tenantId={tenantId} />
        </div>
    );
};

export default MinimalTemplate;

