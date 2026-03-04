import React, { useContext, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../utils/AuthContext';
import { FiMenu, FiX, FiLogOut } from 'react-icons/fi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useContext(AuthContext);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <nav className="bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          🎨 CraftLens AI
        </Link>

        <div className="hidden md:flex space-x-6 items-center">
          <Link to="/" className="hover:text-gray-200 transition">
            Home
          </Link>
          <Link to="/marketplace" className="hover:text-gray-200 transition">
            Marketplace
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="hover:text-gray-200 transition">
                Dashboard
              </Link>
              <Link to="/products" className="hover:text-gray-200 transition">
                Products
              </Link>
              <Link to="/analytics" className="hover:text-gray-200 transition">
                Analytics
              </Link>
              <Link to="/orders" className="hover:text-gray-200 transition">
                My Orders
              </Link>
              <button
                onClick={handleLogout}
                className="flex items-center gap-2 hover:text-gray-200 transition"
              >
                <FiLogOut /> Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="hover:text-gray-200 transition">
                Login
              </Link>
              <Link
                to="/register"
                className="bg-white text-purple-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100"
              >
                Sign Up
              </Link>
            </>
          )}
        </div>

        <div className="md:hidden">
          <button onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <FiX size={24} /> : <FiMenu size={24} />}
          </button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden bg-purple-700 px-4 py-3 space-y-2">
          <Link to="/" className="block hover:text-gray-200" onClick={() => setMenuOpen(false)}>
            Home
          </Link>
          <Link to="/marketplace" className="block hover:text-gray-200" onClick={() => setMenuOpen(false)}>
            Marketplace
          </Link>
          {isAuthenticated ? (
            <>
              <Link to="/dashboard" className="block hover:text-gray-200" onClick={() => setMenuOpen(false)}>
                Dashboard
              </Link>
              <Link to="/products" className="block hover:text-gray-200" onClick={() => setMenuOpen(false)}>
                Products
              </Link>
              <Link to="/analytics" className="block hover:text-gray-200" onClick={() => setMenuOpen(false)}>
                Analytics
              </Link>
              <Link to="/orders" className="block hover:text-gray-200" onClick={() => setMenuOpen(false)}>
                My Orders
              </Link>
              <button onClick={handleLogout} className="block w-full text-left hover:text-gray-200">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="block hover:text-gray-200" onClick={() => setMenuOpen(false)}>
                Login
              </Link>
              <Link to="/register" className="block hover:text-gray-200" onClick={() => setMenuOpen(false)}>
                Sign Up
              </Link>
            </>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
