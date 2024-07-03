import { EmailVerificationId, Prisma, User, UserLoginIP } from '@prisma/client';
import prisma from '../prisma/prismaClient';
import { generateLoginToken } from '../utils/token';
import { hashPassword, comparePasswordHash } from '../utils/hash';
import { JSONErrorResponse, LoginUserRequest } from '../config/types';
import { labels } from '../config/labels';
import { CreateUser, UserCreateRequestType } from '../utils/validators/createUser';
import { Request, Response } from "express";
import transporter from '../utils/mailer';

const isProd = process.env.NODE_ENV === 'production';

// Verification email
const htmlBodyVerifyUserEmail = (firstName: string, lastName: string, uuid: string) => `<p>Hello ${firstName + ' '+lastName},</p>
    <p>Please verify your email by clicking the <a href="${ isProd ? process.env.HOME_URL : 'http://localhost:5173' }/verify/${uuid}">following link</a></p>
    <p>Kind regards,</p>
    <p>Notes team</p>`;

// Confirm new login IP email
const htmlBodyVerifyIPEmail = (firstName: string, lastName: string, uuid: string, userIP: string) => 
    `<p>Hello ${firstName + ' '+lastName},</p>
    <p>Please verify this new login IP ${userIP} by clicking the <a href='${ isProd ? process.env.HOME_URL : 'http://localhost:5173' }/verifyIP/${uuid}'>following link</a></p>
    <p>Kind regards,</p>
    <p>Notes team</p>`;

export const registerUser = async (req: Request<{}, {}, UserCreateRequestType>, res: Response) => {
    const userIP = req.ip;

    const {
        email,
        firstName,
        lastName,
        password
    } = req.body;

    const userValidate = CreateUser.safeParse(req.body);

    if (!userValidate.success) {
        const errorsObject: any = {}
        userValidate.error.issues.forEach((error) => {
            const errorKey = error.path[0].toString();
            errorsObject[errorKey] = error.message;
        });
        const errorResp: JSONErrorResponse = {
            status: labels.errorCreateDB,
            message: labels.errorUserCreate,
            errorObject: errorsObject
        };

        res.status(500).send(errorResp);
        return;
    }

    const hash = await hashPassword(password);

    const userData: Prisma.UserCreateInput = {
        email,
        firstName,
        lastName,
        passSaltHash: hash,
        VerificationEmail: { create: {} },
        UserLoginIP: {
            create: {
                ipAddress: userIP ?? 'undefined',
                isIPValid: true,
            }
        }
    };

    try {
        const user: User = await prisma.user.create({ data: userData });
        const verificationEmail: EmailVerificationId | null = await prisma.emailVerificationId.findFirst({ where: { ownerId: user.id }});
        console.log('login from mail', process.env.MAIL_NOREPLY)
        if (verificationEmail !== null) {
            transporter.sendMail({
                to: email,
                from: process.env.MAIL_NOREPLY,
                subject: 'Verify email for Notes app',
                html: htmlBodyVerifyUserEmail(user.firstName, user.lastName, verificationEmail.id)
            });
            res.status(200).send(user);
        } else {
            throw new Error();
        }
    } catch(e) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorCreateDB,
            message: labels.errorUserCreate,
            messageOrig: (e as Error)?.message,
            stack: (e as Error)?.stack,
            name: (e as Error)?.name
        };

        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // The .code property can be accessed in a type-safe manner
            if (e.code === 'P2002') {
                errorResp.message = labels.errorUserExists(email)
            }
        }

        res.status(500).send(errorResp);
    }
}

