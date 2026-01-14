import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, MailOpen, Mail, Eye } from "lucide-react";
import { useNavigate } from "react-router-dom";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
    is_read: boolean;
}

const Admin = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);
    const navigate = useNavigate();

    useEffect(() => {
        fetchMessages();
    }, []);

    const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
    const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

    const fetchMessages = async () => {
        const res = await fetch(`${SUPABASE_URL}/functions/v1/contact-handler`, {
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        const json = await res.json();
        if (json.success) {
            setMessages(json.data);
        }
    };

    const toggleRead = async (id: string, currentStatus: boolean) => {
        await fetch(`${SUPABASE_URL}/functions/v1/contact-handler/${id}`, {
            method: "PATCH",
            headers: {
                "Content-Type": "application/json",
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            },
            body: JSON.stringify({ is_read: !currentStatus }),
        });
        fetchMessages();
    };

    const deleteMessage = async (id: string) => {
        if (!confirm("Are you sure?")) return;
        await fetch(`${SUPABASE_URL}/functions/v1/contact-handler/${id}`, {
            method: "DELETE",
            headers: {
                "apikey": SUPABASE_ANON_KEY,
                "Authorization": `Bearer ${SUPABASE_ANON_KEY}`
            }
        });
        fetchMessages();
    };

    const handleLogout = async () => {
        await supabase.auth.signOut();
        navigate("/login");
    };

    return (
        <div className="container mx-auto py-10">
            <div className="flex justify-between items-center mb-8">
                <h1 className="text-3xl font-bold">Admin Dashboard</h1>
                <Button variant="outline" onClick={handleLogout}>Logout</Button>
            </div>

            <div className="rounded-md border">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Status</TableHead>
                            <TableHead>Date</TableHead>
                            <TableHead>Name</TableHead>
                            <TableHead>Subject</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {messages.map((msg) => (
                            <TableRow key={msg.id} className={msg.is_read ? "opacity-60" : "font-medium"}>
                                <TableCell>
                                    <Badge variant={msg.is_read ? "secondary" : "default"}>
                                        {msg.is_read ? "Read" : "New"}
                                    </Badge>
                                </TableCell>
                                <TableCell>{new Date(msg.created_at).toLocaleDateString()}</TableCell>
                                <TableCell>
                                    <div className="flex flex-col">
                                        <span>{msg.name}</span>
                                        <span className="text-xs text-muted-foreground">{msg.email}</span>
                                    </div>
                                </TableCell>
                                <TableCell>{msg.subject}</TableCell>
                                <TableCell className="text-right gap-2 flex justify-end">
                                    <Button size="icon" variant="ghost" onClick={() => setSelectedMessage(msg)}>
                                        <Eye className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" onClick={() => toggleRead(msg.id, msg.is_read)}>
                                        {msg.is_read ? <MailOpen className="h-4 w-4" /> : <Mail className="h-4 w-4" />}
                                    </Button>
                                    <Button size="icon" variant="destructive" onClick={() => deleteMessage(msg.id)}>
                                        <Trash2 className="h-4 w-4" />
                                    </Button>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </div>

            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>{selectedMessage?.subject}</DialogTitle>
                        <DialogDescription>
                            From: {selectedMessage?.name} ({selectedMessage?.email})
                        </DialogDescription>
                    </DialogHeader>
                    <div className="mt-4">
                        <p className="text-sm text-muted-foreground mb-2">
                            {selectedMessage?.created_at && new Date(selectedMessage.created_at).toLocaleString()}
                        </p>
                        <div className="p-4 bg-muted rounded-md whitespace-pre-wrap">
                            {selectedMessage?.message}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Admin;
