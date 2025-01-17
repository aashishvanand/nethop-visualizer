'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { IPinfoWrapper, LruCache } from "node-ipinfo";
import styles from './page.module.css';
import './globals.css';

const Map = dynamic(() => import('../components/map'), { ssr: false });

const sampleData = ` 1  10.0.0.1 (10.0.0.1)  17.131 ms  3.744 ms  2.689 ms
 2  bb116-14-127-252.singnet.com.sg (116.14.127.252)  8.934 ms  4.121 ms  3.549 ms
 3  165.21.193.22 (165.21.193.22)  13.077 ms  6.029 ms *
 4  165.21.193.21 (165.21.193.21)  8.855 ms  6.973 ms  4.336 ms
 5  165.21.138.245 (165.21.138.245)  4.254 ms  4.304 ms *
 6  sn-sinqt1-bo403-ae1.singnet.com.sg (165.21.138.85)  5.400 ms  4.966 ms  4.483 ms
 7  ip-202-147-32-136.asianetcom.net (202.147.32.136)  73.802 ms  8.191 ms  150.393 ms
 8  unknown.telstraglobal.net (210.57.38.115)  4.804 ms  6.726 ms
    unknown.telstraglobal.net (210.57.38.113)  8.040 ms
 9  103.198.140.206 (103.198.140.206)  38.231 ms
    103.198.140.246 (103.198.140.246)  40.702 ms
    103.198.140.208 (103.198.140.208)  39.791 ms
10  49.44.220.8 (49.44.220.8)  39.721 ms
    103.198.140.183 (103.198.140.183)  37.895 ms
    103.198.140.185 (103.198.140.185)  41.101 ms
11  * *115.242.133.202 (115.242.133.202)  41.328 ms
12  115.242.133.202 (115.242.133.202)  39.785 ms 
13  * 115.242.133.202 (115.242.133.202)  40.218 ms *`;

