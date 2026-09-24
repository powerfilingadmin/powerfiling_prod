import { useEffect } from 'react';

export default function CrispChat() {
  useEffect(() => {
    // 1. Initialize Crisp's global configuration arrays on the window object
    window.$crisp = [];
    window.CRISP_WEBSITE_ID = "a1ed0ab7-8a53-4a4a-9131-cb53ffaa5121";

    const injectScript = () => {
      // Prevent duplicate script elements if the component re-renders
      if (document.getElementById('crisp-client-script')) return;

      const d = document;
      const s = d.createElement("script");
      s.id = "crisp-client-script";
      s.src = "https://client.crisp.chat/l.js";
      s.async = true; // Ensures script downloads concurrently without pausing the DOM
      d.getElementsByTagName("head")[0].appendChild(s);
    };

    // 2. Define the user interaction triggers
    const triggerEvents = ['mousemove', 'scroll', 'touchstart'];

    const handleUserInteraction = () => {
      injectScript();
      // Instantly clean up listeners once triggered so we don't fire multiple times
      triggerEvents.forEach(event => window.removeEventListener(event, handleUserInteraction));
    };

    // 3. Attach the listeners
    triggerEvents.forEach(event => window.addEventListener(event, handleUserInteraction, { once: true }));

    // 4. Fallback Timeout: If a user sits idle for 4 seconds without moving, load it anyway
    const idleFallback = setTimeout(handleUserInteraction, 4000);

    // Cleanup hook lifecycle to avoid memory leaks if component unmounts early
    return () => {
      clearTimeout(idleFallback);
      triggerEvents.forEach(event => window.removeEventListener(event, handleUserInteraction));
    };
  }, []);

  return null; // This is a logic-only component; it renders no visible HTML
}