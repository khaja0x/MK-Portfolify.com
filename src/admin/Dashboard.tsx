import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MessageSquare, Briefcase, Code, Eye } from "lucide-react";

const Dashboard = () => {
    const { tenantName } = useOutletContext<{ tenantName: string }>();
    const [stats, setStats] = useState({
        messages: 0,
        projects: 0,
        skills: 0,
        views: 0 // Placeholder for now
    });

    useEffect(() => {
        const fetchStats = async () => {
            const { count: messageCount } = await supabase
                .from("messages")
                .select("*", { count: "exact", head: true });

            const { count: projectCount } = await supabase
                .from("projects")
                .select("*", { count: "exact", head: true });

            const { count: skillCount } = await supabase
                .from("skills")
                .select("*", { count: "exact", head: true });

            setStats({
                messages: messageCount || 0,
                projects: projectCount || 0,
                skills: skillCount || 0,
                views: 1234 // Mock data
            });
        };

        fetchStats();
    }, []);

    return (
        <div className="space-y-6">
            <h1 className="text-3xl font-bold">Welcome back, {tenantName || "Admin"}!</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Messages</CardTitle>
                        <MessageSquare className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.messages}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Projects</CardTitle>
                        <Briefcase className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.projects}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Skills</CardTitle>
                        <Code className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.skills}</div>
                    </CardContent>
                </Card>

                <Card>
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium">Total Views</CardTitle>
                        <Eye className="h-4 w-4 text-muted-foreground" />
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold">{stats.views}</div>
                        <p className="text-xs text-muted-foreground">+20.1% from last month</p>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Dashboard;
