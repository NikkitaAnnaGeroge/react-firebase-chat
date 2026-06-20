import React, { useState, useEffect } from "react";
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import Login from "./components/Login";
import Sidebar from "./components/Sidebar";
import ChatRoom from "./components/ChatRoom";

export default function App() {
  const [user, setUser] = useState(null);
  const [activeRoom, setActiveRoom] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

  useEffect(() => {
    // Listen to Firebase auth state changes
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
      if (currentUser) {
        setShowSidebarOnMobile(true); // Default to show rooms list on login
      }
    });

    return () => unsubscribe();
  }, []);

  if (loading) {
    return (
      <div className="chat-app-container">
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "1rem" }}>
          <svg
            viewBox="0 0 24 24"
            width="40"
            height="40"
            stroke="#818cf8"
            stroke-width="2.5"
            fill="none"
            style={{ animation: "spin 1.2s infinite linear" }}
          >
            <circle cx="12" cy="12" r="10" stroke-dasharray="40 10"></circle>
          </svg>
          <span style={{ fontSize: "0.85rem", color: "#9ca3af", fontWeight: 500 }}>Connecting to VoyageChat...</span>
        </div>
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes spin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
        `}} />
      </div>
    );
  }

  return (
    <div className="chat-app-container">
      {/* Decorative blurry background circles */}
      <div className="ambient-glow glow-left"></div>
      <div className="ambient-glow glow-right"></div>

      {/* Main App Layout */}
      {!user ? (
        <Login setLoading={setLoading} />
      ) : (
        <div className="chat-app-card glass-card">
          <Sidebar
            activeRoom={activeRoom}
            setActiveRoom={setActiveRoom}
            user={user}
            showSidebarOnMobile={showSidebarOnMobile}
            setShowSidebarOnMobile={setShowSidebarOnMobile}
          />
          <ChatRoom
            activeRoom={activeRoom}
            user={user}
            setShowSidebarOnMobile={setShowSidebarOnMobile}
          />
        </div>
      )}
    </div>
  );
}
