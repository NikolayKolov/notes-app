import React from 'react';
import Tooltip from "@mui/material/Tooltip";
import Link from "@mui/material/Link";
import { useNavigate } from "react-router-dom";

type NoteRouterLinkProps = {
    href: string,
    label: string,
    styles?: React.CSSProperties
}

export default function RouterLink({ href, label, styles }: NoteRouterLinkProps) {
    const navigate = useNavigate();

    const havigateTo = (e: React.SyntheticEvent<HTMLAnchorElement>) => {
        e.stopPropagation();
        e.preventDefault();
        navigate(href)
    }

    if (styles) return (
        <Tooltip title={label}>
            <Link href={href} style={styles} onClick={havigateTo}>{label}</Link>
        </Tooltip>
    );

    return (
        <Tooltip title={label}>
            <Link href={href} onClick={havigateTo}>{label}</Link>
        </Tooltip>
    )
}