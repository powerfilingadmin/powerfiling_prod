import './index.css'
import ReactDOM from 'react-dom/client';
import { Provider } from 'react-redux';
import { BrowserRouter } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import App from './App';
import store from './redux/store/store';
import { Analytics } from "@vercel/analytics/react"
import CrispChat from './crisp.utils/Crisp';

ReactDOM.createRoot(document.getElementById('root')).render(
  <HelmetProvider>
    <Provider store={store}>
      <BrowserRouter>
        <App />
        <Analytics />
        <CrispChat />
      </BrowserRouter>
    </Provider>
  </HelmetProvider>
);
