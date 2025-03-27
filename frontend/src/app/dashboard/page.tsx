"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import axios from "axios";

export default function Dashboard() {
  const [user, setUser] = useState(null);
  const router = useRouter();

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) { // Local auth (JWT)
      axios.get("http://localhost:5000/api/auth/user", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(res => setUser(res.data))
        .catch(() => router.push("/auth/signin"));
    } else { // Google auth (sessions)
      axios.get("http://localhost:5000/api/auth/user", { withCredentials: true })
        .then(res => setUser(res.data))
        .catch(() => router.push("/auth/signin"));
    }
  }, []);

  const handleLogout = async () => {
    const token = localStorage.getItem('token');
    if (token) { // Local auth (JWT)
      localStorage.removeItem('token');
      router.push("/auth/signin");
    } else { // Google auth (sessions)
      await axios.post("http://localhost:5000/api/auth/logout", {}, { withCredentials: true });
      router.push("/auth/signin");
    }
  };

  if (!user) return <p>Loading...</p>;
  return (
    <div>
      <h1>Welcome, {user.displayName || user.username}</h1>
      <p>Email: {user.email}</p>
      {user.photo && <img src={user.photo} alt="Profile" />}
      <button onClick={handleLogout} className="btn">Logout</button>
    </div>
  );
}