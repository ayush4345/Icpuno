import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';
import { RecoilRoot, useRecoilValue } from 'recoil';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <RecoilRoot>
      <App />
    </RecoilRoot>
  </React.StrictMode>,
);
