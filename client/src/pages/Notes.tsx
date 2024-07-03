import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthenticationContextWrapper } from "../contexts/authenticationContext";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import Link from "@mui/material/Link";
import NotesList from "../components/Notes/NotesList";

const Notes = () => {
    const [auth, ] = useContext(AuthenticationContextWrapper);
    const isLoggedIn = !!auth?.user?.userId;

    const navigate = useNavigate();

    const handleNavigate = (e: React.SyntheticEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        navigate('/register');
    }

    if (!isLoggedIn) return (
        <Box sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: '100%',
            mt: '35vh'
        }}>
            <Typography variant="h5" sx={{
                width: {
                    xs: '80vw',
                    sm: 'initial'
                }
            }}>
                Please log in or <Link href='/register' onClick={handleNavigate}>register here</Link> to use the Notes app.
            </Typography>
        </Box>
    )

    return (
        <NotesList />
    )
}

export default Notes;