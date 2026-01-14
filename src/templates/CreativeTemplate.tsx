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

const CreativeTemplate = ({ tenantId }: TemplateProps) => {
    return (
        <div className="min-h-screen bg-indigo-950 text-slate-100 selection:bg-rose-500 selection:text-white overflow-hidden">
            {/* Dynamic Background Shapes */}
            <div className="fixed inset-0 pointer-events-none z-0">
                <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-rose-500/10 rounded-full blur-[120px] animate-pulse" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse delay-1000" />
            </div>

            {/* Global Style Overrides for Creative Template */}
            <style dangerouslySetInnerHTML={{
                __html: `
        #hero, #about, #skills, #projects, #experience, #contact {
          background-color: transparent !important;
        }
        .bg-slate-950, .bg-slate-900, .bg-slate-900/20, .bg-slate-900/50 {
          background-color: rgba(255, 255, 255, 0.03) !important;
          backdrop-filter: blur(10px);
        }
        .border-slate-800, .border-slate-700 {
          border-color: rgba(255, 255, 255, 0.1) !important;
        }
        h2 {
          font-family: serif;
          font-style: italic;
          letter-spacing: -0.05em !important;
        }
      `}} />

            <Navigation tenantId={tenantId} />

            <main className="relative z-10">
                <div className="container max-w-7xl mx-auto px-6">
                    {/* Creative Staggered Layout */}
                    <div className="py-20">
                        <Hero tenantId={tenantId} />
                    </div>

                    <div className="grid lg:grid-cols-2 gap-20 items-center py-32">
                        <motion.div
                            initial={{ opacity: 0, x: -50 }}
                            whileInView={{ opacity: 1, x: 0 }}
                            className="order-2 lg:order-1"
                        >
                            <About tenantId={tenantId} />
                        </motion.div>
                        <div className="order-1 lg:order-2 space-y-6">
                            <span className="text-rose-500 font-bold tracking-widest uppercase text-sm px-4 py-1 bg-rose-500/10 rounded-full">Background</span>
                            <h2 className="text-6xl md:text-8xl font-black text-white leading-none">The Story Behind the <span className="text-rose-500">Code</span></h2>
                        </div>
                    </div>

                    <section className="py-32">
                        <div className="mb-20 text-right">
                            <h2 className="text-6xl md:text-9xl font-black text-slate-800/30 uppercase tracking-tighter">Capabilities</h2>
                            <div className="mt-[-4rem]">
                                <Skills tenantId={tenantId} />
                            </div>
                        </div>
                    </section>

                    <section className="py-32 relative">
                        <div className="absolute left-0 top-0 w-1 h-full bg-gradient-to-b from-rose-500 via-indigo-500 to-transparent opacity-20 hidden lg:block" />
                        <div className="pl-0 lg:pl-16">
                            <Projects tenantId={tenantId} />
                        </div>
                    </section>

                    <section className="py-32">
                        <Experience tenantId={tenantId} />
                    </section>

                    <section className="py-32">
                        <div className="bg-gradient-to-br from-rose-500 to-indigo-600 rounded-[4rem] p-12 md:p-32 text-center shadow-2xl overflow-hidden relative group">
                            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10" />
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                whileInView={{ scale: 1, opacity: 1 }}
                                className="relative z-10"
                            >
                                <h2 className="text-5xl md:text-8xl font-black text-white mb-8 tracking-tighter">Let's build the <br /> future.</h2>
                                <Contact tenantId={tenantId} />
                            </motion.div>
                        </div>
                    </section>
                </div>
            </main>

            <Footer tenantId={tenantId} />
        </div>
    );
};

export default CreativeTemplate;
