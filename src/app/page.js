'use client';

import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import { IPinfoWrapper, LruCache } from "node-ipinfo";
import styles from './page.module.css';
import './globals.css';

const Map = dynamic(() => import('../components/map'), { ssr: false });

export default function Home() {
  const [tracerouteOutput, setTracerouteOutput] = useState('');
  const [coords, setCoords] = useState([]);
  const [hostname, setHostname] = useState('');
  const [os, setOs] = useState('Linux');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const cacheOptions = {
    max: 5000,
    ttl: 24 * 1000 * 60 * 60,
  };
  const cache = new LruCache(cacheOptions);
  const ipinfo = new IPinfoWrapper("306556f9be88bf", cache);

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme) {
      setIsDarkMode(savedTheme === 'dark');
    } else {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      setIsDarkMode(prefersDark);
    }

    const detectOS = () => {
      const platform = navigator.platform.toLowerCase();
      const userAgent = navigator.userAgent.toLowerCase();

      if (platform.includes('win')) return 'Windows';
      if (platform.includes('mac')) return 'Mac';
      if (platform.includes('linux')) return 'Linux';
      
      if (userAgent.includes('win')) return 'Windows';
      if (userAgent.includes('mac')) return 'Mac';
      if (userAgent.includes('linux')) return 'Linux';

      return 'Linux';
    };

    setOs(detectOS());
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark-mode', isDarkMode);
    localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  const handleMapRoute = async () => {
    const hopRegex = /^\s*(\d+)\s+(?:\*|(\S+)\s+\((\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3})\))\s+/gm;
    const hops = [...tracerouteOutput.matchAll(hopRegex)];
  
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
  
        const locations = hops.map((hop, index) => {
          const ip = hop[3];
          if (ip && batchResponse[ip]) {
            const info = batchResponse[ip];
            return {
              hop: parseInt(hop[1]),
              ip: ip,
              loc: info.loc.split(',').map(Number),
              city: info.city,
              region: info.region,
              country: info.country
            };
          } else {
            return {
              hop: parseInt(hop[1]),
              ip: ip || '*',
              loc: [0, 0], // You might want to use the previous valid location or a placeholder
              city: 'Unknown',
              region: 'Unknown',
              country: 'Unknown'
            };
          }
        }).filter(location => location.loc[0] !== 0 || location.loc[1] !== 0);
  
        setCoords(locations);
        toast.success('Route mapped successfully!', { theme: isDarkMode ? 'dark' : 'light' });
      } catch (error) {
        console.error('Error fetching IP locations:', error);
        toast.error('Error fetching IP locations. Please try again later.', { theme: isDarkMode ? 'dark' : 'light' });
      }
    } else {
      toast.warn('No valid hops found in the traceroute output.', { theme: isDarkMode ? 'dark' : 'light' });
    }
  };

  const getCommand = () => {
    if (hostname.trim() === '') {
      toast.error('Please enter a domain or IP.', { theme: isDarkMode ? 'dark' : 'light' });
      return '';
    }

    if (os === 'Linux') {
      return `traceroute -I -q1 ${hostname} | xclip -sel clip`;
    } else if (os === 'Mac') {
      return `traceroute -I -q1 ${hostname} | pbcopy`;
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

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>NetHop Visualizer</h1>
        <button onClick={toggleTheme} className={styles.themeSwitch}>
          {isDarkMode ? <MdOutlineLightMode /> : <MdOutlineDarkMode />}
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
        <button onClick={handleMapRoute} className={styles.mapRouteButton}>Map Route</button>
      </div>
      {coords.length > 0 && <Map coords={coords} isDarkMode={isDarkMode} />}
      <ToastContainer />
    </div>
  );
}