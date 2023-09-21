import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { logout } from './redux/reducers';

import Loader from './components/loader';

const theme = createTheme();

const App = () => {
  const reduxToken = useSelector(state => state.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const redirectClient = () => {
    if(reduxToken) {
      axios.post('http://localhost:8000/api/login/check-token', reduxToken, { timeout: 10000 })
      .then(response => {
        if(response.data.message === 'VALID_LOGIN_BY_TOKEN') {
          navigate('/dashboard');
        } else {
          dispatch(logout({}));
          navigate('/login');
        }
      }).catch(error => {
        dispatch(logout({}));
        navigate('/login');
      });
    } else {
      navigate('/login');
    }
  };

  useEffect(() => {
    redirectClient();
  }, []);

  return (
   <ThemeProvider theme={theme}>
    <Loader/>
   </ThemeProvider>
  );
};

export default App;