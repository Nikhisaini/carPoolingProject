import React from "react";
import { CheckCheck } from "lucide-react";
import { getImageUrl } from "@/lib/utils";

function ConversationItem({ conversation, currentUserId, active, onClick }) {
  const participant =
    conversation?.otherParticipant ||
    conversation?.participant ||
    conversation?.user;

  const firstName = participant?.firstName || "User";
  const lastName = participant?.lastName || "";

  const initials = `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();

  const profileImageUrl = getImageUrl(participant?.profileImage);
  const lastMessage = conversation?.lastMessage;

  const isOwnMessage =
    lastMessage?.senderId?._id?.toString() === currentUserId?.toString() ||
    lastMessage?.senderId?.toString() === currentUserId?.toString();

  const unreadCount = conversation?.unreadCount || 0;

  const formatTime = (date) => {
    if (!date) return "";

    const messageDate = new Date(date);
    const now = new Date();

    if (messageDate.toDateString() === now.toDateString()) {
      return messageDate.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
    return messageDate.toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex w-full items-center gap-3 border-b border-gray-100 px-4 py-3 text-left transition ${
        active ? "bg-blue-50" : "hover:bg-gray-50"
      }`}
    >
      <div className="relative shrink-0">
        {profileImageUrl ? (
          <img
            src={profileImageUrl}
            alt={`${firstName} ${lastName}`}
            className="h-12 w-12 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-blue-600 font-semibold text-white">
            {initials}
          </div>
        )}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <h3
            className={`truncate text-sm ${
              unreadCount
                ? "font-bold text-gray-900"
                : "font-semibold text-gray-800"
            }`}
          >
            {firstName} {lastName}
          </h3>

          <span className="shrink-0 text-xs text-gray-400">
            {formatTime(conversation?.lastMessageAt)}
          </span>
        </div>

        <div className="mt-1 flex items-center justify-between gap-2">
          <div className="flex min-w-0 items-center gap-1">
            {isOwnMessage && (
              <CheckCheck size={15} className="shrink-0 text-blue-500" />
            )}

            <p
              className={`truncate text-sm ${
                unreadCount ? "font-medium text-gray-900" : "text-gray-500"
              }`}
            >
              {lastMessage?.message || "Start a conversation"}
            </p>
          </div>

          {unreadCount > 0 && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
              {unreadCount > 99 ? "99+" : unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}

export default ConversationItem;
