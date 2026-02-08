import { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/contexts/AuthContext';
import TapxLayout from '@/layouts/TapxLayout';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Skeleton } from '@/components/ui/skeleton';
import {
    Search,
    Send,
    MoreVertical,
    ArrowLeft,
    MessageCircle,
    Check,
    CheckCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format, isToday, isYesterday } from 'date-fns';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5001/api';

interface Participant {
    id: string;
    name: string;
    username: string;
    avatar: string;
}

interface Conversation {
    id: string;
    participant: Participant;
    lastMessage: string;
    lastMessageAt: string;
    unreadCount: number;
}

interface Message {
    id: string;
    _id?: string; // MongoDB may return _id instead of id
    content: string;
    type: 'text' | 'image' | 'system';
    sender_id: string;
    created_at: string;
    read: boolean;
}

const formatMessageTime = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
        return format(date, 'h:mm a');
    }
    if (isYesterday(date)) {
        return 'Yesterday';
    }
    return format(date, 'MMM d');
};

const Messages = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();
    const targetUsername = searchParams.get('with');

    // Get auth token from localStorage
    const token = localStorage.getItem('auth_token');

    // State
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [newMessage, setNewMessage] = useState('');
    const [loading, setLoading] = useState(true);
    const [messagesLoading, setMessagesLoading] = useState(false);
    const [sending, setSending] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const [otherUserTyping, setOtherUserTyping] = useState(false);

    const socketRef = useRef<Socket | null>(null);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const activeConversationRef = useRef<Conversation | null>(null);
    const notificationSoundRef = useRef<HTMLAudioElement | null>(null);

    // Keep refs in sync with state
    useEffect(() => {
        activeConversationRef.current = activeConversation;
    }, [activeConversation]);

    // Initialize notification sound
    useEffect(() => {
        notificationSoundRef.current = new Audio('https://assets.mixkit.co/active_storage/sfx/2354/2354-preview.mp3');
        notificationSoundRef.current.volume = 0.5;
    }, []);

    // Play notification sound
    const playNotificationSound = () => {
        try {
            notificationSoundRef.current?.play().catch(() => {
                // Browser may block autoplay without user interaction
                console.log('[Chat] Notification sound blocked by browser');
            });
        } catch (e) {
            console.log('[Chat] Error playing notification sound');
        }
    };

    // Socket connection
    useEffect(() => {
        if (!user || !token) return;

        const socketUrl = (import.meta.env.VITE_API_URL || 'http://localhost:5001').replace(/\/api\/?$/, '');
        console.log('[Chat] Connecting to socket at:', socketUrl);
        socketRef.current = io(socketUrl);

        socketRef.current.on('connect', () => {
            console.log('[Chat] Socket connected:', socketRef.current?.id);
            // Join user's personal notification room
            socketRef.current?.emit('joinUser', user.id);
        });

        socketRef.current.on('newMessage', ({ message, conversationId }) => {
            console.log('[Chat] Received newMessage:', { conversationId, messagePreview: message.content?.substring(0, 20) });

            // Use ref to get current activeConversation value
            const currentConversation = activeConversationRef.current;

            if (currentConversation?.id === conversationId) {
                // Only add if not from current user (sender already adds optimistically)
                if (message.sender_id !== user.id) {
                    setMessages(prev => [...prev, message]);
                    scrollToBottom();
                    // Play sound for received message
                    playNotificationSound();
                }
            } else {
                // Message is for a different conversation - play notification
                if (message.sender_id !== user.id) {
                    playNotificationSound();
                }
            }
            // Always refresh conversation list to update unread counts
            fetchConversations();
        });

        socketRef.current.on('userTyping', ({ userId, isTyping }) => {
            const currentConversation = activeConversationRef.current;
            if (currentConversation?.participant.id === userId) {
                setOtherUserTyping(isTyping);
            }
        });

        socketRef.current.on('messageNotification', ({ conversationId, senderId, preview }) => {
            console.log('[Chat] Received messageNotification:', { conversationId, preview, senderId });
            // Play notification sound only for receiver (not sender) and if not in active conversation
            const currentConversation = activeConversationRef.current;
            if (senderId !== user.id && currentConversation?.id !== conversationId) {
                playNotificationSound();
            }
            fetchConversations();
        });

        return () => {
            socketRef.current?.disconnect();
        };
    }, [user, token]);

    // Join chat room when conversation changes
    useEffect(() => {
        if (activeConversation && socketRef.current) {
            socketRef.current.emit('joinChat', activeConversation.id);
            return () => {
                socketRef.current?.emit('leaveChat', activeConversation.id);
            };
        }
    }, [activeConversation?.id]);

    // Fetch conversations
    const fetchConversations = async () => {
        console.log('[Messages] Fetching conversations, token:', token ? 'present' : 'missing');
        try {
            const res = await fetch(`${API_URL}/chat/conversations`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            console.log('[Messages] Response status:', res.status);
            if (res.ok) {
                const data = await res.json();
                console.log('[Messages] Conversations loaded:', data.length);
                setConversations(data);
            } else {
                const error = await res.text();
                console.error('[Messages] Failed to fetch:', error);
            }
        } catch (err) {
            console.error('[Messages] Error fetching conversations:', err);
        } finally {
            setLoading(false);
        }
    };

    // Initialize with target user if provided
    useEffect(() => {
        if (token) {
            fetchConversations();
        }
    }, [token]);

    useEffect(() => {
        if (targetUsername && token && !loading) {
            openConversationWithUsername(targetUsername);
        }
    }, [targetUsername, token, loading]);

    const openConversationWithUsername = async (username: string) => {
        try {
            setMessagesLoading(true);
            const res = await fetch(`${API_URL}/chat/conversation`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ targetUsername: username })
            });

            if (res.ok) {
                const conv = await res.json();
                setActiveConversation(conv);
                await fetchMessages(conv.id);
                fetchConversations(); // Refresh list
            }
        } catch (err) {
            console.error('Error opening conversation:', err);
        } finally {
            setMessagesLoading(false);
        }
    };

    const fetchMessages = async (conversationId: string) => {
        try {
            setMessagesLoading(true);
            const res = await fetch(`${API_URL}/chat/messages/${conversationId}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.ok) {
                const data = await res.json();
                setMessages(data);
                scrollToBottom();
            }
        } catch (err) {
            console.error('Error fetching messages:', err);
        } finally {
            setMessagesLoading(false);
        }
    };

    const selectConversation = async (conv: Conversation) => {
        setActiveConversation(conv);
        await fetchMessages(conv.id);

        // Mark messages as read and clear unread count
        try {
            await fetch(`${API_URL}/chat/read/${conv.id}`, {
                method: 'PUT',
                headers: { Authorization: `Bearer ${token}` }
            });
            // Dispatch custom event to update sidebar badge
            window.dispatchEvent(new CustomEvent('messagesRead'));
        } catch (err) {
            console.error('Error marking as read:', err);
        }

        // Clear from URL if present
        if (targetUsername) {
            navigate('/messages', { replace: true });
        }
    };

    const sendMessage = async () => {
        if (!newMessage.trim() || !activeConversation || sending) return;

        const content = newMessage.trim();
        setNewMessage('');
        setSending(true);

        // Optimistic update
        const tempMessage: Message = {
            id: `temp-${Date.now()}`,
            content,
            type: 'text',
            sender_id: user!.id,
            created_at: new Date().toISOString(),
            read: false
        };
        setMessages(prev => [...prev, tempMessage]);
        scrollToBottom();

        try {
            const res = await fetch(`${API_URL}/chat/send`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({
                    conversationId: activeConversation.id,
                    content
                })
            });

            if (res.ok) {
                const savedMessage = await res.json();
                setMessages(prev => prev.map(m =>
                    m.id === tempMessage.id ? savedMessage : m
                ));
            }
        } catch (err) {
            console.error('Error sending message:', err);
            // Remove failed message
            setMessages(prev => prev.filter(m => m.id !== tempMessage.id));
        } finally {
            setSending(false);
        }
    };

    const handleTyping = (e: React.ChangeEvent<HTMLInputElement>) => {
        setNewMessage(e.target.value);

        if (!isTyping) {
            setIsTyping(true);
            socketRef.current?.emit('typing', {
                conversationId: activeConversation?.id,
                userId: user?.id,
                isTyping: true
            });
        }

        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }

        typingTimeoutRef.current = setTimeout(() => {
            setIsTyping(false);
            socketRef.current?.emit('typing', {
                conversationId: activeConversation?.id,
                userId: user?.id,
                isTyping: false
            });
        }, 1000);
    };

    const scrollToBottom = () => {
        setTimeout(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
    };

    const filteredConversations = conversations.filter(conv =>
        conv.participant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        conv.participant.username.toLowerCase().includes(searchQuery.toLowerCase())
    );

    if (!user) {
        return (
            <div className="flex items-center justify-center h-screen">
                <p>Please log in to view messages</p>
            </div>
        );
    }

    return (
        <TapxLayout>
            <div className="flex h-full bg-gray-50 dark:bg-black">
                {/* Conversation List */}
                <div className={cn(
                    "w-full md:w-80 lg:w-96 border-r border-gray-200 dark:border-zinc-800 flex flex-col bg-white dark:bg-zinc-900",
                    activeConversation ? "hidden md:flex" : "flex"
                )}>
                    {/* Header */}
                    <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Messages</h1>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500 dark:text-zinc-500" />
                            <Input
                                placeholder="Search conversations..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 bg-gray-100 dark:bg-zinc-800 border-transparent dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-zinc-500 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-700"
                            />
                        </div>
                    </div>

                    {/* Conversation List */}
                    <ScrollArea className="flex-1">
                        {loading ? (
                            <div className="p-4 space-y-3">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="flex items-center gap-3">
                                        <Skeleton className="w-12 h-12 rounded-full" />
                                        <div className="flex-1">
                                            <Skeleton className="h-4 w-24 mb-2" />
                                            <Skeleton className="h-3 w-32" />
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : filteredConversations.length === 0 ? (
                            <div className="p-8 text-center text-zinc-500">
                                <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                <p>No conversations yet</p>
                                <p className="text-sm mt-1">Start a chat from someone's profile</p>
                            </div>
                        ) : (
                            <div className="divide-y divide-gray-100 dark:divide-zinc-800/50">
                                {filteredConversations.map(conv => (
                                    <Button
                                        key={conv.id}
                                        variant="ghost"
                                        onClick={() => selectConversation(conv)}
                                        className={cn(
                                            "w-full p-4 h-auto flex items-center gap-3 hover:bg-gray-50 dark:hover:bg-zinc-800/50 transition-colors text-left justify-start rounded-none",
                                            activeConversation?.id === conv.id && "bg-blue-50 dark:bg-zinc-800/50"
                                        )}
                                    >
                                        <Avatar className="w-12 h-12 border border-gray-100 dark:border-zinc-800">
                                            <AvatarImage src={conv.participant.avatar} />
                                            <AvatarFallback className="bg-zinc-700 text-white">
                                                {conv.participant.name?.[0] || '?'}
                                            </AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center justify-between">
                                                <p className="font-medium text-gray-900 dark:text-white truncate">
                                                    {conv.participant.name}
                                                </p>
                                                <span className="text-xs text-zinc-500">
                                                    {formatMessageTime(conv.lastMessageAt)}
                                                </span>
                                            </div>
                                            <div className="flex items-center justify-between">
                                                <p className="text-sm text-gray-500 dark:text-zinc-400 truncate">
                                                    {conv.lastMessage || 'No messages yet'}
                                                </p>
                                                {conv.unreadCount > 0 && (
                                                    <span className="bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                                        {conv.unreadCount}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </Button>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </div>

                {/* Chat Area */}
                <div className={cn(
                    "flex-1 flex flex-col",
                    !activeConversation ? "hidden md:flex" : "flex"
                )}>
                    {activeConversation ? (
                        <>
                            {/* Chat Header */}
                            <div className="p-4 border-b border-gray-200 dark:border-zinc-800 flex items-center justify-between bg-white dark:bg-zinc-900">
                                <div className="flex items-center gap-3">
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="md:hidden"
                                        onClick={() => setActiveConversation(null)}
                                    >
                                        <ArrowLeft className="w-5 h-5" />
                                    </Button>
                                    <Avatar className="w-10 h-10">
                                        <AvatarImage src={activeConversation.participant.avatar} />
                                        <AvatarFallback className="bg-zinc-700 text-white">
                                            {activeConversation.participant.name?.[0] || '?'}
                                        </AvatarFallback>
                                    </Avatar>
                                    <div>
                                        <p className="font-medium text-gray-900 dark:text-white">
                                            {activeConversation.participant.name}
                                        </p>
                                        <p className="text-xs text-zinc-500">
                                            @{activeConversation.participant.username}
                                            {otherUserTyping && ' • typing...'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Messages */}
                            <ScrollArea className="flex-1 p-4">
                                {messagesLoading ? (
                                    <div className="space-y-4">
                                        {[1, 2, 3].map(i => (
                                            <div key={i} className={cn("flex", i % 2 === 0 ? "justify-end" : "justify-start")}>
                                                <Skeleton className="h-10 w-48 rounded-2xl" />
                                            </div>
                                        ))}
                                    </div>
                                ) : messages.length === 0 ? (
                                    <div className="h-full flex items-center justify-center text-zinc-500">
                                        <div className="text-center">
                                            <MessageCircle className="w-12 h-12 mx-auto mb-3 opacity-50" />
                                            <p>No messages yet</p>
                                            <p className="text-sm">Say hello! 👋</p>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3">
                                        {messages.map((msg, idx) => {
                                            const isMe = msg.sender_id === user?.id;
                                            const showTime = idx === 0 ||
                                                new Date(msg.created_at).getTime() - new Date(messages[idx - 1].created_at).getTime() > 300000;

                                            return (
                                                <div key={msg.id}>
                                                    {showTime && (
                                                        <p className="text-center text-xs text-gray-400 dark:text-zinc-600 my-4">
                                                            {formatMessageTime(msg.created_at)}
                                                        </p>
                                                    )}
                                                    <div className={cn("flex", isMe ? "justify-end" : "justify-start")}>
                                                        <div className={cn(
                                                            "max-w-[70%] px-4 py-2 rounded-2xl",
                                                            isMe
                                                                ? "bg-blue-600 text-white rounded-br-md"
                                                                : "bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-bl-md"
                                                        )}>
                                                            <p className="text-sm whitespace-pre-wrap break-words">
                                                                {msg.content}
                                                            </p>
                                                            {isMe && (
                                                                <div className="flex justify-end mt-1">
                                                                    {msg.read ? (
                                                                        <CheckCheck className="w-4 h-4 text-blue-200" />
                                                                    ) : (msg.id || msg._id)?.toString().startsWith('temp-') ? (
                                                                        <Check className="w-4 h-4 text-blue-300/50" />
                                                                    ) : (
                                                                        <Check className="w-4 h-4 text-blue-200" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                        <div ref={messagesEndRef} />
                                    </div>
                                )}
                            </ScrollArea>

                            {/* Message Input */}
                            <div className="p-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900">
                                <form
                                    onSubmit={(e) => {
                                        e.preventDefault();
                                        sendMessage();
                                    }}
                                    className="flex items-center gap-2"
                                >
                                    <Input
                                        placeholder="Type a message..."
                                        value={newMessage}
                                        onChange={handleTyping}
                                        className="flex-1 bg-gray-100 dark:bg-zinc-800 border-transparent dark:border-zinc-700 text-gray-900 dark:text-white placeholder:text-gray-500 dark:placeholder:text-zinc-500 focus-visible:ring-zinc-400 dark:focus-visible:ring-zinc-700"
                                        disabled={sending}
                                    />
                                    <Button
                                        type="submit"
                                        size="icon"
                                        disabled={!newMessage.trim() || sending}
                                        className="bg-blue-600 hover:bg-blue-700"
                                    >
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </form>
                            </div>
                        </>
                    ) : (
                        <div className="flex-1 flex items-center justify-center text-zinc-500">
                            <div className="text-center">
                                <MessageCircle className="w-16 h-16 mx-auto mb-4 opacity-50" />
                                <h2 className="text-xl font-semibold text-white mb-2">Your Messages</h2>
                                <p>Select a conversation to start chatting</p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </TapxLayout>
    );
};

export default Messages;
