"use client";

import { useState, useEffect, useRef } from "react";
import { Send, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { supabase } from "@/lib/supabase";

interface Conversation {
  id: string;
  otherParticipant: {
    id: string;
    name: string;
    image: string | null;
    role: string;
  };
  messages: Array<{
    id: string;
    content: string;
    senderId: string;
    createdAt: Date;
    sender: {
      id: string;
      name: string;
    };
  }>;
  unreadCount: number;
}

export default function MessagesPage() {
  const router = useRouter();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] = useState<
    string | null
  >(null);
  const [messages, setMessages] = useState<any[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [currentUserId, setCurrentUserId] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadConversations();
    getCurrentUser();
  }, []);

  useEffect(() => {
    if (selectedConversation) {
      loadMessages(selectedConversation);
      subscribeToMessages(selectedConversation);
    }
  }, [selectedConversation]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const getCurrentUser = async () => {
    try {
      const response = await fetch("/api/auth/session");
      const session = await response.json();
      if (session?.user?.id) {
        setCurrentUserId(session.user.id);
      }
    } catch (error) {
      console.error("Failed to get current user:", error);
    }
  };

  const loadConversations = async () => {
    try {
      const response = await fetch("/api/messages/conversations");
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error("Failed to load conversations:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadMessages = async (conversationId: string) => {
    try {
      const response = await fetch(`/api/messages/conversations`);
      if (response.ok) {
        const allConversations = await response.json();
        const conversation = allConversations.find(
          (c: Conversation) => c.id === conversationId
        );
        if (conversation) {
          setMessages(conversation.messages);
        }
      }
    } catch (error) {
      console.error("Failed to load messages:", error);
    }
  };

  const subscribeToMessages = (conversationId: string) => {
    const channel = supabase
      .channel(`conversation:${conversationId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "Message",
          filter: `conversationId=eq.${conversationId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new]);
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedConversation) return;

    const conversation = conversations.find(
      (c) => c.id === selectedConversation
    );
    if (!conversation) return;

    const messageContent = newMessage;
    setNewMessage("");

    try {
      const response = await fetch("/api/messages/send", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          conversationId: selectedConversation,
          recipientId: conversation.otherParticipant.id,
          content: messageContent,
        }),
      });

      if (response.ok) {
        const sentMessage = await response.json();
        setMessages((prev) => [...prev, sentMessage]);
        loadConversations();
      } else {
        toast.error("Failed to send message");
        setNewMessage(messageContent);
      }
    } catch (error) {
      toast.error("Failed to send message");
      setNewMessage(messageContent);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const selectedConv = conversations.find((c) => c.id === selectedConversation);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-500">Loading conversations...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Back Button */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => router.back()}
            className="lg:hidden flex items-center gap-2 text-gray-600 hover:text-gray-900">
            <ArrowLeft className="w-5 h-5" />
            <span>Back</span>
          </button>
          <h1 className="text-3xl font-bold text-gray-900">Messages</h1>
        </div>
      </div>

      <div
        className="bg-white rounded-xl border border-gray-200 overflow-hidden"
        style={{ height: "calc(100vh - 220px)" }}>
        <div className="flex h-full">
          {/* Conversations List */}
          <aside
            className={`${
              selectedConversation ? "hidden md:block" : "block"
            } w-full md:w-80 border-r border-gray-200 overflow-y-auto`}>
            {conversations.length === 0 ? (
              <div className="p-8 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              <div className="divide-y divide-gray-100">
                {conversations.map((conv) => (
                  <button
                    key={conv.id}
                    onClick={() => setSelectedConversation(conv.id)}
                    className={`w-full p-4 flex items-start gap-3 hover:bg-gray-50 transition ${
                      selectedConversation === conv.id ? "bg-purple-50" : ""
                    }`}>
                    <div className="w-12 h-12 rounded-full bg-purple-100 flex-shrink-0 overflow-hidden">
                      {conv.otherParticipant.image ? (
                        <img
                          src={conv.otherParticipant.image}
                          alt=""
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-purple-600 font-semibold">
                          {conv.otherParticipant.name[0]}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 text-left overflow-hidden">
                      <div className="flex items-center justify-between mb-1">
                        <h3 className="font-semibold text-gray-900 truncate">
                          {conv.otherParticipant.name}
                        </h3>
                        {conv.unreadCount > 0 && (
                          <span className="bg-purple-600 text-white text-xs px-2 py-0.5 rounded-full">
                            {conv.unreadCount}
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 truncate">
                        {conv.messages[0]?.content || "No messages yet"}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </aside>

          {/* Chat Window */}
          <main
            className={`${
              selectedConversation ? "flex" : "hidden md:flex"
            } flex-1 flex-col`}>
            {selectedConv ? (
              <>
                {/* Chat Header */}
                <div className="border-b border-gray-200 p-4 flex items-center gap-3">
                  <button
                    onClick={() => setSelectedConversation(null)}
                    className="md:hidden">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div className="w-10 h-10 rounded-full bg-purple-100 overflow-hidden">
                    {selectedConv.otherParticipant.image ? (
                      <img
                        src={selectedConv.otherParticipant.image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-purple-600 font-semibold">
                        {selectedConv.otherParticipant.name[0]}
                      </div>
                    )}
                  </div>
                  <div>
                    <h2 className="font-semibold text-gray-900">
                      {selectedConv.otherParticipant.name}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {selectedConv.otherParticipant.role}
                    </p>
                  </div>
                </div>

                {/* Messages */}
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                  {messages.map((message) => {
                    const isOwn =
                      message.senderId !== selectedConv.otherParticipant.id;
                    return (
                      <div
                        key={message.id}
                        className={`flex ${
                          isOwn ? "justify-end" : "justify-start"
                        }`}>
                        <div
                          className={`max-w-sm px-4 py-2 rounded-lg ${
                            isOwn
                              ? "bg-purple-600 text-white"
                              : "bg-gray-100 text-gray-900"
                          }`}>
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isOwn ? "text-purple-200" : "text-gray-500"
                            }`}>
                            {new Date(message.createdAt).toLocaleTimeString(
                              [],
                              {
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>

                {/* Message Input */}
                <form
                  onSubmit={sendMessage}
                  className="border-t border-gray-200 p-4">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={newMessage}
                      onChange={(e) => setNewMessage(e.target.value)}
                      placeholder="Type your message..."
                      className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none"
                    />
                    <button
                      type="submit"
                      disabled={!newMessage.trim()}
                      className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed">
                      <Send className="w-5 h-5" />
                    </button>
                  </div>
                </form>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-gray-500">
                Select a conversation to start messaging
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
