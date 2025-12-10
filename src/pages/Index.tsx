
// import { Link } from "react-router-dom";
// import { Button } from "@/components/ui/button";
// import { Card, CardContent } from "@/components/ui/card";
// import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
// import {
//   Star,
//   MessageCircle,
//   Zap,
//   Layout,
//   Globe,
//   ShieldCheck,
//   Menu,
//   ArrowRight,
//   CheckCircle2,
//   Sparkles,
//   Linkedin,
//   Code2,
//   Palette
// } from "lucide-react";
// import { useState } from "react";

// const Index = () => {
//   const [isMenuOpen, setIsMenuOpen] = useState(false);

//   return (
//     <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden">
//       {/* Background Gradients */}
//       <div className="fixed inset-0 z-0 pointer-events-none">
//         <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
//         <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
//         <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] z-[-1]" />
//       </div>

//       {/* Navigation */}
//       <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
//         <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
//           <div className="flex items-center justify-between h-16">
//             {/* Logo */}
//             <Link to="/" className="flex items-center gap-2 font-bold text-xl group">
//               <div className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
//                 <Zap className="w-5 h-5 fill-current" />
//               </div>
//               <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
//                 Portfolify
//               </span>
//             </Link>

//             {/* Desktop Navigation */}
//             <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
//               <Link to="#" className="hover:text-primary transition-colors">Features</Link>
//               <Link to="#" className="hover:text-primary transition-colors">Templates</Link>
//               <Link to="#" className="hover:text-primary transition-colors">Pricing</Link>
//             </div>

//             {/* Desktop Actions */}
//             <div className="hidden md:flex items-center gap-4">
//               <Link to="/login">
//                 <Button variant="ghost" className="font-medium hover:bg-primary/5">Login</Button>
//               </Link>
//               <Link to="/register">
//                 <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5">
//                   Get Started
//                 </Button>
//               </Link>
//             </div>

//             {/* Mobile Menu */}
//             <div className="md:hidden">
//               <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
//                 <SheetTrigger asChild>
//                   <Button variant="ghost" size="icon">
//                     <Menu className="w-6 h-6" />
//                   </Button>
//                 </SheetTrigger>
//                 <SheetContent side="right" className="w-[300px] sm:w-[400px]">
//                   <div className="flex flex-col gap-8 mt-8">
//                     <div className="flex flex-col gap-4">
//                       <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Features</Link>
//                       <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Templates</Link>
//                       <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
//                     </div>
//                     <div className="flex flex-col gap-4">
//                       <Link to="/login" onClick={() => setIsMenuOpen(false)}>
//                         <Button variant="outline" className="w-full justify-center">Login</Button>
//                       </Link>
//                       <Link to="/register" onClick={() => setIsMenuOpen(false)}>
//                         <Button className="w-full justify-center">Create Website</Button>
//                       </Link>
//                     </div>
//                   </div>
//                 </SheetContent>
//               </Sheet>
//             </div>
//           </div>
//         </div>
//       </nav>

//       {/* Hero Section */}
//       <main className="flex-1 relative z-10">
//         <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
//           <div className="max-w-7xl mx-auto flex flex-col items-center text-center">

//             {/* Social Proof Badge */}
//             <div className="inline-flex items-center gap-2 bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-full pl-2 pr-4 py-1.5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:bg-secondary/80 transition-colors cursor-default">
//               <div className="flex -space-x-2">
//                 {[1, 2, 3].map((i) => (
//                   <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted overflow-hidden">
//                     <img
//                       src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
//                       alt="User"
//                       className="w-full h-full object-cover"
//                     />
//                   </div>
//                 ))}
//               </div>
//               <span className="text-sm font-medium text-muted-foreground">
//                 Join <span className="text-primary font-bold">5,000+</span> professionals
//               </span>
//             </div>

//             {/* Headline */}
//             <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-8 leading-[1.1] max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
//               Turn your LinkedIn into a <br className="hidden md:block" />
//               <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent animate-gradient-x">
//                 stunning website
//               </span>
//             </h1>

//             {/* Subheadline */}
//             <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
//               Stop wasting hours on design. Import your LinkedIn profile and get a professional, SEO-optimized personal website in seconds.
//             </p>