export const loginUser = async (req: Request<{}, {}, LoginUserRequest>, res: Response) => {
    const userIP = req.ip;
    console.log('loginUser userIP: ', userIP);
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({
        where: {
            email: email
        },
        include: {
            UserLoginIP: true
        }
    });

    if (user === null) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorMissingUser(email),
            name: 'email'
        };
        res.status(401).send(errorResp);
        return;
    }

    // unverified user results in unauthorized login attempt
    if (user?.isVerified === false) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorUnverifiedUser,
            name: 'email'
        };
        res.status(401).send(errorResp);
        return;
    }

    const loginSuccessful = await comparePasswordHash(password, user!.passSaltHash);
    const ipInPrevious = user.UserLoginIP.some(loginIP => loginIP.ipAddress === userIP && loginIP.isIPValid === true);

    // login should come from already used IP
    if (!ipInPrevious) {
        try {
            // don't duplicate in database login ip attempts
            const ipAlreadyAdded = user.UserLoginIP.some(loginIP => loginIP.ipAddress === userIP && loginIP.isIPValid === false);
            console.log('ipAlreadyAdded', ipAlreadyAdded)
            let newLoginIP: UserLoginIP | null = null;
            if (ipAlreadyAdded) {
                newLoginIP = user.UserLoginIP.find(ip => ip.ipAddress === userIP && ip.isIPValid === false);
                console.log('newLoginIP', newLoginIP)
            } else {
                newLoginIP = await prisma.userLoginIP.create({
                    data: {
                        ipAddress: userIP ?? 'undefined',
                        ownerId: user.id
                    }
                });
            }
            
            // send mail regardless of login attempts, user could have deleted emails
            transporter.sendMail({
                to: user.email,
                from: process.env.MAIL_NOREPLY,
                subject: 'Verify email for Notes app',
                html: htmlBodyVerifyIPEmail(user.firstName, user.lastName, newLoginIP.id, userIP)
            });
            res.status(401).send({
                status: labels.errorAuth,
                message: labels.errorIP,
                name: 'general'
            });
            return;
        } catch {
            res.status(500).send({
                status: labels.errorAuth,
                message: labels.errorDefault,
                name: 'general'
            });
            return;
        }
    }

    if (loginSuccessful) {
        res.status(200);
        const token = generateLoginToken(user!);
        res.json({
            jwt: token,
            userId: user!.id,
            userName: user!.firstName + ' ' + user!.lastName,
            userEmail: user!.email
        });
    } else {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorPassword,
            name: 'password'
        }
        res.status(401).send(errorResp);
    }
}


export const verifyUser = async (req: Request, res: Response) => {
    const emailUUID = req.params.emailUUID ?? '';
    console.log('verifyUser emailUUID', emailUUID);
    const EmailVerification = await prisma.emailVerificationId.findUnique({
        where: { id: emailUUID },
        include: { owner: true }
    });

    // if not found, return error
    if (EmailVerification === null) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorWrongEmailUUID,
            name: 'expiredUUID'
        };
        res.status(401).send(errorResp);
        return;
    }

    // if link is expired, return expired error
    if (EmailVerification.expiresAt.toISOString() < new Date(Date.now()).toISOString()) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorExpiredEmailUUID,
            name: 'expiredUUID'
        };
        res.status(401).send(errorResp);
        return;
    }

    try {
        const verifiedUser = await prisma.user.update({
            where: { id: EmailVerification.ownerId },
            data: { isVerified: true }
        });

        res.status(200).send(verifiedUser);
    } catch {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorWrongEmailUUID,
            name: 'email'
        };
        res.status(500).send(errorResp);
    }
}

export const generateNewVerify = async (req: Request<{}, {}, { email: string }>, res: Response) => {
    const { email: userEmail } = req.body;
    console.log('reverify email', userEmail)
    const user = await prisma.user.findUnique({
        where: { email: userEmail, isVerified: false },
        include: { VerificationEmail: true }
    });

    if (user === null) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorMissingUser(userEmail),
            name: 'email'
        };
        res.status(401).send(errorResp);
        return;
    }

    // delete previous validation links, some may still be unexpired
    if (user.VerificationEmail.length > 0) {
        try {
            await prisma.emailVerificationId.deleteMany({ where: { ownerId: user.id }});
        } catch {
            res.status(500).send({
                status: labels.errorAuth,
                message: labels.errorCreateDB
            });
        }
    }

    try {
        const newVerify = await prisma.emailVerificationId.create({ data: { ownerId: user.id }});
        transporter.sendMail({
            to: user.email,
            from: process.env.MAIL_NOREPLY,
            subject: 'Verify email for Notes app',
            html: htmlBodyVerifyUserEmail(user.firstName, user.lastName, newVerify.id)
        });
        res.status(200).send(newVerify);
    } catch {
        res.status(500).send({
            status: labels.errorAuth,
            message: labels.errorCreateDB
        });
    }
}

export const verifyUserIP = async (req: Request, res: Response) => {
    const ipUUID = req.params.ipUUID ?? '';
    const loginIP = await prisma.userLoginIP.findUnique({
        where: { id: ipUUID, isIPValid: false },
        include: { owner: true }
    });

    // if not found, return error,
    if (loginIP === null) {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorWrongEmailUUID,
        };
        res.status(401).send(errorResp);
        return;
    }

    try {
        const verifiedUserIP = await prisma.userLoginIP.update({
            where: { id: ipUUID },
            data: { isIPValid: true }
        });

        res.status(200).send(verifiedUserIP);
    } catch {
        const errorResp: JSONErrorResponse = {
            status: labels.errorAuth,
            message: labels.errorWrongEmailUUID,
        };
        res.status(500).send(errorResp);
    }
}