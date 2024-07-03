import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
    host: 'smtp.mailersend.net',
    port: 587,
    auth: {
        user: process.env.MAILER_USER,
        pass: process.env.MAILER_PASSWORD,
    },
});

export default transporter;