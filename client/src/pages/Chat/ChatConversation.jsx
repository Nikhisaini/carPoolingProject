import React, { useEffect, useRef, useState } from "react";
import { ArrowLeft, Send } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import api from "@/services/Api";

import MessageBubble from "@/components/chat/MessageBubble";
import socket from "@/services/socket";
import { getImageUrl } from "@/lib/utils";

function ChatConversation({ conversationId: propConversationId, onBack }) {
  const params = useParams();
  const conversationId = propConversationId || params.conversationId;

  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);

  const currentUserId = user?.id || user?._id;

  const [messages, setMessages] = useState([]);

  const [conversation, setConversation] = useState(null);

  const [message, setMessage] = useState("");

  const [loading, setLoading] = useState(true);

  const [sending, setSending] = useState(false);

  const messagesEndRef = useRef(null);

  const loadConversation = async () => {
    try {
      const response = await api.get(`/chat/conversations/${conversationId}`);

      setConversation(
        response.data?.data || response.data?.conversation || null,
      );
    } catch (error) {
      console.error("Load conversation error:", error);
    }
  };

  const loadMessages = async () => {
    try {
      setLoading(true);

      const response = await api.get(`/chat/messages/${conversationId}`, {
        params: {
          page: 1,
          limit: 50,
        },
      });

      const data = response.data?.data || response.data?.messages || [];

      setMessages(data);
    } catch (error) {
      console.error("Load messages error:", error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = () => {
    if (conversationId && socket.connected) {
      socket.emit("chat:read", {
        conversationId,
      });
    }
  };

  useEffect(() => {
    if (!conversationId) {
      return;
    }

    const token = localStorage.getItem("token");
    if (token && !socket.connected) {
      socket.auth = { token };
      socket.connect();
    }

    loadConversation();
    loadMessages();
  }, [conversationId]);

  useEffect(() => {
    if (!conversationId || !socket.connected) {
      return;
    }

    socket.emit("chat:join", conversationId);

    markAsRead();

    return () => {
      socket.emit("chat:leave", conversationId);
    };
  }, [conversationId]);

  useEffect(() => {
    const handleConnect = () => {
      if (conversationId) {
        socket.emit("chat:join", conversationId);
        markAsRead();
      }
    };

    socket.on("connect", handleConnect);

    return () => {
      socket.off("connect", handleConnect);
    };
  }, [conversationId]);

  useEffect(() => {
    const handleMessage = (newMessage) => {
      if (
        newMessage?.conversationId?.toString() !== conversationId?.toString()
      ) {
        return;
      }

      setMessages((previous) => {
        const alreadyExists = previous.some(
          (item) => item._id === newMessage._id,
        );

        if (alreadyExists) {
          return previous;
        }

        return [...previous, newMessage];
      });

      const senderId = newMessage?.senderId?._id || newMessage?.senderId;

      if (senderId?.toString() !== currentUserId?.toString()) {
        markAsRead();
      }
    };

    socket.on("chat:message", handleMessage);

    return () => {
      socket.off("chat:message", handleMessage);
    };
  }, [conversationId, currentUserId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages]);

  const sendMessage = async () => {
    const value = message.trim();

    if (!value || sending) {
      return;
    }

    setSending(true);

    if (socket.connected) {
      socket.emit(
        "chat:send",
        {
          conversationId,
          message: value,
        },
        (response) => {
          setSending(false);

          if (!response?.success) {
            console.error("Send message error:", response?.message);
            return;
          }

          setMessage("");
        },
      );
    } else {
      try {
        const res = await api.post("/chat/message", {
          conversationId,
          message: value,
        });

        if (res.data?.success && res.data?.data) {
          setMessages((prev) => {
            const exists = prev.some((m) => m._id === res.data.data._id);
            if (exists) return prev;
            return [...prev, res.data.data];
          });
        }
        setMessage("");
      } catch (error) {
        console.error("HTTP Send Message Error:", error);
      } finally {
        setSending(false);
      }
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      sendMessage();
    }
  };

  const otherParticipant =
    conversation?.otherParticipant ||
    conversation?.participant ||
    conversation?.user;

  const firstName = otherParticipant?.firstName || "User";

  const lastName = otherParticipant?.lastName || "";

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const profileImageUrl = getImageUrl(otherParticipant?.profileImage);

  return (
    <div className="flex h-full w-full flex-1 flex-col overflow-hidden bg-white">
      <div className="flex h-[72px] shrink-0 items-center justify-between border-b border-gray-200 bg-white px-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack || (() => navigate("/chat"))}
            className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-gray-100 md:hidden"
          >
            <ArrowLeft size={20} className="text-gray-600" />
          </button>

          <div className="relative">
            {profileImageUrl ? (
              <img
                src={profileImageUrl}
                alt={`${firstName} ${lastName}`}
                className="h-10 w-10 rounded-full object-cover ring-2 ring-gray-100"
              />
            ) : (
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-600 text-sm font-semibold text-white">
                {initials}
              </div>
            )}
          </div>

          <div className="min-w-0">
            <h2 className="truncate text-sm font-semibold text-gray-900">
              {firstName} {lastName}
            </h2>

            <p className="text-xs text-emerald-600 font-medium">Online</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-slate-50/60 p-4">
        {loading ? (
          <div className="flex h-full items-center justify-center">
            <p className="text-sm text-gray-400">Loading messages...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex h-full items-center justify-center">
            <div className="text-center">
              <p className="font-medium text-gray-700">No messages yet</p>

              <p className="mt-1 text-sm text-gray-400">
                Send a message to start the conversation.
              </p>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-2xl space-y-3">
            {messages.map((item) => (
              <MessageBubble
                key={item._id}
                message={item}
                currentUserId={currentUserId}
              />
            ))}

            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="shrink-0 border-t border-gray-200 bg-white p-3 sm:px-4">
        <div className="mx-auto flex max-w-2xl items-end gap-2">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type a message..."
            rows={1}
            disabled={sending}
            className="max-h-32 min-h-11 flex-1 resize-none rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
          />

          <button
            type="button"
            onClick={sendMessage}
            disabled={sending || !message.trim()}
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50 shadow-sm"
          >
            <Send size={18} />
          </button>
        </div>

        <p className="mx-auto mt-1 max-w-2xl text-center text-[10px] text-gray-400">
          Press Enter to send, Shift+Enter for new line
        </p>
      </div>
    </div>
  );
}

export default ChatConversation;
