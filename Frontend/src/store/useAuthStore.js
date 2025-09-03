// src/store/authStore.js
import { create } from "zustand";
import toast  from 'react-hot-toast'

const API_BASE = import.meta.env.VITE_API_BASE || "https://aichatbox-93ux.onrender.com";

export const useAuthStore = create((set, get) => ({
  user: null,
  loading: false,
  initialized: false,
  error: null,

  // Fetching current user
 fetchMe: async () => {
  try {
    set({ loading: true, error: null });
    const res = await fetch(`${API_BASE}/api/auth/me`, {
      credentials: "include",  
    });
      
    if (res.status === 401) {
        set({ user: null });
        window.location.href = "/Login";
        return;
      }

    if (!res.ok) throw new Error("Not authenticated");
    const data = await res.json();
    set({ user: data || null });
  } catch (e) {
    set({ user: null, error: "Log In First" });
  } finally {
    set({ loading: false, initialized: true });// 
  }
},


  // Email Register
  handleRegister: async ({ email, password, name }) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`${API_BASE}/api/auth/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password, name }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Register failed");
      set({ user: data, error: null });
      return data;
    } catch (e) {
      set({ error: e.message || "Register failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  // Email Sign In
  handleCredentialsLogin: async ({ email, password }) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`${API_BASE}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ email, password }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Login failed");
      set({ user: data, error: null });
      return data;
    } catch (e) {
      set({ error: e.message || "Login failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  // Google Sign In
  handleGoogleLogin: async ({ credential }) => {
    try {
      set({ loading: true, error: null });
      const res = await fetch(`${API_BASE}/api/auth/login/google`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ idToken: credential }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Google login failed");
      set({ user: data, error: null });
      return data;
    } catch (e) {
      set({ error: e.message || "Google login failed" });
      throw e;
    } finally {
      set({ loading: false });
    }
  },

  // Logout
  logout: async () => {
        try {
            await fetch(`${API_BASE}/api/auth/logout`, {
            method: "POST",
            credentials: "include",
            });
            set({ user: null });
        } catch (e) {
            set({ error: "Logout failed" });
        }
},




}));
