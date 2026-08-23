import React, { useEffect, useMemo, useState } from "react";
import { MessageCircle, Search } from "lucide-react";
import { useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";

import api from "@/services/Api";
import ConversationItem from "@/components/chat/ConversationItem";
import ChatConversation from "./ChatConversation";
import socket from "@/services/socket";

function ChatInbox() {
  const { conversationId } = useParams();
  const navigate = useNavigate();

  const { user } = useSelector((state) => state.auth);
  const currentUserId = user?.id || user?._id;

  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadConversations = async () => {
    try {
      setLoading(true);
      const response = await api.get("/chat/conversations");
      const data = response.data?.data || response.data?.conversations || [];
      setConversations(data);
    } catch (error) {
      console.error("Load conversations error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!currentUserId) {
      return;
    }

    const token = localStorage.getItem("token");
    if (token && !socket.connected) {
      socket.auth = { token };
      socket.connect();
    }

    loadConversations();
  }, [currentUserId]);

 
  useEffect(() => {
    const handleNewMessage = (message) => {
      if (!message?.conversationId) {
        return;
      }

      setConversations((previous) => {
        const messageConvId = message.conversationId.toString();
        const index = previous.findIndex(
          (conversation) => conversation._id?.toString() === messageConvId,
        );

        if (index === -1) {
          loadConversations();
          return previous;
        }

        const updated = [...previous];
        const conversation = updated[index];

        const isCurrentActive =
          conversationId && conversationId.toString() === messageConvId;

        updated[index] = {
          ...conversation,
          lastMessage: message,
          lastMessageAt: message.createdAt,
          unreadCount:
            isCurrentActive ||
            message.senderId?._id?.toString() === currentUserId?.toString()
              ? 0
              : (conversation.unreadCount || 0) + 1,
        };

        updated.sort(
          (a, b) =>
            new Date(b.lastMessageAt || 0) - new Date(a.lastMessageAt || 0),
        );

        return updated;
      });
    };

    socket.on("chat:message:new", handleNewMessage);

    return () => {
      socket.off("chat:message:new", handleNewMessage);
    };
  }, [currentUserId, conversationId]);

  const filteredConversations = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) {
      return conversations;
    }

    return conversations.filter((conversation) => {
      const participant =
        conversation?.otherParticipant ||
        conversation?.participant ||
        conversation?.user;

      const name = `${participant?.firstName || ""} ${
        participant?.lastName || ""
      }`.toLowerCase();

      return name.includes(value);
    });
  }, [conversations, search]);

  return (
    <div className="mx-auto flex h-[calc(100vh-72px)] max-w-7xl overflow-hidden border-x border-gray-200 bg-white">
      <div
        className={`w-full flex-col md:w-[360px] lg:w-[380px] md:border-r border-gray-200 bg-white ${
          conversationId ? "hidden md:flex" : "flex"
        }`}
      >
        <div className="border-b border-gray-200 px-5 py-4">
          <div className="flex items-center gap-2">
            <MessageCircle size={22} className="text-blue-600" />
            <h1 className="text-xl font-semibold text-gray-900">Messages</h1>
          </div>

          <div className="relative mt-3">
            <Search
              size={17}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search conversations..."
              className="h-9 w-full rounded-lg border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm outline-none transition focus:border-blue-500 focus:bg-white"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {loading ? (
            <div className="space-y-1 p-3">
              {[1, 2, 3, 4].map((item) => (
                <div key={item} className="flex animate-pulse gap-3 p-3">
                  <div className="h-12 w-12 rounded-full bg-gray-200" />
                  <div className="flex-1">
                    <div className="h-4 w-32 rounded bg-gray-200" />
                    <div className="mt-2 h-3 w-48 rounded bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : filteredConversations.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-50">
                <MessageCircle size={22} className="text-blue-600" />
              </div>
              <h2 className="mt-3 text-sm font-semibold text-gray-900">
                No conversations
              </h2>
              <p className="mt-1 text-xs text-gray-400">
                Your conversations will appear here.
              </p>
            </div>
          ) : (
            filteredConversations.map((conversation) => (
              <ConversationItem
                key={conversation._id}
                conversation={conversation}
                currentUserId={currentUserId}
                active={
                  conversation._id?.toString() === conversationId?.toString()
                }
                onClick={() => navigate(`/chat/${conversation._id}`)}
              />
            ))
          )}
        </div>
      </div>

      <div
        className={`flex-1 flex-col bg-white overflow-hidden ${
          conversationId ? "flex" : "hidden md:flex"
        }`}
      >
        {conversationId ? (
          <ChatConversation
            key={conversationId}
            conversationId={conversationId}
            onBack={() => navigate("/chat")}
          />
        ) : (
          <div className="flex h-full flex-1 items-center justify-center bg-slate-50/50 p-6">
            <div className="text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-50">
                <MessageCircle size={28} className="text-blue-600" />
              </div>

              <h2 className="mt-4 text-base font-semibold text-gray-900">
                Select a conversation
              </h2>

              <p className="mt-1 text-xs text-gray-500">
                Choose a conversation from the left to start chatting.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ChatInbox;
