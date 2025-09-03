import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";
import { GoogleLogin } from "@react-oauth/google";

export default function SignUp() {
  const navigate = useNavigate();
  const { handleRegister, loading, error,handleGoogleLogin} = useAuthStore();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  
  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      await handleRegister({ email, password, name });
      navigate("/login");
    } catch {}
  };
  
  const onGoogle = async (resp) => {
    try {
      await handleGoogleLogin({ credential: resp.credential });
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
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Create your account</h1>
            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Start chatting with your AI assistant in seconds.
            </p>
          </div>

        
          {error && (
            <div className="px-6">
              <div className="mb-3 rounded-lg border border-red-200 bg-red-50 text-red-700 dark:border-red-900/40 dark:bg-red-950/40 dark:text-red-300 px-3 py-2 text-sm">
                {error}
              </div>
            </div>
          )}

          
          <form onSubmit={onSubmit} className="px-6 pb-6 space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Name</label>
              <input
                className="w-full rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                type="text"
                placeholder="Your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoComplete="name"
              />
            </div>

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
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="new-password"
                minLength={6}
              />
            </div>

            <button
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 text-sm font-medium shadow-md hover:from-blue-700 hover:to-purple-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span className="inline-block h-4 w-4 border-2 border-white/80 border-t-transparent rounded-full animate-spin" />
                  Creating...
                </>
              ) : (
                "Create account"
              )}
            </button>

            <p className="text-center text-xs text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="font-medium text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 underline-offset-2 hover:underline"
              >
                Log in
              </button>
            </p>
            <div className="my-4 text-center text-gray-500">or</div>
            <div className="flex justify-center mb-6">
              <GoogleLogin onSuccess={onGoogle} onError={() => {}} />
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

