import { useContext, useState } from 'react';
import { AuthenticationContextWrapper } from '../../contexts/authenticationContext';
import AuthComponent from '../authentication/AuthComponent';
import Box from '@mui/material/Box';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import NavigationButton from './NavigationButton';
import NavigationLink from './NavigationLink';
import NavigationLoginDialog from './NavigationLoginDialog';
import NavigationLogoutMenu from './NavigationLogoutMenu';

const Navigation = () => {
    const [openLoginDialog, setLoginDialog] = useState<boolean>(false);
    const [auth, ] = useContext(AuthenticationContextWrapper);
    const isUserLoggedIn = !!auth?.user?.userId;

    const handleLogin = () => {
        setLoginDialog(true);
    }

    const handleCloseLoginDialog = () => {
        setLoginDialog(false);
    }

    const [status, setStatus] = useState('idle')
    const [responseText, setResponseText] = useState('')

    const [status, setStatus] = useState('idle')
    const [responseText, setResponseText] = useState('')
  
    const handleFetch = async (fetchPath) => {
      setStatus('loading')
      try {
        const response = await fetch(fetchPath)
        console.log('response:', response)
      
        if (!response.ok) {
          throw new Error(`Response status: ${response.status}`);
        }
  
        const text = await response.text()
        setResponseText(text)
        setStatus('success')
      } catch {
        setStatus('error')
        setResponseText('')
      }
    }

    return (
        <>
            <AppBar sx={{
                    height: {
                        xs: '4rem',
                        lg: '5rem'
                    },
                    alignItems: 'center',
                    px: 0,
                }}
                position='fixed'
                component="header">
                <Toolbar sx={{
                    height: 'inherit',
                    justifyContent: 'space-between',
                    width: {
                        xs: '100%',
                        lg: 1200,
                    }
                }}>
                    <Box sx={{ textTransform: 'uppercase' }}>
                        <NavigationLink text='notes-6' href='/' />
                        <button onClick={() => handleFetch('/api')}>Fetch root API</button>
                        <p>
                            Status: {status}
                        </p>
                        <p className="read-the-docs">
                            Result: {responseText}
                        </p>
                        <AuthComponent>
                            <NavigationLink text='new note' href='/create' cypressTestId="create-new-note" />
                        </AuthComponent>
                    </Box>
                    {
                        isUserLoggedIn ?
                            <NavigationLogoutMenu /> :
                            <NavigationButton text='login' onClick={handleLogin} cypressTestId="login-link" />
                    }
                </Toolbar>
            </AppBar>
            { isUserLoggedIn ? null : <NavigationLoginDialog open={openLoginDialog} onClose={handleCloseLoginDialog}/> }
        </>
    )
}

export default Navigation;