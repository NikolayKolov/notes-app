import React, { useState } from 'react';
import Box from "@mui/material/Box";
import TextField from "@mui/material/TextField";
import { FormStatus } from '../../../../lib/types';
import Button from '@mui/material/Button';
import Alert from '@mui/material/Alert';
import reverifyUser from '../../../../api/reverifyUser';

const ReverifyEmail = () => {
    const [status, setStatus] = useState<FormStatus>('idle');
    const [error, setError] = useState('');
    let helpertext = 'A new verification link will be sent to this email';
    if (status === 'error' || status === 'errorNetwork') helpertext = 'An error has occured, please try again later';

    const handleReverify = async (e: React.SyntheticEvent<HTMLFormElement>) => {
        e.preventDefault();
        e.stopPropagation();
        setStatus('loading');
        setError('');
        console.log('handleReverify init')
        const formData = e.target as HTMLFormElement;
        const email = formData.email.value;
        try {
            const response = await reverifyUser(email);
            console.log('handleReverify response.ok', response)
            setStatus('success');
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch(e: any) {
            console.log('handleReverify response.error 2', e)
            setStatus('error');
            if (e?.message) setError(e.message);
        }
    }

    return (
        <Box
            component='form'
            onSubmit={handleReverify}
            sx={{
                display: 'flex',
                flexDirection: 'column',
                gap: 2
            }}>
            <TextField
                sx={{
                    mb: 2
                }}
                required
                id='reverify-form-email'
                name='email'
                type="email"
                label="Email"
                error={status === 'error' || status === 'errorNetwork'}
                helperText={error ? error : helpertext}
                disabled={status === 'loading'} />
            <Button type="submit" variant="contained" sx={{ maxWidth: 200 }}>Request new link</Button>
            { status === 'success' && <Alert severity='success'>Email sent! Check your email</Alert> }
        </Box>
    );
}

export default ReverifyEmail;
