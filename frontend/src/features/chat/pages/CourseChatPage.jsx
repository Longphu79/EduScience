import { useEffect, useRef, useState } from "react";
import { useParams } from "react-router-dom";
import {
  getCourseMessages,
  sendCourseMessage,
} from "../services/chat.service";
import Toast from "../../../shared/components/Toast";
import Button from "../../../shared/components/Button";
import { useAuth } from "../../auth/state/useAuth";

export default function CourseChatPage() {
  const { courseId } = useParams();
  const { user } = useAuth();
  const bottomRef = useRef(null);

  const currentUserId = user?._id || user?.id || user?.userId;

  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [toast, setToast] = useState({ message: "", kind: "success" });

  async function loadMessages() {
    try {
      setLoading(true);
      const data = await getCourseMessages(courseId, currentUserId);
      setMessages(Array.isArray(data) ? data : data?.data || []);
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!currentUserId) return;
    loadMessages();
  }, [courseId, currentUserId]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function handleSendMessage(e) {
    e.preventDefault();

    if (!content.trim()) return;

    try {
      setSending(true);

      const payload = {
        userId: currentUserId,
        message: content.trim(),
      };

      const data = await sendCourseMessage(courseId, payload);
      const newMessage = data?.data || data;

      setMessages((prev) => [...prev, newMessage]);
      setContent("");
    } catch (error) {
      setToast({ message: error.message, kind: "error" });
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="p-6 space-y-6">
      {toast.message ? (
        <Toast
          message={toast.message}
          kind={toast.kind}
          onClose={() => setToast({ message: "", kind: "success" })}
        />
      ) : null}

      <div>
        <h1 className="text-2xl font-bold">Course Chat</h1>
        <p className="text-sm text-gray-500">Discuss with others in this course</p>
      </div>

      <div className="rounded-xl border bg-white overflow-hidden">
        <div className="h-[500px] overflow-y-auto p-4 space-y-3 bg-gray-50">
          {loading ? (
            <div>Loading messages...</div>
          ) : messages.length === 0 ? (
            <div className="text-sm text-gray-500">No messages yet.</div>
          ) : (
            messages.map((message) => {
              const sender = message.senderId || message.userId || {};
              const senderId =
                sender?._id || message.senderId?._id || message.senderId;
              const isMine = String(senderId) === String(currentUserId);

              return (
                <div
                  key={message._id || `${senderId}-${message.createdAt}`}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 ${
                      isMine ? "bg-blue-600 text-white" : "bg-white border"
                    }`}
                  >
                    <div
                      className={`text-xs mb-1 ${
                        isMine ? "text-blue-100" : "text-gray-500"
                      }`}
                    >
                      {sender?.name ||
                        sender?.fullName ||
                        sender?.username ||
                        sender?.email ||
                        "User"}
                    </div>
                    <div className="text-sm whitespace-pre-wrap">
                      {message.message || message.content || ""}
                    </div>
                    <div
                      className={`text-[11px] mt-2 ${
                        isMine ? "text-blue-100" : "text-gray-400"
                      }`}
                    >
                      {message.createdAt
                        ? new Date(message.createdAt).toLocaleString()
                        : ""}
                    </div>
                  </div>
                </div>
              );
            })
          )}
          <div ref={bottomRef} />
        </div>

        <form onSubmit={handleSendMessage} className="border-t p-4 flex gap-3">
          <input
            className="flex-1 border rounded-lg px-3 py-2"
            placeholder="Type your message..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
          />
          <Button type="submit" disabled={sending}>
            {sending ? "Sending..." : "Send"}
          </Button>
        </form>
      </div>
    </div>
  );
}