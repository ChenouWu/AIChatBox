import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { GoogleLogin } from "@react-oauth/google";
import { useAuthStore } from "../store/useAuthStore";
import { toast } from "react-hot-toast";

export default function Login() {
  const navigate = useNavigate();
  const { handleCredentialsLogin, handleGoogleLogin, loading, error } = useAuthStore();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await toast.promise(
        handleCredentialsLogin({ email, password }),
        {
          loading: "Signing in...",
          success: "Welcome back!",
          error: "Sign in failed",
        }
      );
      navigate("/");
    } catch (e) {
      // 细化错误信息（可选）
      if (e?.message) toast.error(e.message);
    }
  };

  const onGoogle = async (resp) => {
    try {
      await toast.promise(
        handleGoogleLogin({ credential: resp.credential }),
        {
          loading: "Connecting Google...",
          success: "Signed in with Google",
          error: "Google sign-in failed",
        }
      );
      navigate("/");
    } catch {}
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-950 dark:to-gray-900 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-md border border-white/40 dark:border-gray-800 rounded-2xl shadow-xl">
          {/* Header */}
          <div className="px-6 pt-8 pb-4 text-center">
            <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white shadow-md mb-3">
              <span className="text-lg font-semibold">AI</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Welcome back</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Sign in to continue chatting with your AI assistant
            </p>
          </div>

         
          {error && (
            <div className="px-6">
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 px-3 py-2 text-sm">
                {error}
              </div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={onSubmit} className="px-6 pb-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Email</label>
              <input
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Password</label>
              <input
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="password"
                placeholder="Your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 text-sm font-medium shadow-md hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </button>

            <p className="text-center text-xs text-gray-600 dark:text-gray-400">
              Don’t have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/signup")}
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline-offset-2 hover:underline"
              >
                Sign up
              </button>
            </p>
          </form>

          {/* Google 登录 */}
          <div className="px-6 pb-6">
            <div className="relative my-4">
              <div className="h-px bg-gray-200 dark:bg-gray-800" />
              <span className="absolute inset-0 -top-3 mx-auto w-fit bg-white dark:bg-gray-900 px-2 text-xs text-gray-500 dark:text-gray-400">
                or
              </span>
            </div>
            <div className="flex justify-center">
              <GoogleLogin onSuccess={onGoogle} onError={() => toast.error("Google sign-in failed")} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
