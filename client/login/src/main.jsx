import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// ensure the base title is set for all pages (overrides Vite dev overlay title)
document.title = 'Letterboxd Clone'

// force-refresh favicon to avoid stale cache while developing
;(function replaceFavicon(){
  try{
    const head = document.getElementsByTagName('head')[0];
    const ts = Date.now();
    // remove any existing favicon/link icons
    const old = head.querySelectorAll('link[rel~="icon"], link[rel="shortcut icon"], link[rel="apple-touch-icon"]');
    old.forEach(n => n.parentNode && n.parentNode.removeChild(n));

    // create new favicon links with cache-busting
  const ico = document.createElement('link');
  ico.rel = 'icon';
  ico.type = 'image/svg+xml';
  ico.href = '/Title.svg?v=' + ts;
  head.appendChild(ico);

  const touch = document.createElement('link');
  touch.rel = 'apple-touch-icon';
  touch.href = '/logo192.png?v=' + ts;
  head.appendChild(touch);
  }catch(e){/* ignore in non-browser env */}
})();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
