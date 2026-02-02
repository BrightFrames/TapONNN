const nodemailer = require('nodemailer');

// Create transporter with SMTP configuration
const createTransporter = () => {
    // Check if email is configured
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.warn('Email service not configured. Set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

// Send welcome email after signup
const sendWelcomeEmail = async (to, username, fullName) => {
    const transporter = createTransporter();
    if (!transporter) {
        console.log('Skipping welcome email - not configured');
        return { success: false, error: 'Email not configured' };
    }

    const fromName = process.env.EMAIL_FROM_NAME || 'Tap2';
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

    const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: `Welcome to TapONN, ${fullName}! 🎉`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #7C3AED, #9333EA); border-radius: 16px; line-height: 60px; color: white; font-size: 24px; font-weight: bold;">TO</div>
                </div>
                
                <h1 style="color: #1F2937; font-size: 28px; margin-bottom: 20px; text-align: center;">Welcome to TapONN! 🚀</h1>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hey ${fullName},
                </p>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Thanks for signing up! Your TapONN profile is ready. Share all your important links in one place.
                </p>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    Your profile URL: <a href="https://taponn.me/${username}" style="color: #7C3AED; font-weight: 600;">taponn.me/${username}</a>
                </p>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="https://taponn.me/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                        Go to Dashboard
                    </a>
                </div>
                
                <p style="color: #9CA3AF; font-size: 14px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px;">
                    © ${new Date().getFullYear()} TapONN. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Welcome email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending welcome email:', error);
        return { success: false, error: error.message };
    }
};

// Send subscription confirmation email
const sendSubscriptionEmail = async (to, fullName, planName, amount, expiresAt) => {
    const transporter = createTransporter();
    if (!transporter) {
        console.log('Skipping subscription email - not configured');
        return { success: false, error: 'Email not configured' };
    }

    const fromName = process.env.EMAIL_FROM_NAME || 'TapONN';
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

    const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: `Your ${planName} subscription is active! ✨`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #7C3AED, #9333EA); border-radius: 16px; line-height: 60px; color: white; font-size: 24px; font-weight: bold;">TO</div>
                </div>
                
                <h1 style="color: #1F2937; font-size: 28px; margin-bottom: 20px; text-align: center;">Subscription Confirmed! 🎉</h1>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hey ${fullName},
                </p>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Thank you for subscribing to TapONN <strong>${planName}</strong>!
                </p>
                
                <div style="background: #F3F4F6; border-radius: 12px; padding: 20px; margin-bottom: 30px;">
                    <p style="margin: 0 0 10px 0; color: #4B5563;"><strong>Plan:</strong> ${planName}</p>
                    <p style="margin: 0 0 10px 0; color: #4B5563;"><strong>Amount:</strong> ₹${amount}</p>
                    <p style="margin: 0; color: #4B5563;"><strong>Valid Until:</strong> ${new Date(expiresAt).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="https://taponn.me/dashboard" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                        Go to Dashboard
                    </a>
                </div>
                
                <p style="color: #9CA3AF; font-size: 14px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px;">
                    © ${new Date().getFullYear()} TapONN. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Subscription email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending subscription email:', error);
        return { success: false, error: error.message };
    }
};

// Send password reset email
const sendPasswordResetEmail = async (to, fullName, resetLink) => {
    const transporter = createTransporter();
    if (!transporter) {
        console.log('Skipping password reset email - not configured');
        return { success: false, error: 'Email not configured' };
    }

    const fromName = process.env.EMAIL_FROM_NAME || 'TapONN';
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

    const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: `Reset your TapONN password`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #7C3AED, #9333EA); border-radius: 16px; line-height: 60px; color: white; font-size: 24px; font-weight: bold;">TO</div>
                </div>
                
                <h1 style="color: #1F2937; font-size: 28px; margin-bottom: 20px; text-align: center;">Reset Your Password</h1>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hey ${fullName},
                </p>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
                    We received a request to reset your password. Click the button below to create a new password.
                </p>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="${resetLink}" style="display: inline-block; background: linear-gradient(135deg, #7C3AED, #9333EA); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                        Reset Password
                    </a>
                </div>
                
                <p style="color: #9CA3AF; font-size: 14px; margin-bottom: 20px;">
                    This link will expire in 1 hour. If you didn't request this, please ignore this email.
                </p>
                
                <p style="color: #9CA3AF; font-size: 14px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px;">
                    © ${new Date().getFullYear()} TapONN. All rights reserved.
                </p>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Password reset email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending password reset email:', error);
        return { success: false, error: error.message };
    }
};

// Generic email sender
const sendEmail = async (to, subject, htmlContent) => {
    const transporter = createTransporter();
    if (!transporter) {
        return { success: false, error: 'Email not configured' };
    }

    const fromName = process.env.EMAIL_FROM_NAME || 'TapONN';
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

    try {
        const info = await transporter.sendMail({
            from: `"${fromName}" <${fromEmail}>`,
            to: to,
            subject: subject,
            html: htmlContent
        });
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendWelcomeEmail,
    sendSubscriptionEmail,
    sendPasswordResetEmail,
    sendEmail
};
