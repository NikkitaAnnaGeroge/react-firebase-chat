import React, { useState } from "react";
import { auth, googleProvider, signInWithPopup, signInAnonymously } from "../firebase";
import { updateProfile } from "firebase/auth";

export default function Login({ setLoading }) {
  const [guestName, setGuestName] = useState("");
  const [error, setError] = useState("");

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError("");
      await signInWithPopup(auth, googleProvider);
    } catch (err) {
      console.error(err);
      setError("Google Login failed: " + err.message);
      setLoading(false);
    }
  };

  const handleGuestLogin = async (e) => {
    e.preventDefault();
    if (!guestName.trim()) {
      setError("Please enter a username.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      // Sign in anonymously via Firebase Auth
      const userCredential = await signInAnonymously(auth);
      // Set the display name to their custom guest name
      await updateProfile(userCredential.user, {
        displayName: guestName.trim()
      });
      // Force reload auth state if necessary, but onAuthStateChanged will handle it
    } catch (err) {
      console.error(err);
      setError("Guest Login failed: " + err.message);
      setLoading(false);
    }
  };

  return (
    <div className="login-screen glass-card">
      <div className="login-icon">
        <svg viewBox="0 0 24 24" width="40" height="40" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
        </svg>
      </div>
      <h1>VoyageChat</h1>
      <p>Connect instantly with people across the globe. Join an existing chat room or create your own topic.</p>

      {error && <div style={{ color: "#f43f5e", fontSize: "0.8rem", width: "100%" }}>{error}</div>}

      <button className="btn-primary btn-google" onClick={handleGoogleLogin}>
        <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
          <path d="M12.24 10.285V13.4h6.887C18.2 15.614 15.645 18 12.24 18c-3.86 0-7-3.14-7-7s3.14-7 7-7c1.7 0 3.25.61 4.47 1.617L19.1 3.2C17.21 1.43 14.85.5 12.24.5.5.5 0 6.64 0 11s5.5 10.5 12.24 10.5c6.38 0 11.26-4.5 11.26-10.5 0-.7-.08-1.215-.224-1.715H12.24z"></path>
        </svg>
        <span>Sign in with Google</span>
      </button>

      <div className="login-divider">or join as guest</div>

      <form onSubmit={handleGuestLogin} className="guest-form">
        <input
          type="text"
          className="guest-input"
          placeholder="Enter your nickname..."
          value={guestName}
          onChange={(e) => setGuestName(e.target.value)}
          maxLength={15}
        />
        <button type="submit" className="btn-primary btn-accent">
          <span>Enter Chatroom</span>
        </button>
      </form>
    </div>
  );
}
