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
    ExternalLink
} from "lucide-react";
import { cn } from "@/lib/utils";

const AdminLayout = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { tenantId } = useParams();
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isMobile, setIsMobile] = useState(false);
    const [tenant, setTenant] = useState<{ id: string; name: string } | null>(null);

    useEffect(() => {
        const checkMobile = () => {
            setIsMobile(window.innerWidth < 768);
            if (window.innerWidth < 768) {
                setIsSidebarOpen(false);
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
                .select('id, name')
                .eq('tenant_id', tenantId)
                .single();

            if (data && !error) {
                setTenant(data);
            }
        };

        fetchTenant();
    }, [tenantId]);

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
        { path: `${basePath}/messages`, label: "Messages", icon: MessageSquare },
    ];

    return (
        <div className="min-h-screen bg-gray-100 flex">
            {/* Sidebar */}
            <aside
                className={cn(
                    "bg-white border-r fixed inset-y-0 left-0 z-50 transition-all duration-300 ease-in-out flex flex-col",
                    isSidebarOpen ? "w-64" : "w-20 -ml-20 md:ml-0 md:w-20",
                    isMobile && !isSidebarOpen && "-translate-x-full"
                )}
            >
                <div className="p-6 border-b flex justify-between items-center">
                    <h1 className={cn("font-bold text-xl truncate", !isSidebarOpen && "hidden")}>
                        {tenant?.name || "Admin Panel"}
                    </h1>
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="md:hidden"
                    >
                        <X className="h-5 w-5" />
                    </Button>
                </div>

                <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;
                        return (
                            <Link
                                key={item.path}
                                to={item.path}
                                className={cn(
                                    "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors",
                                    isActive
                                        ? "bg-primary text-primary-foreground"
                                        : "hover:bg-gray-100 text-gray-700",
                                    !isSidebarOpen && "justify-center px-2"
                                )}
                            >
                                <Icon className="h-5 w-5 shrink-0" />
                                <span className={cn("truncate", !isSidebarOpen && "hidden")}>
                                    {item.label}
                                </span>
                            </Link>
                        );
                    })}

                    {tenantId && (
                        <Link
                            to={`/portfolio/${tenantId}`}
                            target="_blank"
                            className={cn(
                                "flex items-center gap-3 px-4 py-3 rounded-lg transition-colors hover:bg-gray-100 text-gray-700",
                                !isSidebarOpen && "justify-center px-2"
                            )}
                        >
                            <ExternalLink className="h-5 w-5 shrink-0" />
                            <span className={cn("truncate", !isSidebarOpen && "hidden")}>
                                View Portfolio
                            </span>
                        </Link>
                    )}
                </nav>

                <div className="p-4 border-t">
                    <Button
                        variant="destructive"
                        className={cn("w-full flex items-center gap-2", !isSidebarOpen && "justify-center px-0")}
                        onClick={handleLogout}
                    >
                        <LogOut className="h-4 w-4" />
                        <span className={cn(!isSidebarOpen && "hidden")}>Logout</span>
                    </Button>
                </div>
            </aside>

            {/* Main Content */}
            <main
                className={cn(
                    "flex-1 transition-all duration-300 ease-in-out flex flex-col min-h-screen",
                    isSidebarOpen ? "md:ml-64" : "md:ml-20"
                )}
            >
                <header className="bg-white border-b p-4 flex items-center gap-4 sticky top-0 z-40">
                    <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                        className="md:hidden"
                    >
                        <Menu className="h-5 w-5" />
                    </Button>
                    <h2 className="text-lg font-semibold">
                        {navItems.find((item) => item.path === location.pathname)?.label || "Dashboard"}
                    </h2>
                </header>

                <div className="p-6 flex-1 overflow-auto">
                    <Outlet context={{ tenant }} />
                </div>
            </main>
        </div>
    );
};

export default AdminLayout;
