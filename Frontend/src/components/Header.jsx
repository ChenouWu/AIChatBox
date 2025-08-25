import { useMemo } from "react";
import { useNavigate, NavLink } from "react-router-dom";
import { useAuthStore } from "../store/useAuthStore";

export default function Header() {
  const navigate = useNavigate();
  const { user, loading, logout, error } = useAuthStore();

  const displayName = useMemo(() => {
    if (!user) return "";
    return user.name || user.email || "User";
  }, [user]);

  const handleLogin = () => navigate("/Login"); 
  const handleRegister = () => navigate("/signup"); 

  const handleLogout = async () => {
    try {
      await logout();         
      navigate("/Login");    
    } catch (e) {
     
      console.error(e);
    }
  };

  return (
    <header className="flex items-center justify-between px-6 py-3 border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900">
      {/* Logo */}
      <button
        onClick={() => navigate("/")}
        className="text-2xl font-bold text-gray-800 dark:text-gray-100"
      >
        🤖 AI Chatbox
      </button>

      <div className="flex items-center gap-3">
        {}
        {user?.credits !== undefined && (
          <span className="hidden sm:inline-flex items-center text-xs px-2 py-1 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-200">
            Credits: {user.credits}
          </span>
        )}

       
        {!user && !loading && (
          <>
            <button
              onClick={handleLogin}
              className="text-sm px-3 py-1.5 rounded-md bg-blue-600 text-white hover:bg-blue-700 transition"
            >
              Login
            </button>
            <button
              onClick={handleRegister}
              className="text-sm px-3 py-1.5 rounded-md border border-gray-300 text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-200 dark:hover:bg-gray-800 transition"
            >
              Sign up
            </button>
          </>
        )}

       
        {user && (
          <div className="flex items-center gap-2">
            {user.avatar && (
              <img
                src={user.avatar}
                alt="avatar"
                className="w-8 h-8 rounded-full object-cover"
              />
            )}
            <span className="text-sm text-gray-700 dark:text-gray-200 max-w-[160px] truncate">
              {displayName}
            </span>
            <button
              onClick={handleLogout}
              className="text-sm px-3 py-1.5 rounded-md bg-red-500 text-white hover:bg-red-600 transition"
            >
              Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
