'use client'

import { useState } from 'react';
import styles from './page.module.css';
import { usePathname } from 'next/navigation';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function Home() {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [resultStats, setResultStats] = useState(null);
  const pathname = usePathname(); 
  const router = useRouter(); // Correct way in App Router

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsLoading(true);
    
    try {
      // Using the API route
      const response = await fetch(`/api/search?query=${encodeURIComponent(searchQuery)}`);
      const data = await response.json();
      
      setSearchResults(data.results || []);
      setResultStats({
        total: data.totalResults || 0,
        time: data.searchTime || 0,
        query: searchQuery
      });
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
    // Optional: You may want to clear results too when the user clears the search
    // setSearchResults([]);
  };

  const startAIChat = () => {
    // Navigate to chat page with query parameter if there's a search query
    if (searchQuery.trim()) {
      router.push(`/chat?initialMessage=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/chat');
    }
  };

  return (
    <div className={styles.pageWrapper}>
      {/* Global Navigation Header */}
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
            <Link href="/login" className={styles.navLink}>
              Login
            </Link>
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
        <div className={styles.searchContainer}>
          <div className={styles.searchBox}>
          { // <button className={styles.categoryButton}>
             // All
              //<span className={styles.arrow}>›</span>
            //</button> 
            }
            <div className={styles.inputWrapper}>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search"
                className={styles.searchInput}
              />
              {searchQuery && (
                <button 
                  onClick={clearSearch} 
                  className={styles.clearButton}
                  aria-label="Clear search"
                >
                  ×
                </button>
              )}
            </div>

            {searchResults.length > 0 && ( <button className={styles.helpButton} onClick={startAIChat} >AI</button>  )}
            <button className={styles.helpButton}>?</button>
          </div>

          {!searchResults.length && !isLoading && (
            <div className={styles.welcomeMessage}>
              <p>Welcome to the Enterprise Search engine for the United Nations Peacekeeping Force in Cyprus (UNFICYP). 
                 
              </p>
              <div className={styles.buttonContainer}>
                <button onClick={handleSearch} className={styles.actionButton}>Search</button>
                <button onClick={startAIChat} className={styles.actionButton}>AI Chat</button>
                <button className={styles.actionButton}>Help</button>
              </div>
            </div>
          )}

          {isLoading && <div className={styles.loading}>Loading...</div>}

          {searchResults.length > 0 && (
            <div className={styles.resultsContainer}>
              <div className={styles.resultStats}>
                Results 1 - {Math.min(10, searchResults.length)} of {resultStats.total} for {resultStats.query}. 
                Search took {resultStats.time} seconds
              </div>
              
              <div className={styles.resultControls}>
                <div className={styles.sortControl}>
                  <span>Sort By: Relevance</span>
                  <span className={styles.dropdown}>▼</span>
                </div>
                <div className={styles.paginationControl}>
                  <span>Items Per Page: 10</span>
                  <span className={styles.dropdown}>▼</span>
                </div>
              </div>

              <ul className={styles.resultsList}>
                {searchResults.map((result, index) => (
                  <li key={index} className={styles.resultItem}>
                    <div className={styles.documentIcon}>📄</div>
                    <div className={styles.resultContent}>
                      <h3 className={styles.resultTitle}>
                        <a href={result.url}>{result.title}</a>
                      </h3>
                      <p className={styles.resultDescription}>{result.description}</p>
                      <div className={styles.resultMeta}>
                        <p>Data Source: {result.dataSource}</p>
                        <p>URL: <a href={result.url} className={styles.resultUrl}>{result.url}</a></p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
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