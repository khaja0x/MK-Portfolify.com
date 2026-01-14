import { useEffect, useState } from "react";
import { useOutletContext } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Trash2, MailOpen, Mail, Eye, MessageSquare, Clock, User, ArrowLeft, MoreHorizontal, CheckCircle2 } from "lucide-react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { formatDistanceToNow } from "date-fns";
import { Card, CardContent } from "@/components/ui/card";

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
                    () => fetchMessages()
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
            if (selectedMessage?.id === id) setSelectedMessage(null);
        }
    };

    const openMessage = (msg: Message) => {
        setSelectedMessage(msg);
        if (!msg.is_read) {
            toggleRead(msg.id, false);
        }
    };

    return (
        <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
                        <MessageSquare className="text-sky-500" />
                        Inbox
                    </h2>
                    <p className="text-slate-400 mt-1">Connect with people who reach out to you</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.5)]" />
                        <span className="text-sm font-semibold text-white">
                            {messages.filter(m => !m.is_read).length} Unread
                        </span>
                    </div>
                </div>
            </div>

            <Card className="border-0 shadow-2xl bg-white rounded-[2rem] overflow-hidden">
                <CardContent className="p-0">
                    <div className="divide-y divide-slate-100">
                        {messages.length === 0 ? (
                            <div className="py-20 text-center">
                                <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <Mail className="text-slate-300" size={32} />
                                </div>
                                <h3 className="text-slate-900 text-xl font-bold mb-2">No messages yet</h3>
                                <p className="text-slate-500">When someone contacts you, their message will appear here.</p>
                            </div>
                        ) : (
                            messages.map((msg, idx) => (
                                <div
                                    key={msg.id}
                                    onClick={() => openMessage(msg)}
                                    className={`group flex items-center gap-6 p-6 md:px-8 cursor-pointer transition-all hover:bg-slate-50 ${!msg.is_read ? 'bg-sky-50/30' : ''}`}
                                >
                                    <div className="shrink-0 flex items-center justify-center w-4 h-4">
                                        {!msg.is_read && (
                                            <div className="w-3 h-3 bg-sky-500 rounded-full shadow-[0_0_8px_rgba(14,165,233,0.4)]" />
                                        )}
                                    </div>

                                    <div className="flex-1 min-w-0 grid grid-cols-1 md:grid-cols-4 gap-4 items-center">
                                        <div className="md:col-span-1">
                                            <div className="font-bold text-slate-900 truncate flex items-center gap-2">
                                                {msg.name}
                                                {msg.is_read && <CheckCircle2 size={14} className="text-slate-300" />}
                                            </div>
                                            <div className="text-xs text-slate-500 truncate">{msg.email}</div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <div className={`text-sm truncate ${!msg.is_read ? 'font-bold text-slate-900' : 'text-slate-600'}`}>
                                                {msg.subject}
                                            </div>
                                            <div className="text-xs text-slate-400 truncate mt-1">
                                                {msg.message}
                                            </div>
                                        </div>

                                        <div className="md:col-span-1 text-right text-xs font-medium text-slate-400 flex items-center justify-end gap-2">
                                            <Clock size={12} />
                                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                                        </div>
                                    </div>

                                    <div className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity flex gap-2">
                                        <Button
                                            size="icon"
                                            variant="ghost"
                                            className="h-10 w-10 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-xl"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteMessage(msg.id);
                                            }}
                                        >
                                            <Trash2 size={18} />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </CardContent>
            </Card>

            <Dialog open={!!selectedMessage} onOpenChange={(open) => !open && setSelectedMessage(null)}>
                <DialogContent className="max-w-2xl p-0 bg-white border-0 rounded-[2.5rem] overflow-hidden shadow-3xl">
                    <div className="p-8 md:p-12">
                        <DialogHeader className="mb-8">
                            <div className="flex justify-between items-start mb-6">
                                <div className="space-y-1 text-left">
                                    <DialogTitle className="text-2xl font-black text-slate-900 leading-tight">
                                        {selectedMessage?.subject}
                                    </DialogTitle>
                                    <div className="flex items-center gap-2 text-slate-500 font-medium pb-2 border-b border-slate-100">
                                        <div className="w-8 h-8 bg-sky-100 rounded-full flex items-center justify-center text-sky-600">
                                            <User size={16} strokeWidth={3} />
                                        </div>
                                        <span>{selectedMessage?.name}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-sm">{selectedMessage?.email}</span>
                                    </div>
                                </div>
                            </div>
                            <DialogDescription className="hidden">
                                Detailed view of the message sent via portfolio contact form.
                            </DialogDescription>
                        </DialogHeader>

                        <div className="bg-slate-50 rounded-3xl p-8 min-h-[200px] border border-slate-100 mb-8">
                            <p className="text-slate-700 leading-relaxed whitespace-pre-wrap font-medium">
                                {selectedMessage?.message}
                            </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider">
                                <Clock size={14} />
                                Sent {selectedMessage?.created_at && formatDistanceToNow(new Date(selectedMessage.created_at), { addSuffix: true })}
                            </div>
                            <div className="flex gap-3">
                                <Button
                                    variant="ghost"
                                    onClick={() => setSelectedMessage(null)}
                                    className="rounded-xl px-6 font-bold text-slate-500 hover:bg-slate-100"
                                >
                                    Dismiss
                                </Button>
                                <Button
                                    className="bg-slate-900 hover:bg-black text-white rounded-xl px-8 font-black shadow-lg shadow-slate-200"
                                    onClick={() => {
                                        window.location.href = `mailto:${selectedMessage?.email}?subject=Re: ${selectedMessage?.subject}`;
                                    }}
                                >
                                    Reply via Email
                                </Button>
                            </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default Messages;
