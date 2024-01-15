import './fonts/futura-lt.css';
import './index.scss';

import { ThemeProvider } from '@emotion/react';
import { CssBaseline } from '@mui/material';
import React from 'react';
import ReactDOM from 'react-dom/client';
import theme from './theme';
import Test from './Test';
// import App from './components/App/App';


const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline enableColorScheme />
      <Test />
    </ThemeProvider>
  </React.StrictMode>
);