//             {/* CTA Buttons */}
//             <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
//               <Link to="/register">
//                 <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
//                   Create my page <ArrowRight className="ml-2 w-5 h-5" />
//                 </Button>
//               </Link>
//               <Link to="#">
//                 <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg hover:bg-secondary/80 bg-background/50 backdrop-blur-sm">
//                   View Demo
//                 </Button>
//               </Link>
//             </div>

//             {/* Rating */}
//             <div className="flex items-center gap-2 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
//               <div className="flex gap-0.5">
//                 {[1, 2, 3, 4, 5].map((i) => (
//                   <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
//                 ))}
//               </div>
//               <p className="text-sm text-muted-foreground">
//                 <span className="font-semibold text-foreground">4.9/5</span> from 200+ reviews
//               </p>
//             </div>

//             {/* Hero Visual/Preview */}
//             <div className="mt-24 w-full max-w-5xl mx-auto relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">

//               {/* Floating Elements */}
//               <div className="absolute -top-12 -left-12 md:-left-24 animate-float delay-0 hidden md:block z-20">
//                 <Card className="p-4 shadow-lg border-primary/10 bg-white/90 backdrop-blur-md">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-[#0077b5]/10 flex items-center justify-center text-[#0077b5]">
//                       <Linkedin className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-bold">Import from LinkedIn</p>
//                       <p className="text-xs text-muted-foreground">One-click sync</p>
//                     </div>
//                   </div>
//                 </Card>
//               </div>

//               <div className="absolute -top-8 -right-12 md:-right-24 animate-float delay-1000 hidden md:block z-20">
//                 <Card className="p-4 shadow-lg border-primary/10 bg-white/90 backdrop-blur-md">
//                   <div className="flex items-center gap-3">
//                     <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
//                       <Sparkles className="w-6 h-6" />
//                     </div>
//                     <div>
//                       <p className="text-sm font-bold">AI Generated</p>
//                       <p className="text-xs text-muted-foreground">Ready in 30s</p>
//                     </div>
//                   </div>
//                 </Card>
//               </div>

//               {/* Main Browser Window */}
//               <div className="relative rounded-xl border bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/20">
//                 {/* Browser Toolbar */}
//                 <div className="h-12 bg-muted/50 border-b flex items-center px-4 gap-2">
//                   <div className="flex gap-2">
//                     <div className="w-3 h-3 rounded-full bg-red-400" />
//                     <div className="w-3 h-3 rounded-full bg-yellow-400" />
//                     <div className="w-3 h-3 rounded-full bg-green-400" />
//                   </div>
//                   <div className="flex-1 flex justify-center">
//                     <div className="h-8 w-64 bg-background/50 rounded-md flex items-center justify-center text-xs text-muted-foreground font-mono">
//                       portfolify.com/johndoe
//                     </div>
//                   </div>
//                 </div>

//                 {/* Browser Content */}
//                 <div className="bg-background aspect-[16/9] relative group overflow-hidden">
//                   <div className="absolute inset-0 bg-dot-pattern opacity-[0.5]" />

//                   {/* Mock Website Content */}
//                   <div className="p-8 md:p-12 flex flex-col items-center h-full justify-center relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
//                     <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mb-6 shadow-xl ring-4 ring-background" />
//                     <div className="h-8 w-64 bg-foreground/10 rounded-lg mb-4" />
//                     <div className="h-4 w-96 bg-foreground/5 rounded-lg mb-2" />
//                     <div className="h-4 w-80 bg-foreground/5 rounded-lg mb-8" />

//                     <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
//                       <div className="aspect-video bg-foreground/5 rounded-lg border border-foreground/5" />
//                       <div className="aspect-video bg-foreground/5 rounded-lg border border-foreground/5" />
//                       <div className="aspect-video bg-foreground/5 rounded-lg border border-foreground/5" />
//                     </div>
//                   </div>

//                   {/* Overlay for "Templates" */}
//                   <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
//                     <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8">
//                       Preview Template
//                     </Button>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>

//         {/* Features Grid */}
//         <section className="py-24 px-4 bg-secondary/30 relative overflow-hidden">
//           <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]" />
//           <div className="max-w-7xl mx-auto relative z-10">
//             <div className="text-center mb-16">
//               <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Creators Love Portfolify</h2>
//               <p className="text-muted-foreground max-w-2xl mx-auto">
//                 We've packed Portfolify with powerful features to help you stand out from the crowd.
//               </p>
//             </div>

