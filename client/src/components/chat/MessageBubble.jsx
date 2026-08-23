import React from "react";

function MessageBubble({ message, currentUserId }) {
  const senderId = message?.senderId?._id || message?.senderId;

  const isMine = senderId?.toString() === currentUserId?.toString();

  const formatTime = (date) => {
    if (!date) return "";

    return new Date(date).toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-[75%] rounded-2xl px-4 py-2.5 ${
          isMine
            ? "rounded-br-md bg-blue-600 text-white"
            : "rounded-bl-md bg-gray-100 text-gray-900"
        }`}
      >
        <p className="whitespace-pre-wrap break-words text-sm">
          {message.message}
        </p>

        <div
          className={`mt-1 text-[10px] ${
            isMine ? "text-blue-100" : "text-gray-400"
          }`}
        >
          {formatTime(message.createdAt)}
        </div>
      </div>
    </div>
  );
}

export default MessageBubble;
