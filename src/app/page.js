'use client';

import { useState, useEffect } from 'react';
import axios from 'axios';
import dynamic from 'next/dynamic';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { MdOutlineLightMode, MdOutlineDarkMode } from 'react-icons/md';
import styles from './page.module.css';
import './globals.css';

const Map = dynamic(() => import('../components/map'), { ssr: false });

export default function Home() {
  const [tracerouteOutput, setTracerouteOutput] = useState('');
  const [coords, setCoords] = useState([]);
  const [hostname, setHostname] = useState('');
  const [os, setOs] = useState('Linux');
  const [isDarkMode, setIsDarkMode] = useState(false);

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
      
      // Additional checks using userAgent
      if (userAgent.includes('win')) return 'Windows';
      if (userAgent.includes('mac')) return 'Mac';
      if (userAgent.includes('linux')) return 'Linux';

      return 'Linux'; // Default to Linux if unable to detect
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
    const ipRegex = /(\d{1,3}\.){3}\d{1,3}/g;
    const ipAddresses = tracerouteOutput.match(ipRegex);

    if (ipAddresses) {
      const batchRequest = ipAddresses.map(ip => `${ip}/loc`);
      
      try {
        const response = await axios.post(
          'https://ipinfo.io/batch?token=306556f9be88bf',
          batchRequest,
          {
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          }
        );

        const locations = Object.values(response.data).map(loc => loc.split(','));
        setCoords(locations);
        toast.success('Route mapped successfully!', { theme: isDarkMode ? 'dark' : 'light' });
      } catch (error) {
        console.error('Error fetching IP locations:', error);
        toast.error('Error fetching IP locations. Please try again later.', { theme: isDarkMode ? 'dark' : 'light' });
      }
    } else {
      toast.warn('No valid IP addresses found in the traceroute output.', { theme: isDarkMode ? 'dark' : 'light' });
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
      {coords.length > 0 && <Map coords={coords} />}
      <ToastContainer />
    </div>
  );
}