//             <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
//               {[
//                 {
//                   icon: <Palette className="w-6 h-6" />,
//                   title: "Designer Templates",
//                   desc: "Access a library of premium, responsive templates that look great on any device.",
//                   color: "bg-blue-500/10 text-blue-600"
//                 },
//                 {
//                   icon: <Code2 className="w-6 h-6" />,
//                   title: "No Coding Required",
//                   desc: "Our visual editor lets you customize everything without writing a single line of code.",
//                   color: "bg-purple-500/10 text-purple-600"
//                 },
//                 {
//                   icon: <Globe className="w-6 h-6" />,
//                   title: "Custom Domain",
//                   desc: "Connect your own domain name or use our free subdomain to get started instantly.",
//                   color: "bg-green-500/10 text-green-600"
//                 }
//               ].map((feature, idx) => (
//                 <Card key={idx} className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-background/50 backdrop-blur-sm">
//                   <CardContent className="p-8">
//                     <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
//                       {feature.icon}
//                     </div>
//                     <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
//                     <p className="text-muted-foreground leading-relaxed">
//                       {feature.desc}
//                     </p>
//                   </CardContent>
//                 </Card>
//               ))}
//             </div>
//           </div>
//         </section>
//       </main>

//       {/* Footer */}
//       <footer className="py-12 px-4 border-t bg-background relative z-10">
//         <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
//           <div className="flex items-center gap-2 font-bold text-xl">
//             <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
//               <Zap className="w-4 h-4 fill-current" />
//             </div>
//             <span>Portfolify</span>
//           </div>
//           <p className="text-sm text-muted-foreground">
//             © Portfolify. All rights reserved.
//           </p>
//           <div className="flex gap-6 text-sm text-muted-foreground">
//             <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
//             <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
//             <Link to="#" className="hover:text-foreground transition-colors">Twitter</Link>
//           </div>
//         </div>
//       </footer>

//       {/* Chat Widget */}
//       <div className="fixed bottom-6 right-6 z-50">
//         <Button size="icon" className="h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all hover:scale-105">
//           <MessageCircle className="h-6 w-6" />
//         </Button>
//       </div>
//     </div>
//   );
// };

// export default Index;



/////////1



import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import {
  Star,
  MessageCircle,
  Zap,
  Layout,
  Globe,
  ShieldCheck,
  Menu,
  ArrowRight,
  CheckCircle2,
  Sparkles,
  Linkedin,
  Code2,
  Palette
} from "lucide-react";
import { useState } from "react";

