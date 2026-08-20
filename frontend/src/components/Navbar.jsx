import React, { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import { logout } from "../slices/authSlice";

function Navbar() {
  const user = useSelector((state) => state.auth.user);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    dispatch(logout());
    navigate("/login");
    setMenuOpen(false);
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <>
      <div className="w-full px-6 py-3 flex justify-between items-center
        bg-white/10 backdrop-blur-xl border-b border-white/20 shadow-md relative z-50">

        <Link className="text-xl font-bold text-white tracking-wide" to="/lobby" onClick={closeMenu}>
          ♟️ Chess Arena
        </Link>

        {/* Desktop nav */}
        <div className="hidden sm:flex items-center gap-4">
          {user ? (
            <>
              <Link className="bg-white/20 px-3 py-1 rounded-full text-white text-sm" to="/profile">
                👤 {user.name}
              </Link>
              <Link to="/leaderboard">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-1.5 rounded-lg shadow cursor-pointer">
                  🏆 Leaderboard
                </button>
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-1.5 rounded-lg shadow cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="text-white hover:underline">Login</Link>
              <Link to="/signup" className="text-white hover:underline">Signup</Link>
            </>
          )}
        </div>

        {/* Mobile hamburger button */}
        <button
          className="sm:hidden flex flex-col justify-center items-center gap-[5px] w-8 h-8 cursor-pointer"
          onClick={() => setMenuOpen((prev) => !prev)}
          aria-label="Toggle menu"
        >
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "rotate-45 translate-y-[7px]" : ""}`}></span>
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "opacity-0" : ""}`}></span>
          <span className={`block h-0.5 w-6 bg-white transition-all duration-300 ${menuOpen ? "-rotate-45 -translate-y-[7px]" : ""}`}></span>
        </button>
      </div>

      {/* Mobile dropdown menu */}
      {menuOpen && (
        <div className="sm:hidden relative z-40 bg-black/80 backdrop-blur-xl border-b border-white/20 px-6 py-4 flex flex-col gap-3">
          {user ? (
            <>
              <Link
                to="/profile"
                onClick={closeMenu}
                className="bg-white/20 px-4 py-2 rounded-lg text-white text-sm text-center"
              >
                👤 {user.name}
              </Link>
              <Link
                to="/leaderboard"
                onClick={closeMenu}
                className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg text-center"
              >
                🏆 Leaderboard
              </Link>
              <button
                onClick={handleLogout}
                className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg cursor-pointer"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" onClick={closeMenu} className="text-white hover:underline text-center py-1">Login</Link>
              <Link to="/signup" onClick={closeMenu} className="text-white hover:underline text-center py-1">Signup</Link>
            </>
          )}
        </div>
      )}

      <div>
        <Outlet />
      </div>
    </>
  );
}

export default Navbar;
