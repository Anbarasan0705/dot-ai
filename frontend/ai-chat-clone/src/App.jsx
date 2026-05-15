import { useEffect, useRef, useState } from "react";
import {
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { auth } from "./firebase";

function App() {
  const [user, setUser] = useState(null);

  const [chats, setChats] = useState(() => {
    const saved = localStorage.getItem("chats");

    return saved
      ? JSON.parse(saved)
      : [
          {
            id: Date.now(),
            title: "New Chat",
            messages: [
              {
                role: "ai",
                text: "Hello! How can I assist you today?",
              },
            ],
          },
        ];
  });

  const [activeChatId, setActiveChatId] = useState(chats[0]?.id);
  const [input, setInput] = useState("");
  const messagesEndRef = useRef(null);

  const activeChat = chats.find((chat) => chat.id === activeChatId);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    localStorage.setItem("chats", JSON.stringify(chats));
  }, [chats]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [activeChat?.messages]);

  const loginWithGoogle = async () => {
    const provider = new GoogleAuthProvider();
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  const updateMessages = (newMessage) => {
    setChats((prevChats) =>
      prevChats.map((chat) =>
        chat.id === activeChatId
          ? {
              ...chat,
              title:
                chat.title === "New Chat" && newMessage.role === "user"
                  ? newMessage.text.slice(0, 25)
                  : chat.title,
              messages: [...chat.messages, newMessage],
            }
          : chat
      )
    );
  };

  const replaceLastMessage = (newText) => {
    setChats((prevChats) =>
      prevChats.map((chat) => {
        if (chat.id !== activeChatId) return chat;

        const updatedMessages = [...chat.messages];

        if (updatedMessages.length === 0) return chat;

        updatedMessages[updatedMessages.length - 1] = {
          role: "ai",
          text: newText,
        };

        return {
          ...chat,
          messages: updatedMessages,
        };
      })
    );
  };

  const typeAIMessage = (fullText = "") => {
    let index = 0;

    const interval = setInterval(() => {
      index++;
      replaceLastMessage(fullText.slice(0, index));

      if (index >= fullText.length) {
        clearInterval(interval);
      }
    }, 20);
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userText = input;
    setInput("");

    updateMessages({
      role: "user",
      text: userText,
    });

    updateMessages({
      role: "ai",
      text: "Thinking...",
    });

    try {
      const res = await fetch("http://localhost:5001/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: userText,
        }),
      });

      const data = await res.json();

      replaceLastMessage("");
      typeAIMessage(data.reply || "No response received.");
    } catch (error) {
      console.log(error);
      replaceLastMessage("Backend error. Please check server.");
    }
  };

  const createNewChat = () => {
    const newChat = {
      id: Date.now(),
      title: "New Chat",
      messages: [
        {
          role: "ai",
          text: "New chat started. How can I help?",
        },
      ],
    };

    setChats((prevChats) => [newChat, ...prevChats]);
    setActiveChatId(newChat.id);
  };

  const deleteChat = (id) => {
    setChats((prevChats) => {
      const filteredChats = prevChats.filter((chat) => chat.id !== id);

      if (filteredChats.length === 0) {
        const newChat = {
          id: Date.now(),
          title: "New Chat",
          messages: [
            {
              role: "ai",
              text: "New chat started. How can I help?",
            },
          ],
        };

        setActiveChatId(newChat.id);
        return [newChat];
      }

      if (id === activeChatId) {
        setActiveChatId(filteredChats[0].id);
      }

      return filteredChats;
    });
  };

  const copyMessage = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied!");
    } catch (error) {
      alert("Copy failed.");
    }
  };

  const exportChat = () => {
    if (!activeChat) return;

    const chatText = activeChat.messages
      .map((msg) => {
        const sender = msg.role === "user" ? "You" : "AI";
        return `${sender}: ${msg.text}`;
      })
      .join("\n\n");

    const blob = new Blob([chatText], {
      type: "text/plain",
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");

    a.href = url;
    a.download = `${activeChat.title || "chat"}.txt`;
    a.click();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="h-screen flex bg-black text-white">
      <aside className="w-72 bg-[#111] border-r border-gray-800 p-4 hidden md:block">
        <h1 className="text-2xl font-bold mb-4">AI Chat</h1>

        {!user ? (
          <button
            onClick={loginWithGoogle}
            className="w-full bg-white text-black rounded-xl py-3 mb-4 font-semibold"
          >
            Login with Google
          </button>
        ) : (
          <div className="mb-4">
            <p className="text-sm mb-2 truncate">{user.displayName}</p>
            <button
              onClick={logout}
              className="w-full bg-red-600 rounded-xl py-2 font-semibold"
            >
              Logout
            </button>
          </div>
        )}

        <div className="space-y-3 mb-4">
          <button
            onClick={createNewChat}
            className="w-full bg-blue-600 rounded-xl py-3 font-semibold"
          >
            + New Chat
          </button>

          <button
            onClick={exportChat}
            className="w-full bg-green-600 rounded-xl py-3 font-semibold"
          >
            Export Chat
          </button>
        </div>

        <div className="space-y-2">
          {chats.map((chat) => (
            <div
              key={chat.id}
              onClick={() => setActiveChatId(chat.id)}
              className={`p-3 rounded-xl cursor-pointer flex justify-between items-center ${
                chat.id === activeChatId
                  ? "bg-blue-600"
                  : "bg-[#1f1f23] hover:bg-[#2a2a2e]"
              }`}
            >
              <span className="truncate text-sm">{chat.title}</span>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  deleteChat(chat.id);
                }}
                className="text-red-300 ml-2"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      </aside>

      <main className="flex-1 flex flex-col">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-xl font-bold">
            {activeChat?.title || "New Chat"}
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-5">
          {activeChat?.messages.map((msg, index) => (
            <div
              key={index}
              className={`flex ${
                msg.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              <div
                className={`relative group max-w-[70%] px-5 py-3 pr-16 rounded-2xl ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-[#2a2a2e] text-white"
                }`}
              >
                <p className="whitespace-pre-wrap break-words">{msg.text}</p>

                <button
                  onClick={() => copyMessage(msg.text)}
                  className="absolute top-2 right-2 text-xs bg-gray-700 hover:bg-gray-600 text-white px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition duration-200"
                >
                  Copy
                </button>
              </div>
            </div>
          ))}

          <div ref={messagesEndRef}></div>
        </div>

        <div className="p-4 border-t border-gray-800 flex gap-3">
          <input
            className="flex-1 bg-[#1f1f23] rounded-xl px-4 py-3 outline-none"
            placeholder="Ask anything..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          />

          <button
            onClick={sendMessage}
            className="bg-white text-black px-6 rounded-xl font-bold"
          >
            Send
          </button>
        </div>
      </main>
    </div>
  );
}

export default App;