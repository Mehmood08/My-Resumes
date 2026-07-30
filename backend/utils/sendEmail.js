import nodemailer from 'nodemailer';
import { getSystemConfig } from './configHelper.js';

const sendEmail = async (options) => {
    const { config } = await getSystemConfig();

    const host = config.EMAIL_HOST || 'smtp.gmail.com';
    const port = config.EMAIL_PORT || 465;
    const user = config.EMAIL_USER || process.env.EMAIL_USER;
    const pass = config.EMAIL_PASSWORD || process.env.EMAIL_PASSWORD;
    const from = config.EMAIL_FROM || user || 'noreply@cvbuilder.com';

    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465, // SSL if 465
        auth: {
            user,
            pass
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: `CV Builder <${from}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    // 3) Actually send the email
    console.log(`Sending email via ${host}...`);
    const info = await transporter.sendMail(mailOptions);
    console.log('Email Info:', info.messageId);
};

export default sendEmail;
