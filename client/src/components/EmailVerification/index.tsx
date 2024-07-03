import useSWR from "swr";
import { useParams } from "react-router-dom";
import Box from "@mui/material/Box";
import Typography from "@mui/material/Typography";
import verifyUser from "../../api/verifyUser";
import VerificationWrapper from "../common/VerificationWrapper";
import ReverifyEmail from "./components/ReverifyForm";

const EmailVerification = () => {
    const { UUID } = useParams();
    const fetcher = () => verifyUser(UUID ?? '');
    const { isLoading, error } = useSWR(`/api/user/verify/${UUID}`, fetcher, {
        shouldRetryOnError: false,
        revalidateOnFocus: false,
        revalidateIfStale: false,
        revalidateOnReconnect: false
    });

    if (isLoading) {
        return (
            <VerificationWrapper>
                <Typography variant="h5">
                    Verifying, please wait...
                </Typography>
            </VerificationWrapper>
        );
    }

    if (error && error?.name === 'expiredUUID') {
        return (
            <VerificationWrapper>
                <Typography variant="h5" sx={{ color: 'error.main'}}>
                    {error.message}
                </Typography>
                <Box
                    sx={{ maxWidth: '500px', mt: 2 }}>
                    <ReverifyEmail />
                </Box>
            </VerificationWrapper>
        );
    }

    if (error) {
        return (
            <VerificationWrapper>
                <Typography variant="h5" sx={{ color: 'error.main'}}>
                    An error has occured
                </Typography>
            </VerificationWrapper>
        );
    }

    return (
        <VerificationWrapper>
            <Typography variant="h5" sx={{ color: 'success.main'}}>
                Verificaion successful, you can now log in
            </Typography>
        </VerificationWrapper>
    )
}


export default EmailVerification;