'use client'

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import styles from './login.module.css';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Basic validation
    if (!username || !password) {
      setError('Please enter both username and password');
      return;
    }
    
    setIsLoading(true);
    setError('');
    
    try {
      // This would be replaced with your actual authentication API call
      const response = await mockAuthenticationRequest(username, password);
      
      if (response.success) {
        // Store authentication token or session info
        if (rememberMe) {
          localStorage.setItem('unficyp_user', JSON.stringify({
            username: username,
            token: response.token
          }));
        } else {
          sessionStorage.setItem('unficyp_user', JSON.stringify({
            username: username,
            token: response.token
          }));
        }
        
        // Redirect to home page or dashboard
        router.push('/');
      } else {
        setError(response.message || 'Authentication failed');
      }
    } catch (error) {
      setError('An error occurred during login. Please try again.');
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mock function to simulate authentication API
  const mockAuthenticationRequest = async (username, password) => {
    // Simulate network request
    return new Promise((resolve) => {
      setTimeout(() => {
        // In production, this would be a real API call
        if (username === 'demo' && password === 'password') {
          resolve({
            success: true,
            token: 'sample-auth-token-12345',
            message: 'Login successful'
          });
        } else {
          resolve({
            success: false,
            message: 'Invalid username or password'
          });
        }
      }, 1000); // Simulate 1s network delay
    });
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Global Navigation Bar */}
      <nav className={styles.globalNav}>
        <div className={styles.navContainer}>
          <div className={styles.navLeft}>
            <Link href="https://www.un.org" className={styles.navLink}>
              United Nations
            </Link>
            <span className={styles.navDivider}>|</span>
            <Link href="https://peacekeeping.un.org" className={styles.navLink}>
              UN Peacekeeping
            </Link>
          </div>
          <div className={styles.navRight}>
            <div className={styles.languageSelector}>
              <select className={styles.langSelect} defaultValue="en">
                <option value="en">English</option>
                <option value="fr">Français</option>
                <option value="es">Español</option>
                <option value="ar">العربية</option>
                <option value="ru">Русский</option>
                <option value="zh">中文</option>
                <option value="el">Ελληνικά</option>
                <option value="tr">Türkçe</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Header with Logo */}
      <header className={styles.header}>
  <div className={styles.headerWrapper}>
    <div className={styles.logoContainer}>
      <img 
        src="/un-logo.png" 
        alt="United Nations Logo" 
        className={styles.logo} 
      />
      <div className={styles.titleContainer}>
        <h1 className={styles.mainTitle}>UNFICYP</h1>
        <div className={styles.divider}></div>
        <div className={styles.searchTitle}>
          <h2>UNFICYP Search</h2>
          <p>Enterprise Search Engine of the United Nations Peacekeeping Force in Cyprus</p>
        </div>
      </div>
    </div>
  </div>
</header>

      <main className={styles.main}>
        <div className={styles.loginContainer}>
          <div className={styles.loginCard}>
            <div className={styles.loginHeader}>
              <h2>Login</h2>
              <p>Access UNFICYP Search</p>
            </div>
            
            {error && <div className={styles.errorMessage}>{error}</div>}
            
            <form onSubmit={handleSubmit} className={styles.loginForm}>
              <div className={styles.formGroup}>
                <label htmlFor="username">Username</label>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter your username"
                  className={styles.formInput}
                  disabled={isLoading}
                />
              </div>
              
              <div className={styles.formGroup}>
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className={styles.formInput}
                  disabled={isLoading}
                />
              </div>
              
              <div className={styles.formOptions}>
                <div className={styles.checkboxGroup}>
                  <input
                    id="rememberMe"
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className={styles.checkbox}
                    disabled={isLoading}
                  />
                  <label htmlFor="rememberMe">Remember me</label>
                </div>
                
                <Link href="/forgot-password" className={styles.forgotPassword}>
                  Forgot password?
                </Link>
              </div>
              
              <button
                type="submit"
                className={styles.loginButton}
                disabled={isLoading}
              >
                {isLoading ? 'Logging in...' : 'Login'}
              </button>
            </form>
            
         
            <div className={styles.securityNotice}>
            <p>For assistance, please contact <b>servicedesk@un.org</b></p>
              <p>This is a United Nations computer system. Unauthorized access is prohibited.</p>
            </div>
          </div>
          
          <div className={styles.loginInfo}>
            <div className={styles.infoCard}>
              <h3>New User?</h3>
              <p>If you don't have an account and require access to UNFICYP Search, please contact your department administrator or IT support.</p>
              <Link href="/contact" className={styles.infoLink}>
                Contact Information
              </Link>
            </div>
            
            <div className={styles.infoCard}>
              <h3>Security Notice</h3>
              <p>Please ensure you're accessing this site from a secure connection. Never share your login credentials with others.</p>
              <Link href="/security-policy" className={styles.infoLink}>
                Security Policy
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className={styles.footer}>
        <div className={styles.footerBottom}>
          <p>© {new Date().getFullYear()} United Nations. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}