export default function Home() {
  const [tracerouteOutput, setTracerouteOutput] = useState('');
  const [coords, setCoords] = useState([]);
  const [hostname, setHostname] = useState('');
  const [os, setOs] = useState('Linux');
  const isBrowser = () => typeof window !== 'undefined';

const [isDarkMode, setIsDarkMode] = useState(() => {
  if (isBrowser()) {
    const savedTheme = localStorage.getItem('theme');
    return savedTheme ? savedTheme === 'dark' : window.matchMedia('(prefers-color-scheme: dark)').matches;
  }
  return false; // Default value if not running in browser
});
  const turnstileRef = useRef(null);
  const cacheOptions = {
    max: 5000,
    ttl: 24 * 1000 * 60 * 60,
  };
  const cache = new LruCache(cacheOptions);
  const ipinfo = new IPinfoWrapper("306556f9be88bf", cache);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
  
    const detectOS = () => {
      const platform = navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();
      if (platform.includes('win') || userAgent.includes('win')) return 'Windows';
      if (platform.includes('mac') || userAgent.includes('mac')) return 'Mac';
      if (platform.includes('linux') || userAgent.includes('linux')) return 'Linux';
      return 'Linux';
    };
  
    setOs(detectOS());
  
    const renderTurnstile = () => {
      if (turnstileRef.current) {
        window.turnstile.remove(turnstileRef.current);
      }
      turnstileRef.current = window.turnstile.render('#turnstile-container', {
        sitekey: process.env.NEXT_PUBLIC_CLOUDFLARE_TURNSTILE_SITE_KEY,
        theme: isDarkMode ? 'dark' : 'light'
      });
    };

    if (!window.turnstile) {
      const script = document.createElement('script');
      script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
      script.async = true;
      script.defer = true;
      document.body.appendChild(script);
      script.onload = renderTurnstile;
    } else {
      renderTurnstile();
    }
  
    return () => {
      if (turnstileRef.current) {
        window.turnstile.remove(turnstileRef.current);
      }
    };
  }, [isDarkMode]);
  
  useEffect(() => {
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);
  
  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleMapRoute = async () => {
    if (!window.turnstile) {
      toast.error('CAPTCHA is not initialized. Please refresh the page.', { theme: isDarkMode ? 'dark' : 'light' });
      return;
    }
  
    const token = window.turnstile.getResponse(turnstileRef.current);
    if (!token) {
      toast.warn('Please complete the CAPTCHA challenge.', { theme: isDarkMode ? 'dark' : 'light' });
      return;
    }
  
    try {
      const verificationResponse = await fetch('https://nethopvisualizerbackend.aashishvanand.me/verify', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ token })
      });

      if (!verificationResponse.ok) {
        throw new Error(`HTTP error! status: ${verificationResponse.status}`);
      }

      const verificationResult = await verificationResponse.json();
      if (!verificationResult.verified) {
        toast.error('CAPTCHA verification failed. Please try again.', { theme: isDarkMode ? 'dark' : 'light' });
        window.turnstile.reset('#turnstile-container');
        return;
      }
      const hopRegex = /^\s*(\d+)(?:\s+(?:\*|(\S+)\s+\((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\))\s+.*)?$/gm;
      const hops = [...tracerouteOutput.matchAll(hopRegex)];
  
      const isPrivateIP = (ip) => {
        if (!ip) return true;
        const parts = ip.split('.').map(Number);
        return (
          (parts[0] === 10) ||
          (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
          (parts[0] === 192 && parts[1] === 168) ||
          (parts[0] === 127) ||
          (parts[0] === 0) ||
          (parts[0] === 169 && parts[1] === 254) ||
          (parts[0] === 100 && parts[1] >= 64 && parts[1] <= 127)
        );
      };
    
      if (hops.length > 0) {
        const publicIPs = hops
          .map(match => match[3])
          .filter(ip => ip && !isPrivateIP(ip));
    
        if (publicIPs.length === 0) {
          toast.warn('No public IP addresses found in the traceroute output.', { theme: isDarkMode ? 'dark' : 'light' });
          return;
        }
    
        try {
          const batchResponse = await ipinfo.getBatch(publicIPs);
    
          let lastValidLocation = null;
          const locations = hops.map((hop) => {
            const hopNumber = parseInt(hop[1]);
            const ip = hop[3];
            if (ip && batchResponse[ip]) {
              const info = batchResponse[ip];
              lastValidLocation = {
                hop: hopNumber,
                ip: ip,
                loc: info.loc.split(',').map(Number),
                city: info.city,
                region: info.region,
                country: info.country
              };
              return lastValidLocation;
            } else {
              return {
                hop: hopNumber,
                ip: ip || '*',
                loc: lastValidLocation ? lastValidLocation.loc : [0, 0],
                city: lastValidLocation ? lastValidLocation.city : 'Unknown',
                region: lastValidLocation ? lastValidLocation.region : 'Unknown',
                country: lastValidLocation ? lastValidLocation.country : 'Unknown'
              };
            }
          }).filter(location => location.loc[0] !== 0 || location.loc[1] !== 0);
    
          setCoords(locations);
          toast.success('Route mapped successfully!', { theme: isDarkMode ? 'dark' : 'light' });
        } catch (error) {
          console.error('Error fetching IP locations:', error);
          if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
            toast.error(
              'The request to fetch IP information was blocked. This might be caused by an ad-blocker or privacy extension. Please disable it for this site and try again.',
              { theme: isDarkMode ? 'dark' : 'light' }
            );
          } else {
            toast.error('Error fetching IP locations. Please try again later.', { theme: isDarkMode ? 'dark' : 'light' });
          }
        }
      } else {
        toast.warn('No valid hops found in the traceroute output.', { theme: isDarkMode ? 'dark' : 'light' });
      }

    } catch (error) {
      console.error('Error:', error);
      if (error.message.includes('ERR_BLOCKED_BY_CLIENT')) {
        toast.error(
          'The request was blocked. This might be caused by an ad-blocker or privacy extension. Please disable it for this site and try again.',
          { theme: isDarkMode ? 'dark' : 'light' }
        );
      } else {
        toast.error(`An error occurred: ${error.message}. Please try again.`, { theme: isDarkMode ? 'dark' : 'light' });
      }
    } finally {
      window.turnstile.reset('#turnstile-container');
    }
  };

  const getCommand = () => {
    if (hostname.trim() === '') {
      toast.error('Please enter a domain or IP.', { theme: isDarkMode ? 'dark' : 'light' });
      return '';
    }

    if (os === 'Linux') {
      return `traceroute -I ${hostname} | xclip -sel clip`;
    } else if (os === 'Mac') {
      return `traceroute -I ${hostname} | pbcopy`;
    } else if (os === 'Windows') {
      return `tracert ${hostname} | clip`;
    }
    return '';
  };

  const handleCopyCommand = () => {
    const command = getCommand();
    if (command) {
      navigator.clipboard.writeText(command);
      toast.success('Command copied to clipboard!', { theme: isDarkMode ? 'dark' : 'light' });
    }
  };

  const handleSampleData = () => {
    setTracerouteOutput(sampleData);
    toast.info('Sample data loaded!', { theme: isDarkMode ? 'dark' : 'light' });
  };

  return (
    <div className={`${styles.container} ${isDarkMode ? 'dark-mode' : ''}`}>
      <div className={styles.header}>
        <h1 className={styles.title}>NetHop Visualizer</h1>
        <button onClick={toggleTheme} className={styles.themeSwitch} aria-label="Toggle theme">
          {isDarkMode ? <MdOutlineLightMode size={24} /> : <MdOutlineDarkMode size={24} />}
        </button>
      </div>
      <div className={styles.step}>
        <h2 className={styles.stepTitle}>Step 1: Generate the Command</h2>
        <div className={styles.commandSection}>
          <input
            type="text"
            value={hostname}
            onChange={(e) => setHostname(e.target.value)}
            placeholder="Enter domain or IP"
            className={styles.hostnameInput}
          />
          <select
            value={os}
            onChange={(e) => setOs(e.target.value)}
            className={styles.osDropdown}
          >
            <option value="Linux">Linux</option>
            <option value="Mac">Mac</option>
            <option value="Windows">Windows</option>
          </select>
          <button onClick={handleCopyCommand} className={styles.copyButton}>Copy Command</button>
        </div>
      </div>
      <div className={styles.step}>
        <h2 className={styles.stepTitle}>Step 2: Run it in Your Terminal</h2>
        <p className={styles.paragraph}>Run the copied command in your terminal and copy the output.</p>
      </div>
      <div className={styles.step}>
        <h2 className={styles.stepTitle}>Step 3: Paste the Output Here</h2>
        <textarea
          value={tracerouteOutput}
          onChange={(e) => setTracerouteOutput(e.target.value)}
          placeholder="Paste traceroute output here..."
          className={styles.textarea}
        ></textarea>
        <div className={styles.buttonGroup}>
        <div id="turnstile-container" style={{ marginBottom: '20px' }}></div>
          <button onClick={handleMapRoute} className={styles.mapRouteButton}>Map Route</button>
          <button onClick={handleSampleData} className={styles.sampleDataButton}>Load Sample Data</button>
        </div>
      </div>
      {coords.length > 0 && <Map coords={coords} isDarkMode={isDarkMode} />}
      <ToastContainer />
    </div>
  );
}