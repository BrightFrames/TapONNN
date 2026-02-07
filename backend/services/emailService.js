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

    const fromName = process.env.EMAIL_FROM_NAME || 'TapX';
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

    const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: `Welcome to TapX, ${fullName}! 🎉`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #7C3AED, #9333EA); border-radius: 16px; line-height: 60px; color: white; font-size: 24px; font-weight: bold;">TO</div>
                </div>
                
                <h1 style="color: #1F2937; font-size: 28px; margin-bottom: 20px; text-align: center;">Welcome to TapX! 🚀</h1>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Hey ${fullName},
                </p>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Thanks for signing up! Your TapX profile is ready. Share all your important links in one place.
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
                    © ${new Date().getFullYear()} TapX. All rights reserved.
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

    const fromName = process.env.EMAIL_FROM_NAME || 'TapX';
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
                    Thank you for subscribing to TapX <strong>${planName}</strong>!
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
                    © ${new Date().getFullYear()} TapX. All rights reserved.
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

    const fromName = process.env.EMAIL_FROM_NAME || 'TapX';
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

    const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: `Reset your TapX password`,
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
                    © ${new Date().getFullYear()} TapX. All rights reserved.
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

    const fromName = process.env.EMAIL_FROM_NAME || 'TapX';
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

// Send notification to store owner when someone subscribes to their store updates
const sendStoreSubscriptionNotification = async (to, storeName, subscriberEmail, subscriberUsername) => {
    const transporter = createTransporter();
    if (!transporter) return { success: false, error: 'Email not configured' };

    const fromName = process.env.EMAIL_FROM_NAME || 'TapX';
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

    const subscriberInfo = subscriberUsername 
        ? `@${subscriberUsername}${subscriberEmail ? ` (${subscriberEmail})` : ''}`
        : subscriberEmail;

    const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: `New Subscriber for ${storeName}! 📈`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background: #000; border-radius: 16px; line-height: 60px; color: white; font-size: 24px; font-weight: bold;">T</div>
                </div>
                
                <h1 style="color: #1F2937; font-size: 24px; margin-bottom: 20px; text-align: center;">You have a new subscriber! 📈</h1>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px;">
                    Great news! Someone just subscribed to receive updates from your store <strong>${storeName}</strong>.
                </p>
                
                <div style="background: #F9FAFB; border-radius: 16px; padding: 24px; margin-bottom: 30px; border: 1px solid #F3F4F6; text-align: center;">
                    <p style="margin: 0; color: #9CA3AF; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em; margin-bottom: 8px;">Subscriber Details</p>
                    <p style="margin: 0; color: #111827; font-size: 18px; font-weight: bold;">${subscriberInfo}</p>
                </div>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 30px; text-align: center;">
                    They'll be notified automatically whenever you drop new products!
                </p>
                
                <div style="text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px;">
                    <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} TapX. Keep building!
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending store subscription notification:', error);
        return { success: false, error: error.message };
    }
};

// Send order notification email to seller
const sendOrderNotificationEmail = async (to, sellerName, orderDetails) => {
    const transporter = createTransporter();
    if (!transporter) {
        console.log('Skipping order notification email - not configured');
        return { success: false, error: 'Email not configured' };
    }

    const fromName = process.env.EMAIL_FROM_NAME || 'TapX';
    const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

    const mailOptions = {
        from: `"${fromName}" <${fromEmail}>`,
        to: to,
        subject: `🎉 New Order Received - ${orderDetails.product_name}`,
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px;">
                <div style="text-align: center; margin-bottom: 40px;">
                    <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #10B981, #059669); border-radius: 16px; line-height: 60px; color: white; font-size: 32px;">🛍️</div>
                </div>
                
                <h1 style="color: #1F2937; font-size: 28px; margin-bottom: 16px; text-align: center;">New Order Received! 🎉</h1>
                
                <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 24px; text-align: center;">
                    Hey ${sellerName}, you've got a new order!
                </p>
                
                <div style="background: linear-gradient(135deg, #F0FDF4, #DCFCE7); border-radius: 16px; padding: 24px; margin-bottom: 30px; border: 2px solid #10B981;">
                    <div style="margin-bottom: 16px;">
                        <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em;">Product</p>
                        <p style="margin: 4px 0 0 0; color: #111827; font-size: 18px; font-weight: bold;">${orderDetails.product_name}</p>
                    </div>
                    
                    <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-top: 20px;">
                        <div>
                            <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Amount</p>
                            <p style="margin: 4px 0 0 0; color: #10B981; font-size: 20px; font-weight: bold;">${orderDetails.currency || 'INR'} ${orderDetails.amount}</p>
                        </div>
                        <div>
                            <p style="margin: 0; color: #6B7280; font-size: 12px; text-transform: uppercase; font-weight: bold;">Order ID</p>
                            <p style="margin: 4px 0 0 0; color: #111827; font-size: 14px; font-weight: 600;">${orderDetails.payment_id}</p>
                        </div>
                    </div>
                </div>
                
                <div style="background: #F9FAFB; border-radius: 16px; padding: 20px; margin-bottom: 30px; border: 1px solid #E5E7EB;">
                    <p style="margin: 0 0 12px 0; color: #6B7280; font-size: 12px; text-transform: uppercase; font-weight: bold; letter-spacing: 0.1em;">Customer Details</p>
                    <div style="margin-bottom: 8px;">
                        <span style="color: #4B5563; font-size: 14px; font-weight: 600;">Name:</span>
                        <span style="color: #111827; font-size: 14px; margin-left: 8px;">${orderDetails.buyer_name}</span>
                    </div>
                    <div>
                        <span style="color: #4B5563; font-size: 14px; font-weight: 600;">Email:</span>
                        <span style="color: #111827; font-size: 14px; margin-left: 8px;">${orderDetails.buyer_email}</span>
                    </div>
                </div>
                
                <div style="text-align: center; margin-bottom: 30px;">
                    <a href="https://taponn.me/earnings" style="display: inline-block; background: linear-gradient(135deg, #10B981, #059669); color: white; text-decoration: none; padding: 14px 32px; border-radius: 50px; font-weight: 600; font-size: 16px;">
                        View Order Details
                    </a>
                </div>
                
                <p style="color: #6B7280; font-size: 14px; line-height: 1.6; text-align: center; margin-bottom: 20px;">
                    Don't forget to process this order and update the delivery status!
                </p>
                
                <div style="text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px;">
                    <p style="color: #9CA3AF; font-size: 12px; margin: 0;">
                        © ${new Date().getFullYear()} TapX. Keep selling!
                    </p>
                </div>
            </div>
        `
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log('Order notification email sent:', info.messageId);
        return { success: true, messageId: info.messageId };
    } catch (error) {
        console.error('Error sending order notification email:', error);
        return { success: false, error: error.message };
    }
};

module.exports = {
    sendWelcomeEmail,
    sendSubscriptionEmail,
    sendPasswordResetEmail,
    sendStoreSubscriptionNotification,
    sendOrderNotificationEmail,
    sendEmail
};
