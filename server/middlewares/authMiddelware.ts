import { TokenPayload } from "../config/types";
import { decodeLoginToken } from "../utils/token";
import { Request, Response, NextFunction } from "express";
import { labels } from "config/labels";

const authUserRequest = (req: Request, res: Response, next: NextFunction) => {
    let token = req.header('Authorization');
    if (!token) {
        return res.status(401).json({
            status: labels.errorAuth,
            message: labels.errorAuthDefaultMessage
        });
    }

    token = token.split(' ')[1]; // Remove 'Bearer ' string from Authorization header
    try {
        // decoded also checks if token is expired
        const decoded: TokenPayload = decodeLoginToken(token);
        res.locals.userId = decoded.sub;
        next();
    } catch (e) {
        return res.status(403).send({
            status: labels.errorAuth,
            message: labels.errorAuthCredentials
        });
    }
}

export default authUserRequest;