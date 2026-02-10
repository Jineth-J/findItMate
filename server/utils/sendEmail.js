const nodemailer = require('nodemailer');

const sendEmail = async (options) => {
    // Create a transporter
    // For development, we can use Ethereal or just log to console if no env vars
    const transporter = nodemailer.createTransport({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        auth: {
            user: process.env.SMTP_EMAIL || 'test@ethereal.email',
            pass: process.env.SMTP_PASSWORD || 'testpass'
        }
    });

    const message = {
        from: `${process.env.FROM_NAME || 'FindItMate'} <${process.env.FROM_EMAIL || 'noreply@finditmate.com'}>`,
        to: options.email,
        subject: options.subject,
        text: options.message, // Plain text body
        html: options.html    // HTML body
    };

    try {
        const info = await transporter.sendMail(message);
        console.log('Message sent: %s', info.messageId);
        // Preview only available when sending through an Ethereal account
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.log('Email delivery failed. Printing to console instead:');
        console.log('---------------------------------------------------');
        console.log(`To: ${options.email}`);
        console.log(`Subject: ${options.subject}`);
        console.log(`Message: ${options.message}`);
        console.log('---------------------------------------------------');
        // We don't want to crash the registration if email fails in dev
        if (process.env.NODE_ENV === 'production') {
            throw new Error('Email could not be sent');
        }
    }
};

module.exports = sendEmail;
