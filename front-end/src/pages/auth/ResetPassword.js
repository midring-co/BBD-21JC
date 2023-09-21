import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import Avatar from '@mui/material/Avatar';
import Button from '@mui/material/Button';
import CssBaseline from '@mui/material/CssBaseline';
import TextField from '@mui/material/TextField';
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
import { logout } from '../../redux/reducers';

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

const ResetPassword = () => {
  const [isLoadedLayout, setIsLoadedLayout] = useState(false);
  const [login, setLogin] = useState('');
  const [securityCode, setSecurityCode] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [hasRequest, setHasRequest] = useState(false);

  const reduxToken = useSelector(state => state.token);
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const checkToken = () => {
    if(reduxToken != 'undefined') {
      axios.post('http://localhost:8000/api/login/check-token', reduxToken, { timeout: 10000 })
      .then(response => {
        if(response.data.requestResponse) {
          if(response.data.message === 'VALID_LOGIN_BY_TOKEN') {
            navigate('/');
          } else {
            dispatch(logout({}));
            setHasRequest(false);
            setIsLoadedLayout(true);
          }
        } else {
          dispatch(logout({}));
          setHasRequest(false);
          setIsLoadedLayout(true);
        }
      }).catch(error => {
        dispatch(logout({}));
        setHasRequest(false);
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
      securityCode: securityCode,
      currentToken: reduxToken
    };

    const tryRequest = () => {
      if(isLoadedLayout) {
        setHasRequest(true);
        setError(null);
        axios.post('http://localhost:8000/api/auth/reset-password', credentials, { timeout: 10000 })
        .then(response => {
          if(response.data.requestResponse) {
            if(response.data.reset) {
              if(response.data.message && response.data.message === 'VALID_RESET_PASSWORD') {
                setError(null);
                setSuccess('Un lien de réinitialisation de mot de passe vient de vous être envoyé par mail.');
                setLogin('');
                setSecurityCode('');
                setHasRequest(false);
              } else {
                setSuccess(null);
                setError('Identifiant ou code de sécurité incorrect.');
                setHasRequest(false);
              }
            } else {
              setSuccess(null);
              setError(response.data.message);
              setHasRequest(false);
            }
          } else {
            if(response.data.message && response.data.message === 'LOGIN_TOKEN_ALREADY_EXISTS') {
              checkToken();
            } else {
              setSuccess(null);
              setError(response.data.message);
              setHasRequest(false);
            }
          }
        }).catch(error => {
          setSuccess(null);
          setError('Une erreur est survenue.');
          setHasRequest(false);
        });
      }
    }
    
    if(reduxToken === 'undefined') {
      var formLogin = login.trim();
      var formSecurityCode = securityCode.trim();
      if(formLogin.length > 0 && formSecurityCode.length > 0) {
        if(/^[a-zA-Z0-9!@#$%^&*_.\-]+$/.test(formLogin)) {
          if(/^\d+$/.test(formSecurityCode) && formSecurityCode.length == 6) {
            if(!hasRequest) {
              tryRequest();
            }
          } else {
            setSuccess(null);
            setError('Le code de sécurité doit être une suite de 6 chiffres.');
            setHasRequest(false);
          }
        } else {
          setSuccess(null);
          setError('Identifiant ou code de sécurité incorrect.');
          setHasRequest(false);
        }
      } else {
        setSuccess(null);
        setError('Veuillez saisir tous les champs.');
        setHasRequest(false);
      }
    } else {
      checkToken();
    }
  };

  useEffect(() => {
    checkToken();
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
                Réinitialisez votre mot de passe
              </Typography>
              <Box component="form" noValidate onSubmit={handleSubmit} sx={{ mt: 1 }}>
                {error ?
                (  
                  <Alert severity="error">
                  <strong>{error}</strong>
                  </Alert>
                ) : <div></div> }
                {success ?
                (  
                  <Alert severity="success">
                  <strong>{success}</strong>
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
                  name="securityCode"
                  label="Code de sécurité"
                  type="password"
                  value={securityCode}
                  onChange={(e) => setSecurityCode(e.target.value)}
                  id="password"
                />
                {!hasRequest ? (
                <Button
                  color="secondary"
                  type="Connexion"
                  fullWidth
                  variant="contained"
                  size="large"
                  sx={{ mt: 3, mb: 2 }}
                  endIcon={<Send />}
                >
                  Réinitialisation
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
                    <Link href="/login" variant="body2">
                      Se connecter
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

export default ResetPassword;