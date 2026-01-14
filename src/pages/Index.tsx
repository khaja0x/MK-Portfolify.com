import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import {
  Zap,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Globe,
  Layout,
  ShieldCheck,
  Code2,
  Rocket,
  MousePointerClick,
  Monitor,
  Cpu,
  User,
  Palette
} from "lucide-react";
import { motion } from "framer-motion";

const Index = () => {
  const year = new Date().getFullYear();

  const fadeIn = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6 }
  };

  const features = [
    {
      icon: <Sparkles className="w-6 h-6 text-sky-500" />,
      title: "AI-Powered Generation",
      desc: "Instantly create a professional structure based on your profile details."
    },
    {
      icon: <Layout className="w-6 h-6 text-purple-500" />,
      title: "Premium Templates",
      desc: "Switch between modern, high-converting designs with a single click."
    },
    {
      icon: <Globe className="w-6 h-6 text-emerald-500" />,
      title: "Personal Workspace",
      desc: "Manage your portfolio under your own unique brand name and link."
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-amber-500" />,
      title: "Secure Dashboard",
      desc: "Real-time inbox and analytics to keep track of every visitor interaction."
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 selection:bg-sky-500/30 font-sans selection:text-sky-200 overflow-x-hidden">

      {/* Background Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-sky-500/10 rounded-full blur-[120px] animate-pulse" />
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] animate-pulse delay-700" />
      </div>

      {/* Navbar */}
      <nav className="sticky top-0 z-50 border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-sky-500 text-white rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 group-hover:rotate-6 transition-transform">
              <Zap className="w-6 h-6 fill-current" />
            </div>
            <span className="font-black text-2xl tracking-tight text-white">Portfolify</span>
          </Link>

          <div className="hidden md:flex items-center gap-8 font-bold text-sm text-slate-400">
            <a href="#features" className="hover:text-white transition-colors">Features</a>
            <a href="#demo" className="hover:text-white transition-colors">How it works</a>
            <Link to="/login" className="hover:text-white transition-colors">Sign In</Link>
          </div>

          <div className="flex items-center gap-4">
            <Link to="/register">
              <Button className="bg-sky-500 hover:bg-sky-600 text-white rounded-full px-8 h-12 font-black shadow-lg shadow-sky-500/20 transition-all active:scale-95">
                Launch My Site
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 px-6">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 bg-slate-900/50 border border-slate-800 px-4 py-2 rounded-full mb-8"
          >
            <span className="flex h-2 w-2 rounded-full bg-sky-500 animate-pulse" />
            <span className="text-xs font-bold uppercase tracking-widest text-slate-400">Trusted by 2,000+ creators</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="text-6xl md:text-8xl font-black leading-[1.1] text-white tracking-tighter mb-8"
          >
            Your story deserves a <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-indigo-400 to-purple-400">
              stunning home.
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-xl md:text-2xl text-slate-400 max-w-3xl mx-auto leading-relaxed mb-12"
          >
            Stop wrestling with complex builders. Import your details and launch a professional, high-performance portfolio in under 5 minutes.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Link to="/register">
              <Button size="lg" className="h-16 px-10 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white text-xl font-black shadow-2xl shadow-sky-500/40 group transition-all hover:-translate-y-1">
                Start Building Now
                <ArrowRight className="ml-3 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/login">
              <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-slate-800 bg-slate-900/50 text-white text-xl font-bold hover:bg-slate-800 transition-all hover:-translate-y-1">
                View Live Demo
              </Button>
            </Link>
          </motion.div>

          {/* Visualization of the product */}
          <motion.div
            initial={{ opacity: 0, y: 100 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2, delay: 0.8 }}
            className="mt-24 relative"
          >
            <div className="relative mx-auto max-w-5xl rounded-[2.5rem] border border-slate-800 bg-slate-900/50 p-4 shadow-3xl overflow-hidden group">
              <div className="bg-slate-950 rounded-[1.5rem] overflow-hidden aspect-[16/10] border border-slate-800 relative shadow-inner">
                {/* Simulated UI */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-full h-full bg-gradient-to-br from-slate-900 to-slate-950 p-12 flex flex-col items-center">
                    <div className="w-24 h-24 rounded-full bg-slate-800 mb-6 flex items-center justify-center">
                      <Monitor size={48} className="text-sky-500" />
                    </div>
                    <div className="h-8 w-64 bg-slate-800 rounded-full mb-4 animate-pulse" />
                    <div className="h-4 w-96 bg-slate-800/50 rounded-full mb-12" />
                    <div className="grid grid-cols-3 gap-6 w-full">
                      <div className="aspect-video bg-slate-800/30 rounded-2xl" />
                      <div className="aspect-video bg-slate-800/30 rounded-2xl" />
                      <div className="aspect-video bg-slate-800/30 rounded-2xl" />
                    </div>
                  </div>
                </div>
                {/* Floating Editor Element */}
                <div className="absolute top-20 right-20 w-64 bg-white rounded-2xl shadow-3xl p-6 border border-slate-100 animate-float">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 bg-sky-100 rounded-lg flex items-center justify-center text-sky-600">
                      <Sparkles size={16} />
                    </div>
                    <span className="text-sm font-black text-slate-900">Live Editor</span>
                  </div>
                  <div className="space-y-3">
                    <div className="h-2 w-full bg-slate-100 rounded-full" />
                    <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                    <div className="h-8 w-full bg-sky-500 rounded-lg mt-4 shadow-lg shadow-sky-500/20" />
                  </div>
                </div>
              </div>
            </div>

            {/* Background Light Burst */}
            <div className="absolute -z-10 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[150%] h-[150%] bg-sky-500/20 blur-[150px] pointer-events-none rounded-full" />
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6 relative bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-5xl font-black text-white mb-6">Built for Professionals</h2>
            <p className="text-slate-400 text-lg max-w-2xl mx-auto">
              Portfolify provides everything you need to showcase your work and manage inquiries.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((f, i) => (
              <motion.div
                key={i}
                whileHover={{ y: -8 }}
                className="bg-slate-900/50 border border-slate-800/50 p-8 rounded-[2rem] hover:bg-slate-900 transition-colors"
              >
                <div className="w-14 h-14 bg-slate-950 rounded-2xl flex items-center justify-center mb-6 border border-slate-800 shadow-xl">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{f.title}</h3>
                <p className="text-slate-400 leading-relaxed font-medium">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="demo" className="py-32 px-6 bg-slate-950 relative overflow-hidden">
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="text-center mb-24">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-black uppercase tracking-[0.2em] mb-6"
            >
              <MousePointerClick size={14} />
              The Process
            </motion.div>
            <h2 className="text-5xl md:text-7xl font-black text-white tracking-tighter mb-6">
              Three steps to <span className="italic font-serif text-sky-400">greatness.</span>
            </h2>
          </div>

          <div className="grid lg:grid-cols-3 gap-12 relative">
            {/* Connection Line (Desktop) */}
            <div className="absolute top-1/2 left-0 w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent hidden lg:block -translate-y-12" />

            {[
              {
                step: "01",
                title: "Initialize Profile",
                desc: "Connect your identity and input your professional credentials through our intuitive dashboard.",
                icon: <User className="w-8 h-8" />,
                color: "from-sky-500 to-blue-600"
              },
              {
                step: "02",
                title: "Select Template",
                desc: "Pick from our gallery of premium designs. Modern, Minimal, Creative, or Futuristic — the choice is yours.",
                icon: <Palette className="w-8 h-8" />,
                color: "from-purple-500 to-indigo-600"
              },
              {
                step: "03",
                title: "Go Live",
                desc: "Review your generated site and hit publish. Your portfolio is now globally accessible and blazing fast.",
                icon: <Rocket className="w-8 h-8" />,
                color: "from-emerald-500 to-teal-600"
              }
            ].map((s, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: i * 0.2 }}
                className="relative group"
              >
                <div className="bg-slate-900/40 backdrop-blur-xl border border-slate-800/50 p-10 rounded-[3rem] h-full hover:border-slate-700 transition-all duration-500">
                  <div className={`w-20 h-20 rounded-3xl bg-gradient-to-br ${s.color} flex items-center justify-center text-white mb-8 shadow-2xl group-hover:scale-110 group-hover:rotate-6 transition-transform duration-500`}>
                    {s.icon}
                  </div>
                  <div className="text-5xl font-black text-slate-800/50 mb-4 tracking-tighter uppercase">{s.step}</div>
                  <h3 className="text-3xl font-black text-white mb-4">{s.title}</h3>
                  <p className="text-slate-400 text-lg font-medium leading-relaxed">{s.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* Decor */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-sky-500/5 blur-[120px] pointer-events-none rounded-full" />
      </section>

      {/* Trust Quote / Stats */}
      <section className="py-24 px-6 border-y border-slate-800 shadow-inner bg-slate-900/20">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12">
          <div className="space-y-2">
            <div className="text-5xl font-black text-white">99%</div>
            <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Deployment Success</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-black text-sky-400">5min</div>
            <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Average Setup Time</div>
          </div>
          <div className="space-y-2">
            <div className="text-5xl font-black text-purple-400">2.5k</div>
            <div className="text-slate-400 font-bold uppercase tracking-widest text-sm">Happy Developers</div>
          </div>
          <div className="max-w-sm">
            <p className="text-white italic text-lg font-medium leading-relaxed">
              "Portfolify changed how I manage my professional presence. I went from zero to live in minutes with a design that looks like I paid thousands for."
            </p>
            <p className="text-sky-400 font-bold mt-4">— Sarah Jenkins, Senior Eng</p>
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-32 px-6">
        <div className="relative max-w-5xl mx-auto rounded-[3rem] bg-gradient-to-br from-sky-500 to-indigo-600 p-12 md:p-24 text-center overflow-hidden shadow-2xl shadow-sky-500/20">
          <div className="absolute top-0 right-0 p-12 text-white/10">
            <Rocket size={180} />
          </div>

          <div className="relative z-10">
            <h2 className="text-4xl md:text-6xl font-black text-white mb-8 tracking-tighter">
              Ready to own your corner <br /> of the internet?
            </h2>
            <div className="flex flex-col sm:flex-row justify-center gap-6">
              <Link to="/register">
                <Button size="lg" className="h-16 px-12 rounded-2xl bg-white text-sky-600 hover:bg-slate-50 text-xl font-black shadow-xl transition-all hover:scale-105 active:scale-95">
                  Get Started for Free
                </Button>
              </Link>
              <div className="flex items-center justify-center gap-2 text-white/80 font-bold text-sm">
                <CheckCircle2 size={18} />
                No credit card required
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-16 px-6 border-t border-slate-900 bg-slate-950">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8 mb-12">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-8 h-8 bg-sky-500 text-white rounded-lg flex items-center justify-center">
                <Zap size={18} fill="currentColor" />
              </div>
              <span className="font-black text-xl tracking-tight text-white">Portfolify</span>
            </Link>

            <div className="flex gap-8 text-sm font-bold text-slate-500 uppercase tracking-widest">
              <a href="#" className="hover:text-white transition-colors">Privacy</a>
              <a href="#" className="hover:text-white transition-colors">Terms</a>
              <a href="#" className="hover:text-white transition-colors">Twitter</a>
              <a href="#" className="hover:text-white transition-colors">Contact</a>
            </div>
          </div>

          <div className="text-center md:text-left pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between gap-4">
            <p className="text-slate-500 font-medium">
              &copy; {year} Portfolify. Built by creators, for creators.
            </p>
            <div className="flex items-center gap-2 text-slate-500 font-bold group cursor-help">
              <ShieldCheck size={16} className="text-emerald-500" />
              Secure Data Protocol 2.0 Active
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
