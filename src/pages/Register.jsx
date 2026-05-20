import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { showToast } from '../components/Toast';
import '../styles/Auth.css';

const Register = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.name || !formData.email || !formData.password || !formData.confirmPassword) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showToast('Passwords do not match', 'error');
      return;
    }

    if (formData.password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    setLoading(true);
    try {
      await register(formData.name, formData.email, formData.password);
      showToast('Registration successful!', 'success');
      navigate('/dashboard');
    } catch (error) {
      showToast(error.response?.data?.message || 'Registration failed', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <header className="auth-topbar">
        <div className="auth-topbar-inner">
          <div className="logo-block">
            <div className="logo-icon">D</div>
            <span>Resume AI</span>
          </div>

          <nav className="top-nav">
            <a href="#features">Features</a>
            <a href="#pricing">Pricing</a>
            <a href="#about">About Us</a>
          </nav>

          <div className="top-actions">
            <Link to="/login" className="btn-ghost">Log In</Link>
            <Link to="/register" className="btn-solid">Get Started</Link>
          </div>
        </div>
      </header>

      <main className="auth-main">
        <section className="auth-hero">
          <div className="hero-badge">AI-Powered Analysis v2.0</div>
          <h1>
            Optimize Your Career with <span>Intelligent Analysis</span>
          </h1>
          <p>
            Unlock your potential with our advanced resume comparison, job matching, and instant
            improvement tips. Beat the ATS and land more interviews.
          </p>

          <div className="feature-grid">
            <article className="feature-card">
              <h3>Resume Comparison</h3>
              <p>Benchmarking against millions of successful profiles.</p>
            </article>
            <article className="feature-card">
              <h3>Job Matching</h3>
              <p>Match skills directly to job descriptions in real-time.</p>
            </article>
            <article className="feature-card">
              <h3>AI Chat Assistant</h3>
              <p>Instant feedback from our 24/7 AI career coach.</p>
            </article>
            <article className="feature-card">
              <h3>Smart Tips</h3>
              <p>Actionable advice to improve formatting and content.</p>
            </article>
          </div>
        </section>

        <section className="auth-form-wrap">
          <div className="auth-card">
            <div className="auth-header">
              <h2>Create Account</h2>
              <p>Start improving your resume with AI</p>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
              <div className="form-group">
                <label htmlFor="name">Full Name</label>
                <input
                  id="name"
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>

              <div className="form-group">
                <label htmlFor="email">Email Address</label>
                <input
                  id="email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="john.doe@example.com"
                />
              </div>

              <div className="form-group">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="At least 6 characters"
                />
              </div>

              <div className="form-group">
                <label htmlFor="confirmPassword">Confirm Password</label>
                <input
                  id="confirmPassword"
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Retype your password"
                />
              </div>

              <button type="submit" className="btn-primary" disabled={loading}>
                {loading ? 'Creating Account...' : 'Get Started'}
              </button>
            </form>

            <p className="auth-switch">
              Already have an account? <Link to="/login">Log in</Link>
            </p>
          </div>
        </section>
      </main>

      <section className="trust-strip">
        <p>TRUSTED BY PROFESSIONALS FROM</p>
        <div className="trust-logos">
          <span />
          <span />
          <span />
          <span />
          <span />
        </div>
      </section>

      <footer className="auth-bottom">
        <div className="logo-block">
          <div className="logo-icon">D</div>
          <span>Resume AI</span>
        </div>
        <div className="footer-links">
          <a href="#privacy">Privacy Policy</a>
          <a href="#terms">Terms of Service</a>
          <a href="#contact">Contact Support</a>
        </div>
        <span className="copyright">(c) 2023 Resume AI Inc. All rights reserved.</span>
      </footer>
    </div>
  );
};

export default Register;
