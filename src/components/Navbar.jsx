import { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/Navbar.css';

const navItems = [
  { label: 'Dashboard', path: '/dashboard' },
  { label: 'Upload', path: '/upload' },
  { label: 'Analyze', path: '/analyze' },
  { label: 'Compare', path: '/compare' },
  { label: 'AI Coach', path: '/coach' },
];

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    const prefersDark =
      window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    const darkMode = savedTheme ? savedTheme === 'dark' : prefersDark;

    document.documentElement.classList.toggle('dark', darkMode);
    setIsDark(darkMode);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleThemeToggle = () => {
    const nextIsDark = !isDark;
    setIsDark(nextIsDark);
    document.documentElement.classList.toggle('dark', nextIsDark);
    localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
  };

  const initials = (user?.name || 'U')
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();

  return (
    <nav className="app-navbar">
      <div className="app-navbar-inner">
        <button className="app-brand" onClick={() => navigate('/dashboard')}>
          <span className="app-brand-icon">AT</span>
          <span className="app-brand-text">
            Resume<span>AI</span>
          </span>
        </button>

        <div className="app-nav-links">
          {navItems.map((item) => (
            <button
              key={item.path}
              className={location.pathname === item.path ? 'active' : ''}
              onClick={() => navigate(item.path)}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="app-user-bar">
          <div className="app-user-meta">
            <p>{user?.name || 'User'}</p>
            <span>PRO MEMBER</span>
          </div>
          <div className="app-avatar">{initials}</div>
          <button className="app-icon-btn" aria-label="Theme toggle" onClick={handleThemeToggle}>
            {isDark ? 'Light' : 'Dark'}
          </button>
          <button className="app-logout-btn" onClick={handleLogout}>Logout</button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
