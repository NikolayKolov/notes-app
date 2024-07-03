import useSWR from "swr";
import { useParams } from "react-router-dom";
import VerificationWrapper from "../common/VerificationWrapper";
import Typography from "@mui/material/Typography";
import verifyIP from "../../api/verifyIP";

const IPVerification = () => {
    const { UUID } = useParams();
    const fetcher = () => verifyIP(UUID ?? '');
    const { isLoading, error } = useSWR(`/api/user/verifyIP/${UUID}`, fetcher, {
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

    if (error) {
        return (
            <VerificationWrapper>
                <Typography variant="h5" sx={{ color: 'error.main'}}>
                    {
                        error?.message ? 
                            <>
                                The following error has occured
                                <p>{error.message}</p>
                            </> :
                            "An error has occured"
                    }
                </Typography>
            </VerificationWrapper>
        );
    }

    return (
        <VerificationWrapper>
            <Typography variant="h5" sx={{ color: 'success.main'}}>
                Verificaion successful, you can now log in from new IP
            </Typography>
        </VerificationWrapper>
    )
}

export default IPVerification;