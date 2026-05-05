import nodemailer from 'nodemailer';

const sendEmail = async (options) => {
    // 1) Create a transporter
    const transporter = nodemailer.createTransport({
        service: 'gmail', // Using 'service' is often more reliable for Gmail
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASSWORD
        }
    });

    // 2) Define the email options
    const mailOptions = {
        from: `CV Builder <${process.env.EMAIL_FROM}>`,
        to: options.email,
        subject: options.subject,
        text: options.message,
        html: options.html
    };

    // 3) Actually send the email
    console.log('Sending email via Gmail Service...');
    const info = await transporter.sendMail(mailOptions);
    console.log('Email Info:', info.messageId);
};

export default sendEmail;
