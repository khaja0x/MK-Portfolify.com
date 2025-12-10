import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { TenantProvider } from "./contexts/TenantContext";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import TenantPortfolio from "./pages/TenantPortfolio";
import ProtectedRoute from "./components/ProtectedRoute";

// Admin Components
import AdminLogin from "./admin/Login";
import AdminRegister from "./admin/AdminRegister";
import AdminLayout from "./admin/AdminLayout";
import Dashboard from "./admin/Dashboard";
import HeroEditor from "./admin/editors/HeroEditor";
import AboutEditor from "./admin/editors/AboutEditor";
import SkillsEditor from "./admin/editors/SkillsEditor";
import ProjectsEditor from "./admin/editors/ProjectsEditor";
import ExperienceEditor from "./admin/editors/ExperienceEditor";
import ContactEditor from "./admin/editors/ContactEditor";
import Messages from "./admin/editors/Messages";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <TenantProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter
          future={{
            v7_startTransition: true,
            v7_relativeSplatPath: true,
          }}
        >
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<AdminRegister />} />
            <Route path="/login" element={<AdminLogin />} />
            <Route path="/login/:tenantId" element={<AdminLogin />} />
            <Route path="/portfolio/:tenantId" element={<TenantPortfolio />} />

            <Route element={<ProtectedRoute />}>
              {/* <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="hero" element={<HeroEditor />} />
                <Route path="about" element={<AboutEditor />} />
                <Route path="skills" element={<SkillsEditor />} />
                <Route path="projects" element={<ProjectsEditor />} />
                <Route path="experience" element={<ExperienceEditor />} />
                <Route path="contact" element={<ContactEditor />} />
                <Route path="messages" element={<Messages />} />
              </Route> */}
              <Route path="/admin/:tenantId" element={<AdminLayout />}>
                <Route index element={<Dashboard />} />
                <Route path="hero" element={<HeroEditor />} />
                <Route path="about" element={<AboutEditor />} />
                <Route path="skills" element={<SkillsEditor />} />
                <Route path="projects" element={<ProjectsEditor />} />
                <Route path="experience" element={<ExperienceEditor />} />
                <Route path="contact" element={<ContactEditor />} />
                <Route path="messages" element={<Messages />} />
              </Route>
            </Route>

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TenantProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;

