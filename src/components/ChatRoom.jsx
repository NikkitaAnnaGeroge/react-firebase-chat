import React, { useState, useEffect, useRef } from "react";
import { db } from "../firebase";
import { collection, onSnapshot, addDoc, query, orderBy, where, serverTimestamp } from "firebase/firestore";

export default function ChatRoom({ activeRoom, user, setShowSidebarOnMobile }) {
  const [messages, setMessages] = useState([]);
  const [newMsg, setNewMsg] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  // Sync messages from Firestore for the active room
  useEffect(() => {
    if (!activeRoom) return;

    setLoading(true);
    const q = query(
      collection(db, "messages"),
      where("roomId", "==", activeRoom.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const messagesData = [];
      snapshot.forEach((doc) => {
        messagesData.push({ id: doc.id, ...doc.data() });
      });
      
      // Sort locally by creation time to avoid Firestore index requirement
      messagesData.sort((a, b) => {
        const timeA = a.createdAt?.toMillis?.() || Date.now() + 5000;
        const timeB = b.createdAt?.toMillis?.() || Date.now() + 5000;
        return timeA - timeB;
      });

      setMessages(messagesData);
      setLoading(false);
    }, (err) => {
      console.error("Error loading messages:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [activeRoom]);

  // Scroll to bottom ref whenever messages change
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!newMsg.trim() || !activeRoom) return;

    const messageText = newMsg;
    setNewMsg(""); // Clear input immediately for better responsiveness

    try {
      await addDoc(collection(db, "messages"), {
        text: messageText.trim(),
        createdAt: serverTimestamp(),
        uid: user.uid,
        displayName: user.displayName || "Anonymous",
        roomId: activeRoom.id
      });
    } catch (err) {
      console.error("Error sending message:", err);
      // Put message back in input if sending failed
      setNewMsg(messageText);
    }
  };

  // Format message time
  const formatTime = (firebaseTimestamp) => {
    if (!firebaseTimestamp) return "sending...";
    const date = firebaseTimestamp.toDate();
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  if (!activeRoom) {
    return (
      <main className="chat-main">
        <div className="welcome-room-state">
          <svg viewBox="0 0 24 24" width="48" height="48" stroke="currentColor" stroke-width="1.5" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h4>Welcome to VoyageChat</h4>
          <p>Please select a chat room from the sidebar, or create a new room topic to start talking.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="chat-main">
      {/* Chat Header */}
      <header className="chat-header">
        <div className="chat-actions">
          {/* Mobile Back Button */}
          <button className="btn-icon btn-back-sidebar" onClick={() => setShowSidebarOnMobile(true)} title="Show Rooms">
            <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
          </button>
          <div className="room-info">
            <h3># {activeRoom.name}</h3>
            <span>{loading ? "loading..." : `${messages.length} messages`}</span>
          </div>
        </div>
      </header>

      {/* Messages Feed */}
      <div className="chat-messages">
        {messages.length === 0 && !loading && (
          <div className="welcome-room-state" style={{ margin: "auto" }}>
            <svg viewBox="0 0 24 24" width="36" height="36" stroke="currentColor" stroke-width="1.5" fill="none">
              <line x1="12" y1="5" x2="12" y2="19"></line>
              <line x1="5" y1="12" x2="19" y2="12"></line>
            </svg>
            <h4>This is the start of # {activeRoom.name}</h4>
            <p>Type a message below to kick off the conversation!</p>
          </div>
        )}

        {messages.map((msg) => {
          const isSent = msg.uid === user.uid;
          return (
            <div key={msg.id} className={`message-wrapper ${isSent ? "sent" : "received"}`}>
              <div className="message-meta">
                {!isSent && <span className="message-sender">{msg.displayName}</span>}
                <span className="message-time">{formatTime(msg.createdAt)}</span>
              </div>
              <div className="message-bubble">
                {msg.text}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>

      {/* Message Input Area */}
      <div className="chat-input-bar">
        <form onSubmit={handleSendMessage} className="chat-input-form">
          <input
            type="text"
            placeholder={`Message #${activeRoom.name}...`}
            value={newMsg}
            onChange={(e) => setNewMsg(e.target.value)}
            maxLength={500}
          />
          <button type="submit" disabled={!newMsg.trim()} title="Send Message">
            <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2.5" fill="none">
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </form>
      </div>
    </main>
  );
}