const Index = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const currentYear = new Date().getFullYear(); // Get current year dynamically

  return (
    <div className="min-h-screen bg-background flex flex-col font-sans overflow-x-hidden">
      {/* Background Gradients */}
      <div className="fixed inset-0 z-0 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-primary/5 rounded-full blur-[100px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-accent/5 rounded-full blur-[100px]" />
        <div className="absolute inset-0 bg-grid-pattern opacity-[0.4] z-[-1]" />
      </div>

      {/* Navigation */}
      <nav className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-2 font-bold text-xl group">
              <div className="w-9 h-9 bg-primary text-primary-foreground rounded-xl flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform duration-300">
                <Zap className="w-5 h-5 fill-current" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-foreground to-foreground/70">
                Portfolify
              </span>
            </Link>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8 text-sm font-medium text-muted-foreground">
              <Link to="#" className="hover:text-primary transition-colors">Features</Link>
              <Link to="#" className="hover:text-primary transition-colors">Templates</Link>
              <Link to="#" className="hover:text-primary transition-colors">Pricing</Link>
            </div>

            {/* Desktop Actions */}
            <div className="hidden md:flex items-center gap-4">
              <Link to="/login">
                <Button variant="ghost" className="font-medium hover:bg-primary/5">Login</Button>
              </Link>
              <Link to="/register">
                <Button className="rounded-full px-6 shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all duration-300 hover:-translate-y-0.5">
                  Get Started
                </Button>
              </Link>
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <Sheet open={isMenuOpen} onOpenChange={setIsMenuOpen}>
                <SheetTrigger asChild>
                  <Button variant="ghost" size="icon">
                    <Menu className="w-6 h-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px]">
                  <div className="flex flex-col gap-8 mt-8">
                    <div className="flex flex-col gap-4">
                      <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Features</Link>
                      <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Templates</Link>
                      <Link to="#" className="text-lg font-medium hover:text-primary" onClick={() => setIsMenuOpen(false)}>Pricing</Link>
                    </div>
                    <div className="flex flex-col gap-4">
                      <Link to="/login" onClick={() => setIsMenuOpen(false)}>
                        <Button variant="outline" className="w-full justify-center">Login</Button>
                      </Link>
                      <Link to="/register" onClick={() => setIsMenuOpen(false)}>
                        <Button className="w-full justify-center">Create Website</Button>
                      </Link>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <main className="flex-1 relative z-10">
        <section className="pt-20 pb-16 md:pt-32 md:pb-24 px-4 overflow-hidden">
          <div className="max-w-7xl mx-auto flex flex-col items-center text-center">

            {/* Social Proof Badge */}
            <div className="inline-flex items-center gap-2 bg-secondary/50 backdrop-blur-sm border border-border/50 rounded-full pl-2 pr-4 py-1.5 mb-8 animate-in fade-in slide-in-from-bottom-4 duration-700 hover:bg-secondary/80 transition-colors cursor-default">
              <div className="flex -space-x-2">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="w-6 h-6 rounded-full border-2 border-background bg-muted overflow-hidden">
                    <img
                      src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${i}`}
                      alt="User"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ))}
              </div>
              <span className="text-sm font-medium text-muted-foreground">
                Join <span className="text-primary font-bold">5,000+</span> professionals
              </span>
            </div>

            {/* Headline */}
            <h1 className="text-5xl md:text-7xl lg:text-8xl font-bold tracking-tight text-foreground mb-8 leading-[1.1] max-w-5xl animate-in fade-in slide-in-from-bottom-8 duration-700 delay-100">
              Turn your LinkedIn into a <br className="hidden md:block" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-primary/80 to-accent animate-gradient-x">
                stunning website
              </span>
            </h1>

            {/* Subheadline */}
            <p className="text-xl text-muted-foreground mb-12 max-w-2xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-700 delay-200">
              Stop wasting hours on design. Import your LinkedIn profile and get a professional, SEO-optimized personal website in seconds.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row items-center gap-4 w-full justify-center animate-in fade-in slide-in-from-bottom-8 duration-700 delay-300">
              <Link to="/register">
                <Button size="lg" className="h-14 px-8 rounded-full text-lg shadow-xl shadow-primary/20 hover:shadow-primary/40 transition-all hover:-translate-y-1">
                  Create my page <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link to="#">
                <Button size="lg" variant="outline" className="h-14 px-8 rounded-full text-lg hover:bg-secondary/80 bg-background/50 backdrop-blur-sm">
                  View Demo
                </Button>
              </Link>
            </div>

            {/* Rating */}
            <div className="flex items-center gap-2 mt-8 animate-in fade-in slide-in-from-bottom-8 duration-700 delay-400">
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5].map((i) => (
                  <Star key={i} className="w-4 h-4 fill-orange-400 text-orange-400" />
                ))}
              </div>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">4.9/5</span> from 200+ reviews
              </p>
            </div>

            {/* Hero Visual/Preview */}
            <div className="mt-24 w-full max-w-5xl mx-auto relative animate-in fade-in slide-in-from-bottom-12 duration-1000 delay-500">

              {/* Floating Elements */}
              <div className="absolute -top-12 -left-12 md:-left-24 animate-float delay-0 hidden md:block z-20">
                <Card className="p-4 shadow-lg border-primary/10 bg-white/90 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-[#0077b5]/10 flex items-center justify-center text-[#0077b5]">
                      <Linkedin className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">Import from LinkedIn</p>
                      <p className="text-xs text-muted-foreground">One-click sync</p>
                    </div>
                  </div>
                </Card>
              </div>

              <div className="absolute -top-8 -right-12 md:-right-24 animate-float delay-1000 hidden md:block z-20">
                <Card className="p-4 shadow-lg border-primary/10 bg-white/90 backdrop-blur-md">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center text-purple-600">
                      <Sparkles className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold">AI Generated</p>
                      <p className="text-xs text-muted-foreground">Ready in 30s</p>
                    </div>
                  </div>
                </Card>
              </div>

              {/* Main Browser Window */}
              <div className="relative rounded-xl border bg-background/50 backdrop-blur-xl shadow-2xl overflow-hidden ring-1 ring-white/20">
                {/* Browser Toolbar */}
                <div className="h-12 bg-muted/50 border-b flex items-center px-4 gap-2">
                  <div className="flex gap-2">
                    <div className="w-3 h-3 rounded-full bg-red-400" />
                    <div className="w-3 h-3 rounded-full bg-yellow-400" />
                    <div className="w-3 h-3 rounded-full bg-green-400" />
                  </div>
                  <div className="flex-1 flex justify-center">
                    <div className="h-8 w-64 bg-background/50 rounded-md flex items-center justify-center text-xs text-muted-foreground font-mono">
                      portfolify.com/johndoe
                    </div>
                  </div>
                </div>

                {/* Browser Content */}
                <div className="bg-background aspect-[16/9] relative group overflow-hidden">
                  <div className="absolute inset-0 bg-dot-pattern opacity-[0.5]" />

                  {/* Mock Website Content */}
                  <div className="p-8 md:p-12 flex flex-col items-center h-full justify-center relative z-10 transition-transform duration-500 group-hover:scale-[1.02]">
                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-primary to-accent mb-6 shadow-xl ring-4 ring-background" />
                    <div className="h-8 w-64 bg-foreground/10 rounded-lg mb-4" />
                    <div className="h-4 w-96 bg-foreground/5 rounded-lg mb-2" />
                    <div className="h-4 w-80 bg-foreground/5 rounded-lg mb-8" />

                    <div className="grid grid-cols-3 gap-4 w-full max-w-2xl">
                      <div className="aspect-video bg-foreground/5 rounded-lg border border-foreground/5" />
                      <div className="aspect-video bg-foreground/5 rounded-lg border border-foreground/5" />
                      <div className="aspect-video bg-foreground/5 rounded-lg border border-foreground/5" />
                    </div>
                  </div>

                  {/* Overlay for "Templates" */}
                  <div className="absolute inset-0 bg-background/60 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <Button className="bg-foreground text-background hover:bg-foreground/90 rounded-full px-8">
                      Preview Template
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24 px-4 bg-secondary/30 relative overflow-hidden">
          <div className="absolute inset-0 bg-grid-pattern opacity-[0.2]" />
          <div className="max-w-7xl mx-auto relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Creators Love Portfolify</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                We've packed Portfolify with powerful features to help you stand out from the crowd.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                {
                  icon: <Palette className="w-6 h-6" />,
                  title: "Designer Templates",
                  desc: "Access a library of premium, responsive templates that look great on any device.",
                  color: "bg-blue-500/10 text-blue-600"
                },
                {
                  icon: <Code2 className="w-6 h-6" />,
                  title: "No Coding Required",
                  desc: "Our visual editor lets you customize everything without writing a single line of code.",
                  color: "bg-purple-500/10 text-purple-600"
                },
                {
                  icon: <Globe className="w-6 h-6" />,
                  title: "Custom Domain",
                  desc: "Connect your own domain name or use our free subdomain to get started instantly.",
                  color: "bg-green-500/10 text-green-600"
                }
              ].map((feature, idx) => (
                <Card key={idx} className="border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-1 group bg-background/50 backdrop-blur-sm">
                  <CardContent className="p-8">
                    <div className={`w-12 h-12 ${feature.color} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                      {feature.icon}
                    </div>
                    <h3 className="text-xl font-semibold mb-3">{feature.title}</h3>
                    <p className="text-muted-foreground leading-relaxed">
                      {feature.desc}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-12 px-4 border-t bg-background relative z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2 font-bold text-xl">
            <div className="w-8 h-8 bg-primary text-primary-foreground rounded-lg flex items-center justify-center">
              <Zap className="w-4 h-4 fill-current" />
            </div>
            <span>Portfolify</span>
          </div>
          <p className="text-sm text-muted-foreground">
            © {currentYear} Portfolify. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-muted-foreground">
            <Link to="#" className="hover:text-foreground transition-colors">Privacy</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Terms</Link>
            <Link to="#" className="hover:text-foreground transition-colors">Twitter</Link>
          </div>
        </div>
      </footer>

      {/* Chat Widget */}
      <div className="fixed bottom-6 right-6 z-50">
        <Button size="icon" className="h-14 w-14 rounded-full bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg hover:shadow-primary/25 transition-all hover:scale-105">
          <MessageCircle className="h-6 w-6" />
        </Button>
      </div>
    </div>
  );
};

export default Index;