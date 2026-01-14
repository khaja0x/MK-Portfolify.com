



// //////15-12-25 views increament


import { useEffect, useState } from "react";
import { useOutletContext, Link } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Briefcase, Code, Eye, Rocket, Plus, Sun, ArrowRight, User, Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { formatDistanceToNow } from "date-fns";

interface Stats {
  messages: number;
  projects: number;
  skills: number;
  views: number;
}

interface Message {
  id: string;
  full_name: string;
  email: string;
  message_content: string;
  created_at: string;
}

interface Stats {
  messages: number;
  projects: number;
  skills: number;
  views: number;
}

const Dashboard = () => {
  const { tenant } = useOutletContext<{

    tenant: { id: string; name: string; tenant_id: string } | null;

  }>();

  const [stats, setStats] = useState<Stats>({
    messages: 0,
    projects: 0,
    skills: 0,
    views: 0,
  });

  const [recentMessages, setRecentMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!tenant?.id) return;

    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const [{ count: messageCount }, { count: projectCount }, { count: skillCount }, { data: viewData }, { data: messages }] =
          await Promise.all([
            supabase
              .from("messages")
              .select("*", { count: "exact", head: true })
              .eq("tenant_id", tenant.id),

            supabase
              .from("projects")
              .select("*", { count: "exact", head: true })
              .eq("tenant_id", tenant.id),

            supabase
              .from("skills")
              .select("*", { count: "exact", head: true })
              .eq("tenant_id", tenant.id),

            supabase
              .from("portfolio_views")
              .select("views")
              .eq("tenant_id", tenant.id)
              .maybeSingle(),

            supabase
              .from("messages")
              .select("*")
              .eq("tenant_id", tenant.id)
              .order("created_at", { ascending: false })
              .limit(3),
          ]);

        setStats({
          messages: messageCount || 0,
          projects: projectCount || 0,
          skills: skillCount || 0,
          views: viewData?.views || 0,
        });

        setRecentMessages(messages || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [tenant?.id]);

  if (!tenant) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-white">
            Welcome back, {tenant.name.split(" ")[0]}!
          </h1>
          <p className="text-slate-400 mt-1">
            Here's what's happening with your portfolio today.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" size="icon" className="rounded-xl border-slate-800 bg-slate-900/50 text-slate-400 hover:text-white">
            <Sun className="h-5 w-5" />
          </Button>
          <Button asChild className="rounded-xl bg-sky-500 hover:bg-sky-600 text-white shadow-lg shadow-sky-500/20 px-6">
            <Link to={`/admin/${tenant.tenant_id}/projects`}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: "Total Messages", value: stats.messages, icon: MessageSquare, color: "text-blue-500", bg: "bg-blue-500/10" },
          { label: "Projects", value: stats.projects, icon: Rocket, color: "text-emerald-500", bg: "bg-emerald-500/10" },
          { label: "Skills", value: stats.skills, icon: Code, color: "text-purple-500", bg: "bg-purple-500/10" },
          { label: "Total Views", value: stats.views.toLocaleString(), icon: Eye, color: "text-orange-500", bg: "bg-orange-500/10" },
        ].map((stat, i) => (
          <Card key={i} className="border-slate-800 bg-slate-900/50 backdrop-blur-sm overflow-hidden group hover:border-slate-700 transition-all">
            <CardContent className="p-6">
              <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                <stat.icon size={20} />
              </div>
              <p className="text-sm font-medium text-slate-400">{stat.label}</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Messages */}
        <Card className="lg:col-span-2 border-slate-800 bg-slate-900/50 backdrop-blur-sm">
          <CardContent className="p-0">
            <div className="p-6 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xl font-semibold text-white">Recent Messages</h2>
              <Link to={`/admin/${tenant.tenant_id}/messages`} className="text-sky-400 hover:text-sky-300 text-sm font-medium flex items-center">
                View All Messages
                <ArrowRight size={14} className="ml-1" />
              </Link>
            </div>
            <div className="p-6 space-y-6">
              {loading ? (
                <div className="space-y-4">
                  {[1, 2, 3].map((n) => (
                    <div key={n} className="h-20 bg-slate-800/50 rounded-xl animate-pulse" />
                  ))}
                </div>
              ) : recentMessages.length > 0 ? (
                recentMessages.map((msg) => (
                  <div key={msg.id} className="flex gap-4 group cursor-pointer">
                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center shrink-0 group-hover:bg-slate-700 transition-colors">
                      <User size={20} className="text-slate-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className="font-medium text-white truncate">{msg.full_name}</h4>
                        <span className="text-xs text-slate-500 whitespace-nowrap">
                          {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <p className="text-sm text-slate-400 line-clamp-1">{msg.message_content}</p>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 bg-slate-800/50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <MessageSquare size={24} className="text-slate-500" />
                  </div>
                  <p className="text-slate-400">No messages yet</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Pro Tip Card */}
        <div className="space-y-6">
          <Card className="border-slate-800 bg-slate-900/50 backdrop-blur-sm group hover:border-slate-700 transition-all overflow-hidden">
            <CardContent className="p-8">
              <div className="w-12 h-12 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                <Palette className="h-6 w-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2 leading-tight">
                Premium Templates
              </h3>
              <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                Switch between modern, high-converting designs with a single click.
              </p>
              <Button asChild variant="outline" className="w-full rounded-xl border-slate-700 hover:bg-slate-800 text-slate-300 font-bold py-6">
                <Link to={`/admin/${tenant.tenant_id}/templates`}>
                  Choose Design
                </Link>
              </Button>
            </CardContent>
          </Card>

          <Card className="border-0 bg-gradient-to-br from-sky-500 to-indigo-600 text-white overflow-hidden relative">
            <div className="absolute top-0 right-0 -mr-8 -mt-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
            <CardContent className="p-8 relative z-10">
              <div className="bg-white/20 w-fit px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider mb-6">
                Pro Tip
              </div>
              <h3 className="text-2xl font-bold mb-4 leading-tight">
                Complete your profile to boost visibility
              </h3>
              <p className="text-sky-100 text-sm mb-8 leading-relaxed">
                Projects with at least 3 featured images get 4x more engagement from potential employers and collaborators.
              </p>
              <Button asChild className="w-full bg-white text-sky-600 hover:bg-sky-50 rounded-xl font-bold py-6">
                <Link to={`/admin/${tenant.tenant_id}/projects`}>
                  Add a Project
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>

      </div>
    </div>
  );
};


export default Dashboard;




