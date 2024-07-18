import express from 'express';
import type { ErrorRequestHandler } from "express";
import { default as dotenv } from 'dotenv';
import cors from 'cors';
import routes from './routes';
import prisma from './prisma/prismaClient.js';

dotenv.config();
const app = express();

// Port Number
const PORT = Number(process.env.PORT) || 5000;
// Host
const HOST = process.env.HOST || 'localhost';

// Parse JSON requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// get real IP address of user request
app.set('trust proxy', true);

const HOME_URL = process.env.HOME_URL || '';

if (HOME_URL) {
    // Add CORS policy
    app.use(cors({
        origin: HOME_URL
    }));
}


// load routes
app.use('/api', routes);

const errReqHandler: ErrorRequestHandler = async (err, _req, res, _next) => {
    if (err) {
        await prisma.$disconnect();
        console.log('Server error: ', err);
        res.status(err?.status || 500).json({ err });
    }
}

// error logging and handling
app.use(errReqHandler);

// Server Setup
app.listen(PORT, HOST, () => {
    console.log(`Server started on ${HOST}:${PORT}`);
});

// start scripts in package.json
//      "start": "prisma generate && node --loader ts-node/esm app.ts",
//      "start": "prisma generate && npx -p typescript tsc --noEmit && tsx app.ts",
// don't use nodemon, use tsx watch instead, as nodemon and tsx require
// different settings to work properly with TypeScript and ES modules
// doesn't test TypeScript, use "start" script for that before going to production
//      "dev": "nodemon app.ts",

// Remove prisma generate, as it it already triggered by the postinstall hook
//     "start:docker": "prisma generate && tsx app.ts",

// prisma update schema and push
//      make changes to schema
//      create migration with command npx prisma migrate dev --name name-of-migration

// Migrate on prod with command "npx prisma migrate deploy", in CI/CD pipeline