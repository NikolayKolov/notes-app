import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';

type NavigationButtonProps = {
    text: string,
    onClick: (...args: unknown[]) => void,
    cypressTestId?: string
}

const NavigationButton = ({ text, onClick, cypressTestId }: NavigationButtonProps) => {

    const handleOnClick = () => {
        onClick();
    }

    return (
        <Button variant="text" color='inherit' onClick={handleOnClick} data-testid={cypressTestId || ''} sx={
            [{
                '&:focus': {
                    outline: 'none'
                }
            }]
        }>
            <Typography variant="h6" color='inherit' component='div'>
                {text}
            </Typography>
        </Button>
    );
}

export default NavigationButton;