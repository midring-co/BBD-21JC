import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
import FormControlLabel from '@mui/material/FormControlLabel';
import Checkbox from '@mui/material/Checkbox';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import LockOutlinedIcon from '@mui/icons-material/LockOutlined';
import Typography from '@mui/material/Typography';
import { InputAdornment, Alert } from '@mui/material';
import { Person, Lock, Send } from '@mui/icons-material';
import { createTheme, ThemeProvider } from '@mui/material/styles';
import { useDispatch, useSelector } from 'react-redux';
import { loginSuccess, logout } from '../../redux/reducers';

import Loader from '../../components/loader';

function Copyright(props) {
  return (
    <Typography variant="body2" color="text.secondary" align="center" {...props}>
      {'© '}
      <Link color="inherit" href="https://google.com">
        MOPM
      </Link>{' - v1 - '}
      {new Date().getFullYear()}
      {'.'}
    </Typography>
  );
}

const theme = createTheme();

const Login = () => {
  const [isLoadedLayout, setIsLoadedLayout] = useState(false);
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [isRememberMeChecked, setIsRememberMeChecked] = useState(false);
  const [error, setError] = useState(null);
  const [isLogging, setIsLogging] = useState(false);

  const reduxToken = useSelector(state => state.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const handleCheckBoxChange = () => {
    if(!isLogging && reduxToken === 'undefined') {
      setIsRememberMeChecked(!isRememberMeChecked);
    }
  };

  const checkLogin = () => {
    if(reduxToken !== 'undefined' && reduxToken.length > 0) {
      axios.post('http://localhost:8000/api/login/check-token', reduxToken, { timeout: 10000 })
      .then(response => {
        if(response.data.requestResponse) {
          if(response.data.message === 'VALID_LOGIN_BY_TOKEN') {
            navigate('/');
          } else {
            dispatch(logout({}));
            setIsLogging(false);
            setIsLoadedLayout(true);
          }
        } else {
          dispatch(logout({}));
          setIsLogging(false);
          setIsLoadedLayout(true);
        }
      }).catch(error => {
        dispatch(logout({}));
        setIsLogging(false);
        setIsLoadedLayout(true);
      });
    } else {
      setIsLoadedLayout(true);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();

    const credentials = {
      login: login,
      password: password,
      currentToken: reduxToken,
      rememberMe: isRememberMeChecked
    };

    const tryLogin = () => {
      if(isLoadedLayout) {
        setIsLogging(true);
        setError(null);
        axios.post('http://localhost:8000/api/login', credentials, { timeout: 10000 })
        .then(response => {
          if(response.data.requestResponse) {
            if(response.data.token) {
              if(response.data.message && response.data.message === 'VALID_LOGIN') {
                setError(null);
                const newToken = response.data.token;
                dispatch(loginSuccess({ token: newToken }));
                navigate('/');
              }
            } else {
              setError(response.data.message);
              setIsLogging(false);
            }
          } else {
            if(response.data.message && response.data.message === 'LOGIN_TOKEN_ALREADY_EXISTS') {
              checkLogin();
            } else {
              setError(response.data.message);
              setIsLogging(false);
            }
          }
        }).catch(error => {
          setError('Une erreur est survenue.');
          setIsLogging(false);
          console.log(error.response.data);
        });
      }
    }
    
    if(reduxToken === 'undefined') {
      var formLogin = login.trim();
      var formPassword = password.trim();
      if(formLogin.length > 0 && formPassword.length > 0) {
        if(/^[a-zA-Z0-9!@#$%^&*_.\-]+$/.test(formLogin)) {
          if(formPassword.length >= 8 && formPassword.length <= 16) {
            if(formPassword.match(/[!@#$%^&*_\-]/g) && formPassword.match(/[!@#$%^&*_\-]/g).length >= 2 && !(/[^a-zA-Z0-9!@#$%^&*_\-]/.test(formPassword))) {
              if(/[A-Z]/.test(formPassword)) {
                if(!isLogging) {
                  tryLogin();
                } 
              } else {
                setError('Identifiant ou mot de passe incorrect.');
                setIsLogging(false);
              }
            } else {
              setError('Identifiant ou mot de passe incorrect.');
              setIsLogging(false);
            }
          } else {
            setError('Identifiant ou mot de passe incorrect.');
            setIsLogging(false);
          }
        } else {
          setError('Identifiant ou mot de passe incorrect.');
          setIsLogging(false);
        }
      } else {
        setError('Veuillez saisir tous les champs.');
        setIsLogging(false);
      }
    } else {
      checkLogin();
    }
  };

  useEffect(() => {
    checkLogin();
  }, []);

  return (
    <ThemeProvider theme={theme}>
      { isLoadedLayout ? (
      <>
        <Grid container component="main" sx={{ height: '100vh' }}>
          <CssBaseline />
          <Grid
            item
            xs={false}
            sm={4}
            md={7}
            sx={{
              backgroundImage: 'url(http://localhost:3000/assets/images/auth-bg.png)',
              backgroundRepeat: 'no-repeat',
              backgroundColor: (t) =>
                t.palette.mode === 'light' ? t.palette.grey[50] : t.palette.grey[900],
              backgroundSize: 'cover',
              backgroundPosition: 'center',
            }}
          />
          <Grid item xs={12} sm={8} md={5} component={Paper} elevation={6} square>
            <Box
              sx={{
                my: 8,
                mx: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <Avatar sx={{ m: 1, bgcolor: 'secondary.main' }}>
                <LockOutlinedIcon />
              </Avatar>
              <Typography component="h1" variant="h5">
                Bienvenue sur MOPM !
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                {error ?
                (  
                  <Alert severity="error">
                  <strong>{error}</strong>
                  </Alert>
                ) : <div></div> }
                <TextField InputProps={{
                  endAdornment: (
                      <InputAdornment position="start">
                          <Person />
                      </InputAdornment>
                  )
                  }}
                  margin="normal"
                  required
                  fullWidth
                  id="login"
                  label="Identifiant"
                  name="login"
                  value={login}
                  onChange={(e) => setLogin(e.target.value)}
                  autoFocus
                />
                <TextField InputProps={{
                  endAdornment: (
                      <InputAdornment position="start">
                          <Lock />
                      </InputAdornment>
                  )
                  }}
                  margin="normal"
                  required
                  fullWidth
                  name="password"
                  label="Mot de passe"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  id="password"
                />
                <FormControlLabel
                  control={<Checkbox value="remember" color="primary" checked={isRememberMeChecked} onChange={handleCheckBoxChange} />}
                  label="Se souvenir de moi ?"
                />
                {!isLogging ? (
                <Button
                  color="secondary"
                  type="Connexion"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  endIcon={<Send />}
                >
                  Connexion
                </Button>
                ) : (
                  <Button
                  color="secondary"
                  type="Connexion"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  disabled
                >
                  Veuillez patienter...
                </Button>
                )}
                <Grid container>
                  <Grid item xs>
                    <Link href="/reset-password" variant="body2">
                      Mot de passe oublié ?
                    </Link>
                  </Grid>
                </Grid>
                <Copyright sx={{ mt: 5 }} />
              </Box>
            </Box>
          </Grid>
        </Grid>
      </>
      ) : 
      <>
        <Loader/>
      </>
      }
    </ThemeProvider>
  );
}

export default Login;