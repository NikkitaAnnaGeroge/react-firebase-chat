import React, { useState, useEffect } from "react";
import { db, auth, signOut } from "../firebase";
import { collection, onSnapshot, addDoc, query, orderBy, serverTimestamp } from "firebase/firestore";

export default function Sidebar({ activeRoom, setActiveRoom, user, showSidebarOnMobile, setShowSidebarOnMobile }) {
  const [rooms, setRooms] = useState([]);
  const [newRoomName, setNewRoomName] = useState("");
  const [error, setError] = useState("");

  // Sync rooms list from Firestore in real-time
  useEffect(() => {
    const q = query(collection(db, "rooms"), orderBy("name", "asc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const roomsData = [];
      snapshot.forEach((doc) => {
        roomsData.push({ id: doc.id, ...doc.data() });
      });
      setRooms(roomsData);

      // Auto-select first room if none is active
      if (roomsData.length > 0 && !activeRoom) {
        // Find if there's a General room, otherwise select first
        const general = roomsData.find(r => r.name.toLowerCase() === "general");
        setActiveRoom(general || roomsData[0]);
      }
    }, (err) => {
      console.error("Error loading rooms:", err);
      setError("Failed to load rooms.");
    });

    return () => unsubscribe();
  }, [activeRoom, setActiveRoom]);

  const handleCreateRoom = async (e) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      setError("");
      const docRef = await addDoc(collection(db, "rooms"), {
        name: newRoomName.trim(),
        createdAt: serverTimestamp()
      });
      setNewRoomName("");
      // Select the newly created room
      setActiveRoom({ id: docRef.id, name: newRoomName.trim() });
      setShowSidebarOnMobile(false); // Close sidebar on mobile
    } catch (err) {
      console.error("Error creating room:", err);
      setError("Failed to create room: " + err.message);
    }
  };

  const handleLogout = () => {
    signOut(auth).catch((err) => console.error("Sign out error:", err));
  };

  const selectRoom = (room) => {
    setActiveRoom(room);
    setShowSidebarOnMobile(false); // Close sidebar on mobile
  };

  // Get first letter of display name for avatar
  const getInitials = (name) => {
    return name ? name.charAt(0).toUpperCase() : "?";
  };

  return (
    <aside className={`chat-sidebar glass-card ${!showSidebarOnMobile ? "mobile-hidden" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div class="logo-group">
          <svg viewBox="0 0 24 24" width="20" height="20" stroke="currentColor" stroke-width="2.5" fill="none">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
          </svg>
          <h2>Voyage<span>Chat</span></h2>
        </div>
      </div>

      {/* Room Creator Input */}
      <div className="room-creator">
        <form onSubmit={handleCreateRoom} className="room-creator-control">
          <input
            type="text"
            placeholder="New room name..."
            value={newRoomName}
            onChange={(e) => setNewRoomName(e.target.value)}
            maxLength={18}
          />
          <button type="submit">Create</button>
        </form>
        {error && <span style={{ color: "#f43f5e", fontSize: "0.7rem" }}>{error}</span>}
      </div>

      {/* Rooms List */}
      <div className="sidebar-scrollable">
        {rooms.map((room) => (
          <div
            key={room.id}
            className={`room-item ${activeRoom?.id === room.id ? "active" : ""}`}
            onClick={() => selectRoom(room)}
          >
            <span>#</span> {room.name}
          </div>
        ))}
      </div>

      {/* User Footer Profile */}
      <div className="sidebar-footer">
        <div className="user-profile">
          {user.photoURL ? (
            <img src={user.photoURL} alt={user.displayName} className="avatar" />
          ) : (
            <div className="avatar">{getInitials(user.displayName)}</div>
          )}
          <div className="user-details">
            <span className="username">{user.displayName || "Anonymous"}</span>
            <span className="user-status">Online</span>
          </div>
        </div>
        <button className="btn-logout" onClick={handleLogout} title="Sign Out">
          <svg viewBox="0 0 24 24" width="18" height="18" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
            <polyline points="16 17 21 12 16 7"></polyline>
            <line x1="21" y1="12" x2="9" y2="12"></line>
          </svg>
        </button>
      </div>
    </aside>
  );
}
