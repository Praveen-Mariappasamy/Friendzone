import { useContext, useEffect, useRef, useState } from "react";
import axios from "axios";
import { MyContext } from "../context/MyContext";
import { API_BASE } from "../constants/api";
import { HiSparkles, HiChatBubbleLeftRight } from "react-icons/hi2";
import { AiOutlineSend } from "react-icons/ai";

const Chatbot = () => {
  const { loggedUser, chatContext } = useContext(MyContext);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const messagesEndRef = useRef(null);

  const isSupportMode =
    chatContext?.mode === "support" && chatContext?.postText;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    if (isSupportMode) {
      setMessages([
        {
          role: "assistant",
          content: `Hi ${loggedUser?.username || "there"}. I noticed your recent post might reflect a difficult moment. I'm here to listen — how are you feeling right now?`,
        },
      ]);
    } else {
      setMessages([
        {
          role: "assistant",
          content: `Hey ${loggedUser?.username || "friend"}! I'm your FriendZone buddy. What's on your mind today?`,
        },
      ]);
    }
    setError("");
  }, [isSupportMode, loggedUser?.username, chatContext?.postText]);

  const sendMessage = async (e) => {
    e.preventDefault();
    const text = input.trim();
    if (!text || loading) return;

    const nextMessages = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);
    setInput("");
    setLoading(true);
    setError("");

    try {
      const { data } = await axios.post(
        `${API_BASE}/chat/message`,
        {
          messages: nextMessages,
          context: {
            mode: chatContext?.mode || "social",
            postText: chatContext?.postText,
            username: loggedUser?.username,
          },
        },
        { withCredentials: true }
      );

      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.reply },
      ]);
    } catch (err) {
      setError(
        err.response?.data?.error ||
          "Could not reach the assistant. Check that GEMINI_API_KEY is set in backend/.env"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative z-0 flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
      <div className="max-w-2xl mx-auto h-[calc(100vh-7rem)] flex flex-col card overflow-hidden">
        <header className="px-5 py-4 border-b border-white/5 bg-main-shade/80 backdrop-blur">
          <div className="flex items-center gap-3">
            <div
              className={`p-2.5 rounded-xl ${
                isSupportMode
                  ? "bg-indigo-500/20 text-indigo-300"
                  : "bg-primary-shade/20 text-primary-shade"
              }`}
            >
              {isSupportMode ? (
                <HiSparkles className="w-6 h-6" />
              ) : (
                <HiChatBubbleLeftRight className="w-6 h-6" />
              )}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">
                FriendZone Assistant
              </h2>
              <p className="text-xs text-gray-400">
                {isSupportMode
                  ? "Support mode — powered by Gemini"
                  : "Friendly chat — powered by Gemini"}
              </p>
            </div>
          </div>
        </header>

        {isSupportMode && (
          <div className="px-5 py-3 text-sm bg-indigo-950/40 border-b border-indigo-500/20 text-indigo-200">
            <span className="font-medium text-indigo-300">Context: </span>
            &ldquo;{chatContext.postText}&rdquo;
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
          {messages.map((msg, index) => (
            <div
              key={`${msg.role}-${index}`}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary-shade text-white rounded-br-md"
                    : "bg-seconday-shade text-gray-100 rounded-bl-md border border-white/5"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="px-4 py-3 rounded-2xl rounded-bl-md bg-seconday-shade border border-white/5 text-sm text-gray-400">
                <span className="inline-flex gap-1">
                  <span className="animate-bounce">.</span>
                  <span className="animate-bounce [animation-delay:0.1s]">.</span>
                  <span className="animate-bounce [animation-delay:0.2s]">.</span>
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {error && (
          <p className="px-4 py-2 text-sm text-red-400 bg-red-950/30 border-t border-red-500/20">
            {error}
          </p>
        )}

        <form
          onSubmit={sendMessage}
          className="p-4 border-t border-white/5 bg-main-shade/80 flex gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type a message..."
            disabled={loading}
            className="input-field flex-1 py-2.5"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="p-3 rounded-xl bg-primary-shade text-white hover:bg-sky-400 transition disabled:opacity-40"
          >
            <AiOutlineSend className="w-5 h-5" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default Chatbot;
