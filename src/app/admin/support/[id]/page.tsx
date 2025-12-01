"use client";

import { useEffect, useState, useRef, use } from "react";
import Link from "next/link";
import { ArrowLeft, Send, User, ShieldCheck, Smile, Paperclip, X, Image as ImageIcon } from "lucide-react";
import { useSession } from "next-auth/react";
import EmojiPicker from "emoji-picker-react";

interface Message {
  id: string;
  message: string;
  attachments: string[];
  isAdmin: boolean;
  createdAt: string;
  senderId: string;
}

export default function AdminTicketChatPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { data: session } = useSession();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [attachments, setAttachments] = useState<string[]>([]);
  const [sending, setSending] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchMessages();
    const interval = setInterval(fetchMessages, 5000);
    return () => clearInterval(interval);
  }, [id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchMessages = async () => {
    try {
      // We can reuse the same API as it handles permissions (admin is allowed)
      const res = await fetch(`/api/support/tickets/${id}/messages`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Error fetching messages:", error);
    }
  };

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() && attachments.length === 0) return;
    
    setSending(true);
    try {
      const res = await fetch(`/api/support/tickets/${id}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          message: newMessage,
          attachments: attachments 
        }),
      });

      if (res.ok) {
        setNewMessage("");
        setAttachments([]);
        fetchMessages();
      }
    } catch (error) {
      console.error("Error sending message:", error);
    } finally {
      setSending(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const data = await res.json();
        setAttachments([...attachments, data.url]);
      }
    } catch (error) {
      console.error("Error uploading file:", error);
    } finally {
      setUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = "";
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index));
  };

  const onEmojiClick = (emojiObject: any) => {
    setNewMessage((prev) => prev + emojiObject.emoji);
    setShowEmojiPicker(false);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6 bg-white dark:bg-gray-800 p-4 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm">
        <Link
          href="/admin/support"
          className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors text-gray-500"
        >
          <ArrowLeft size={20} />
        </Link>
        <div>
          <h1 className="text-lg font-bold text-gray-900 dark:text-white">Чат с пользователем</h1>
          <p className="text-xs text-gray-500 dark:text-gray-400">ID: {id}</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-sm p-6 space-y-6 mb-4 relative">
        {messages.map((msg) => {
          // In admin view, "Me" is the admin (isAdmin=true)
          const isMe = msg.isAdmin; 
          
          return (
            <div
              key={msg.id}
              className={`flex items-end gap-3 ${isMe ? "flex-row-reverse" : "flex-row"}`}
            >
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                  msg.isAdmin
                    ? "bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400"
                }`}
              >
                {msg.isAdmin ? <ShieldCheck size={16} /> : <User size={16} />}
              </div>
              
              <div
                className={`max-w-[75%] p-4 rounded-2xl text-sm leading-relaxed ${
                  isMe
                    ? "bg-indigo-600 text-white rounded-br-none"
                    : "bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-bl-none"
                }`}
              >
                {msg.attachments && msg.attachments.length > 0 && (
                  <div className="flex flex-wrap gap-2 mb-2">
                    {msg.attachments.map((url, i) => (
                      <a key={i} href={url} target="_blank" rel="noopener noreferrer" className="block relative group">
                        <img 
                          src={url} 
                          alt="Attachment" 
                          className="max-w-[200px] max-h-[200px] rounded-lg object-cover border border-black/10 dark:border-white/10" 
                        />
                      </a>
                    ))}
                  </div>
                )}
                {msg.message && <p className="whitespace-pre-wrap">{msg.message}</p>}
                <p
                  className={`text-[10px] mt-2 text-right ${
                    isMe ? "text-indigo-200" : "text-gray-400"
                  }`}
                >
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          );
        })}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="relative">
        {/* Attachments Preview */}
        {attachments.length > 0 && (
          <div className="absolute bottom-full left-0 mb-2 flex gap-2 p-2 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 shadow-lg z-10">
            {attachments.map((url, i) => (
              <div key={i} className="relative w-16 h-16 group">
                <img src={url} alt="Preview" className="w-full h-full object-cover rounded-lg" />
                <button
                  onClick={() => removeAttachment(i)}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-0.5 shadow-md opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <X size={12} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* Emoji Picker */}
        {showEmojiPicker && (
          <div className="absolute bottom-full left-0 mb-2 z-20">
            <EmojiPicker onEmojiClick={onEmojiClick} theme={ undefined } />
          </div>
        )}

        <form onSubmit={sendMessage} className="relative flex items-center gap-2">
          <div className="relative flex-1">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Ответить пользователю..."
              className="w-full pl-12 pr-12 py-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent shadow-sm transition-all"
            />
            
            {/* Emoji Button */}
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="absolute left-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
            >
              <Smile size={20} />
            </button>

            {/* File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={uploading}
              className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors disabled:opacity-50"
            >
              {uploading ? (
                <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
              ) : (
                <Paperclip size={20} />
              )}
            </button>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              className="hidden"
              accept="image/*"
            />
          </div>

          <button
            type="submit"
            disabled={sending || (!newMessage.trim() && attachments.length === 0)}
            className="p-4 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:hover:bg-indigo-600 shadow-lg shadow-indigo-500/30"
          >
            <Send size={20} />
          </button>
        </form>
      </div>
    </div>
  );
}
