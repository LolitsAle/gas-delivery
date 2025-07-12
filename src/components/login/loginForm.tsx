"use client";

import { useState } from "react";

export default function LoginForm() {
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [error, setTextError] = useState("");
  const [token, setToken] = useState("");

  const setError = (message: string) => {
    if (message || message !== "") {
      setTextError(message);
      alert(message)
    } else {
      setTextError("");
    }
  };

  const login = async () => {
    setError("");
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phoneNumber, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || "Login failed");
        return;
      }

      setToken(data.token);
      localStorage.setItem("token", data.token);
      alert("Login successful!");
    } catch (err) {
      console.log(err)
      setError("Something went wrong");
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <input
        type="text"
        placeholder="Phone number"
        value={phoneNumber}
        onChange={(e) => setPhoneNumber(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="p-2 border rounded w-full mb-2"
      />
      <button
        onClick={login}
        className="bg-blue-600 text-white p-2 rounded w-full"
      >
        Login
      </button>
      {error && <p className="text-red-600 mt-2">{error}</p>}
      {token && (
        <p className="text-green-600 mt-2">Token: {token.slice(0, 16)}...</p>
      )}
    </div>
  );
}
