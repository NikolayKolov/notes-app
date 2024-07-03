import React from 'react';
import Link from '@mui/material/Link';
import { useLocation, useNavigate } from 'react-router-dom';

type NavigationLinkProps = {
    text: string,
    href: string
}

const NavigationLink = ({ text, href }: NavigationLinkProps) => {
    const location = useLocation();
    let isActive = false;
    if (location.pathname === href) isActive = true;

    const navigate = useNavigate();

    // use react router navigation
    const handleNavigate = (e: React.SyntheticEvent<HTMLAnchorElement>) => {
        e.preventDefault();
        e.stopPropagation();
        navigate(href);
    }

    return (
        <Link
            href={href}
            onClick={handleNavigate}
            underline={isActive ? 'always' : 'hover'}
            color='inherit'
            variant="h6"
            sx={[
                { '&.MuiLink-root:hover': { color: 'primary.light' }},
                { mr: 2, fontWeight: isActive? "fontWeghtBold" : "fontWeightLight" }
            ]}>
            {text}
        </Link>
    )
}

export default NavigationLink;