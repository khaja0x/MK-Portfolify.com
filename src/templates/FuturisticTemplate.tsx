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

const FuturisticTemplate = ({ tenantId }: TemplateProps) => {
    return (
        <div className="min-h-screen bg-[#050510] text-[#00f3ff] selection:bg-[#00f3ff] selection:text-[#050510] font-mono">
            {/* HUD System Elements */}
            <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
                <div className="absolute inset-0 bg-grid-pattern opacity-[0.05]" />
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#00f3ff] to-transparent opacity-20" />
                <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-[#ff00ea] to-transparent opacity-20" />

                {/* Animated HUD Circles */}
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] border border-[#00f3ff]/5 rounded-full animate-[spin_60s_linear_infinite]" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] border border-[#ff00ea]/5 rounded-full animate-[spin_40s_linear_infinite_reverse]" />
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
        #hero, #about, #skills, #projects, #experience, #contact {
          background-color: transparent !important;
          color: #e0e0f0 !important;
        }
        h1, h2, h3 {
          color: #00f3ff !important;
          text-shadow: 0 0 10px rgba(0, 243, 255, 0.3);
          text-transform: uppercase;
          letter-spacing: 0.1em;
        }
        .bg-slate-950, .bg-slate-900, .bg-slate-900/20, .bg-slate-900/50 {
          background-color: rgba(0, 243, 255, 0.02) !important;
          border: 1px solid rgba(0, 243, 255, 0.1) !important;
          backdrop-filter: blur(20px);
        }
        .text-sky-500, .text-sky-400 {
          color: #00f3ff !important;
        }
        .bg-sky-500, .bg-sky-400 {
          background-color: #00f3ff !important;
          color: #050510 !important;
        }
        .border-slate-800, .border-slate-700 {
          border-color: rgba(0, 243, 255, 0.2) !important;
        }
        /* Custom Scrollbar for Sci-Fi vibe */
        ::-webkit-scrollbar {
          width: 4px;
        }
        ::-webkit-scrollbar-track {
          background: #050510;
        }
        ::-webkit-scrollbar-thumb {
          background: #00f3ff;
          box-shadow: 0 0 10px #00f3ff;
        }
      `}} />

            <Navigation tenantId={tenantId} />

            <main className="relative z-10 pt-20">
                <div className="container max-w-6xl mx-auto px-6">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 1 }}
                    >
                        <div className="border border-[#00f3ff]/20 bg-[#00f3ff]/5 p-2 rounded-t-lg mb-0 text-[10px] flex justify-between">
                            <span>SYSTEM_CORE_ENGAGED</span>
                            <span>VOLTAGE: OPTIMAL</span>
                        </div>
                        <div className="border-x border-b border-[#00f3ff]/20 p-8 rounded-b-3xl">
                            <Hero tenantId={tenantId} />
                        </div>
                    </motion.div>

                    <section className="py-32 grid lg:grid-cols-2 gap-12">
                        <div className="space-y-4">
                            <div className="inline-block px-3 py-1 bg-[#00f3ff]/10 border border-[#00f3ff]/30 text-[10px] text-[#00f3ff] rounded-md mb-4">DATA_STREAM_01</div>
                            <h2 className="text-4xl font-black mb-6">Biometric Profile</h2>
                            <div className="p-1 border border-[#00f3ff]/10 rounded-2xl">
                                <About tenantId={tenantId} />
                            </div>
                        </div>
                        <div className="space-y-4">
                            <div className="inline-block px-3 py-1 bg-[#ff00ea]/10 border border-[#ff00ea]/30 text-[10px] text-[#ff00ea] rounded-md mb-4">TECH_STACK_SCAN</div>
                            <h2 className="text-4xl font-black mb-6 text-[#ff00ea]! shadow-[#ff00ea]/30!">Combat Matrix</h2>
                            <div className="p-1 border border-[#ff00ea]/10 rounded-2xl">
                                <Skills tenantId={tenantId} />
                            </div>
                        </div>
                    </section>

                    <section className="py-32">
                        <div className="text-center mb-16">
                            <h2 className="text-5xl font-black inline-block relative">
                                Deployed Assets
                                <motion.div
                                    animate={{ width: ["0%", "100%", "0%"] }}
                                    transition={{ duration: 3, repeat: Infinity }}
                                    className="absolute -bottom-2 left-0 h-0.5 bg-[#00f3ff]"
                                />
                            </h2>
                        </div>
                        <Projects tenantId={tenantId} />
                    </section>

                    <section className="py-32">
                        <Experience tenantId={tenantId} />
                    </section>

                    <section className="py-32">
                        <div className="border-2 border-[#00f3ff]/40 rounded-[3rem] p-12 md:p-24 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-[#00f3ff]/10 blur-3xl group-hover:bg-[#00f3ff]/30 transition-all" />
                            <div className="text-center space-y-8">
                                <h2 className="text-4xl md:text-7xl font-black leading-tight">INITIATE_CHANNEL_PROTOCOLS</h2>
                                <p className="text-[#00f3ff]/60 max-w-xl mx-auto">Send encrypted transmission to establish communication link.</p>
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

export default FuturisticTemplate;
