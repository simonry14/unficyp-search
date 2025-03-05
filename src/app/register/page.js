'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { hashPassword } from '../../../lib/password-utils';
import Link from 'next/link';
import styles from './register.module.css';


export default function Register() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Hash the password
    const { salt, hash } = hashPassword(password);
  
    try {
      // Use API route for registration
      const response = await fetch('/api/database', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'register',
          username, 
          password: hash, 
          salt 
        })
      });
  
      const result = await response.json();
      
      if (result.success) {
        // Redirect to login
        router.push('/login');
      } else {
        setError(result.message);
      }
    } catch (error) {
      console.error('Registration error:', error);
      setError('An error occurred during registration');
    }
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
        <h2>Register</h2>
        <p>Register to access UNFICYP Search</p>
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

            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className={styles.formInput}
            disabled={isLoading}
            required
          />


        </div>

        

        <div className={styles.formGroup}>
          <label htmlFor="password">Confirm Password</label>
          <input
          type="password"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          placeholder="Confirm Password"
          className={styles.formInput}
          disabled={isLoading}
          required
        />


        </div>
        <div className={styles.formOptions}>
            <div></div>
        <Link href="/login" className={styles.forgotPassword}>
                  Already have an account? Login
                </Link>
        </div>

      
        
        
        <button
          type="submit"
          className={styles.loginButton}
          disabled={isLoading}
        >
          {isLoading ? 'Registering...' : 'Register'}
        </button>
      </form>
      
   
      <div className={styles.securityNotice}>
      <p>For assistance, please contact <b>servicedesk@un.org</b></p>
        <p>This is a United Nations computer system. Unauthorized access is prohibited.</p>
      </div>
    </div>
    
    <div className={styles.loginInfo}>

      
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