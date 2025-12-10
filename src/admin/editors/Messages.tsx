import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Trash2, MailOpen, Mail, Eye } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";

interface Message {
    id: string;
    name: string;
    email: string;
    subject: string;
    message: string;
    created_at: string;
    is_read: boolean;
}

const Messages = () => {
    const { toast } = useToast();
    const { tenant } = useOutletContext<{ tenant: { id: string; name: string } }>();
    const [messages, setMessages] = useState<Message[]>([]);
    const [selectedMessage, setSelectedMessage] = useState<Message | null>(null);

    useEffect(() => {
        if (tenant?.id) {
            fetchMessages();

            // Realtime subscription
            const channel = supabase
                .channel("messages")
                .on(
                    "postgres_changes",
                    {
                        event: "*",
                        schema: "public",
                        table: "messages",
                        filter: `tenant_id=eq.${tenant.id}`
                    },
                    () => {
                        fetchMessages();
                    }
                )
                .subscribe();

            return () => {
                supabase.removeChannel(channel);
            };
        }
    }, [tenant?.id]);

    const fetchMessages = async () => {
        if (!tenant?.id) return;

        const { data, error } = await supabase
            .from("messages")
            .select("*")
            .eq("tenant_id", tenant.id)
            .order("created_at", { ascending: false });

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else if (data) {
            setMessages(data);
        }
    };

    const toggleRead = async (id: string, currentStatus: boolean) => {
        const { error } = await supabase
            .from("messages")
            .update({ is_read: !currentStatus })
            .eq("id", id);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            // Optimistic update or wait for realtime
            setMessages(messages.map(m => m.id === id ? { ...m, is_read: !currentStatus } : m));
        }
    };

    const deleteMessage = async (id: string) => {
        if (!confirm("Are you sure?")) return;

        const { error } = await supabase
            .from("messages")
            .delete()
            .eq("id", id);

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        } else {
            setMessages(messages.filter(m => m.id !== id));
            toast({ title: "Success", description: "Message deleted" });
        }
    };

    return (
        <div className="space-y-6">
            <h2 className="text-2xl font-bold">Messages</h2>

            <div className="rounded-md border bg-white">
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
                        {messages.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                                    No messages found.
                                </TableCell>
                            </TableRow>
                        ) : (
                            messages.map((msg) => (
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
                            ))
                        )}
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

export default Messages;
