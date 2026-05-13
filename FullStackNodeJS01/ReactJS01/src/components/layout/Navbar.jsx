import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { Search, ShoppingCart, User, LogOut, Menu, X, Heart } from 'lucide-react';
import { logout } from '../../store/slices/authSlice';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();
  const dispatch = useDispatch();
  
  // Fix lỗi state bằng optional chaining theo yêu cầu
  const user = useSelector((state) => state?.auth?.user || state?.auth?.account || null);

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const navLinks = [
    { name: 'Home', path: '/' },
    { name: 'Drinks', path: '/search' },
    { name: 'Promotions', path: '/search?sale=true' },
    { name: 'New Arrivals', path: '/search?new=true' },
    { name: 'Best Sellers', path: '/search?best=true' },
    { name: 'About Us', path: '/about' },
  ];

  return (
    <nav className="sticky top-0 z-[100] bg-white border-b border-gray-100 shadow-sm transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 flex-shrink-0">
            <div className="w-10 h-10 bg-orange-500 rounded-xl flex items-center justify-center shadow-lg shadow-orange-200">
              <span className="text-white font-black text-xl">M</span>
            </div>
            <span className="text-xl font-black text-gray-800 tracking-tighter">
              BonnieTea<span className="text-orange-500">.</span>
            </span>
          </Link>

          {/* Desktop Menu */}
          <div className="hidden lg:flex items-center space-x-8">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                to={link.path}
                className="text-[13px] font-bold text-gray-500 hover:text-orange-500 transition-colors uppercase tracking-wider"
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* Search Bar */}
          <div className="hidden md:flex flex-1 max-w-xs mx-8">
            <form onSubmit={handleSearch} className="relative w-full">
              <input
                type="text"
                placeholder="Search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-50 border border-gray-100 rounded-full py-2 pl-10 pr-4 focus:bg-white focus:ring-2 focus:ring-orange-500/20 focus:border-orange-500 outline-none transition-all text-sm"
              />
              <Search className="absolute left-3 top-2.5 h-4 w-4 text-gray-400" />
            </form>
          </div>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            {user ? (
              <div className="flex items-center space-x-3">
                <Link 
                  to="/profile"
                  className="hidden sm:flex items-center space-x-2 pr-3 border-r border-gray-100 group cursor-pointer"
                >
                   <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center group-hover:bg-orange-500 transition-colors">
                     <User className="h-4 w-4 text-orange-600 group-hover:text-white transition-colors" />
                   </div>
                   <div className="flex flex-col">
                     <span className="text-[11px] font-bold text-gray-800 leading-none group-hover:text-orange-500 transition-colors">{user.name || 'Member'}</span>
                     <span className="text-[9px] text-gray-400 uppercase font-black">{user.role || 'Member'}</span>
                   </div>
                </Link>

                <button 
                  onClick={handleLogout}
                  className="p-2 text-gray-400 hover:text-red-500 transition-colors"
                >
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <Link to="/login" className="text-sm font-bold text-gray-700 hover:text-orange-500 transition-colors">
                Login
              </Link>
            )}
            
            <Link to="/cart" className="relative p-2 text-gray-700 hover:text-orange-500 transition-colors">
              <ShoppingCart className="h-6 w-6" />
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-orange-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white">
                0
              </span>
            </Link>

            {/* Mobile Toggle */}
            <button onClick={() => setIsMenuOpen(!isMenuOpen)} className="lg:hidden p-2 text-gray-600">
              {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="lg:hidden bg-white border-t border-gray-50 px-4 py-6 space-y-4 shadow-xl">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              to={link.path}
              onClick={() => setIsMenuOpen(false)}
              className="block text-sm font-bold text-gray-600 hover:text-orange-500"
            >
              {link.name}
            </Link>
          ))}
          <form onSubmit={handleSearch} className="relative w-full pt-4">
            <input
              type="text"
              placeholder="Search..."
              className="w-full bg-gray-50 border border-gray-100 rounded-xl py-3 pl-12 focus:bg-white outline-none"
            />
            <Search className="absolute left-4 top-7 h-5 w-5 text-gray-400" />
          </form>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
