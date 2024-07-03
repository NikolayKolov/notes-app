import React from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";

type WrapperProps = {
    children: React.ReactNode;
};

const VerificationWrapper: React.FC<WrapperProps> = ({ children }) => {
    return (
        <Box
            sx={{
                px: 2,
                mt: {
                    xs: 2,
                    md: 8
            }}}>
            <Paper elevation={3} sx={{p: 2, mt: '20vh'}}>
                {children}
            </Paper>
        </Box>
    )
};

export default VerificationWrapper;