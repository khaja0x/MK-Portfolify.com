import { useState, useEffect } from "react";
import { Outlet, Link, useNavigate, useLocation, useParams } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import {
    LayoutDashboard,
    User,
    Code,
    Briefcase,
    FileText,
    MessageSquare,
    LogOut,
    Menu,
    X,
    Home,
    ExternalLink,
    Zap,
    Palette
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { tenantId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [tenant, setTenant] = useState<{ id: string; name: string; tenant_id: string } | null>(null);
    const [unreadCount, setUnreadCount] = useState(0);

    useEffect(() => {
        const checkMobile = () => {
            const mobile = window.innerWidth < 1024;
            setIsMobile(mobile);
            if (mobile) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
            }
        };
        checkMobile();
        window.addEventListener("resize", checkMobile);
        return () => window.removeEventListener("resize", checkMobile);
    }, []);

    useEffect(() => {
        const fetchTenant = async () => {
            if (!tenantId) return;

            const { data, error } = await supabase
                .from('tenants')
                .select('*')
                .eq('tenant_id', tenantId)
                .single();

            if (data && !error) {
                setTenant(data);
            }
        };

        fetchTenant();
    }, [tenantId]);

    useEffect(() => {
        if (!tenant?.id) return;

        const fetchUnreadCount = async () => {
            const { count } = await supabase
                .from('messages')
                .select('*', { count: 'exact', head: true })
                .eq('tenant_id', tenant.id)
                .eq('is_read', false);

            setUnreadCount(count || 0);
        };

        fetchUnreadCount();

        // Subscribe to new messages
        const channel = supabase
            .channel('admin_messages')
            .on('postgres_changes', {
                event: '*',
                schema: 'public',
                table: 'messages',
                filter: `tenant_id=eq.${tenant.id}`
            }, () => {
                fetchUnreadCount();
            })
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [tenant?.id]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    const basePath = tenantId ? `/admin/${tenantId}` : "";

    const navItems = [
        { path: basePath, label: "Dashboard", icon: LayoutDashboard },
        { path: `${basePath}/hero`, label: "Hero Section", icon: Home },
        { path: `${basePath}/about`, label: "About", icon: User },
        { path: `${basePath}/skills`, label: "Skills", icon: Code },
        { path: `${basePath}/projects`, label: "Projects", icon: Briefcase },
        { path: `${basePath}/experience`, label: "Experience", icon: FileText },
        { path: `${basePath}/contact`, label: "Contact Info", icon: MessageSquare },
        { path: `${basePath}/templates`, label: "Premium Templates", icon: Palette },
        { path: `${basePath}/messages`, label: "Messages", icon: MessageSquare, badge: unreadCount > 0 ? unreadCount : null },
    ];

    return (
        <div className="min-h-screen bg-[#0f172a] flex text-slate-200">
            {/* Overlay for mobile */}
            {isMobile && isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-opacity"
                    onClick={() => setIsSidebarOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-[#0f172a] border-r border-slate-800 fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out flex flex-col",
                    isSidebarOpen ? "w-72" : "w-20 -ml-20 lg:ml-0 lg:w-20",
                )}
            >
                {/* Logo Area */}
                <div className="p-8 flex items-center gap-3">
                    <div className="w-10 h-10 bg-sky-500 rounded-xl flex items-center justify-center shadow-lg shadow-sky-500/20 shrink-0">
                        <Zap className="text-white fill-white" size={24} />
                    </div>
                    {isSidebarOpen && (
                        <h1 className="font-bold text-2xl tracking-tight text-white">
                            Portfolify
                        </h1>
                    )}
                </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto mt-4">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                onClick={() => isMobile && setIsSidebarOpen(false)}
                                className={cn(
                                    "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all group relative",
                                    isActive
                                        ? "bg-sky-500/10 text-sky-400 font-medium"
                                        : "hover:bg-slate-800/50 text-slate-400 hover:text-slate-200",
                                    !isSidebarOpen && "justify-center px-2"
                                )}
                            >
                                <Icon className={cn(
                                    "h-5 w-5 shrink-0 transition-colors",
                                    isActive ? "text-sky-400" : "text-slate-500 group-hover:text-slate-300"
                                )} />
                                {isSidebarOpen && (
                                    <span className="truncate">{item.label}</span>
                                )}
                                {item.badge && isSidebarOpen && (
                                    <span className="ml-auto bg-sky-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full ring-4 ring-[#0f172a]">
                                        {item.badge}
                                    </span>
                                )}
                                {isActive && !isSidebarOpen && (
                                    <div className="absolute left-0 w-1 h-6 bg-sky-400 rounded-r-full" />
                                )}
                            </Link>
                        );
                    })}

                    <div className="pt-8 pb-4">
                        <div className="h-px bg-slate-800 mx-4" />
                    </div>

                    {tenantId && (
                        <Link
                            to={`/portfolio/${tenantId}`}
                            target="_blank"
                            className={cn(
                                "flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all hover:bg-slate-800/50 text-slate-400 hover:text-slate-200",
                                !isSidebarOpen && "justify-center px-2"
                            )}
                        >
                            <ExternalLink className="h-5 w-5 shrink-0 text-slate-500" />
                            {isSidebarOpen && (
                                <span className="truncate">View Portfolio</span>
                            )}
                        </Link>
                    )}
                </nav>

                {/* User Profile & Logout */}
                <div className="p-4 bg-slate-900/40 border-t border-slate-800 m-4 rounded-2xl">
                    {isSidebarOpen ? (
                        <div className="space-y-4">
                            <div className="flex items-center gap-3">
                                <Avatar className="h-10 w-10 border-2 border-slate-800">
                                    <AvatarFallback className="bg-sky-500/10 text-sky-400 font-bold uppercase">
                                        {tenant?.name?.charAt(0) || "A"}
                                    </AvatarFallback>
                                </Avatar>
                                <div className="min-w-0">
                                    <p className="text-sm font-semibold text-white truncate">
                                        {tenant?.name || "Admin"}
                                    </p>
                                    <p className="text-[10px] font-bold text-sky-400 uppercase tracking-widest mt-0.5">
                                        Pro Plan
                                    </p>
                                </div>
                            </div>
                            <Button
                                variant="ghost"
                                className="w-full flex items-center justify-start gap-3 text-red-400 hover:text-red-300 hover:bg-red-500/10 h-11 px-4 rounded-xl font-medium transition-colors"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5" />
                                <span>Logout</span>
                            </Button>
                        </div>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <Avatar className="h-10 w-10 border-2 border-slate-800">
                                <AvatarFallback className="bg-sky-500/10 text-sky-400 font-bold uppercase">
                                    {tenant?.name?.charAt(0) || "A"}
                                </AvatarFallback>
                            </Avatar>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="text-red-400 hover:text-red-300 hover:bg-red-500/10 rounded-xl transition-colors"
                                onClick={handleLogout}
                            >
                                <LogOut className="h-5 w-5" />
                            </Button>
                        </div>
                    )}
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out flex flex-col min-h-screen",
                    isSidebarOpen ? "lg:ml-72" : "lg:ml-20"
                )}
            >
                {/* Header for mobile only */}
                <header className="lg:hidden p-4 border-b border-slate-800 flex items-center justify-between sticky top-0 bg-[#0f172a]/80 backdrop-blur-md z-30">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-sky-500 rounded-lg flex items-center justify-center">
                            <Zap className="text-white fill-white" size={18} />
                        </div>
                        <h2 className="font-bold text-lg text-white">
                            Portfolify
                        </h2>
                    </div>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(true)}
                        className="text-slate-400 hover:text-white"
                    >
                        <Menu className="h-6 w-6" />
                    </Button>
                </header>

                <div className="p-6 md:p-10 flex-1 overflow-auto max-w-[1600px] mx-auto w-full">
                    <Outlet context={{ tenant }} />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
