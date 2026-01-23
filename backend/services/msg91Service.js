const axios = require('axios');
const nodemailer = require('nodemailer');

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;
const MSG91_WELCOME_TEMPLATE_ID = process.env.MSG91_WELCOME_EMAIL_TEMPLATE_ID;
const MSG91_SUBSCRIPTION_TEMPLATE_ID = process.env.MSG91_SUBSCRIPTION_EMAIL_TEMPLATE_ID;

/**
 * Create Nodemailer SMTP transporter for sending emails
 */
const createEmailTransporter = () => {
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
        console.error('SMTP not configured. Please set SMTP_HOST, SMTP_USER, SMTP_PASS in .env');
        return null;
    }

    return nodemailer.createTransport({
        host: process.env.SMTP_HOST,
        port: parseInt(process.env.SMTP_PORT || '587'),
        secure: process.env.SMTP_SECURE === 'true',
        auth: {
            user: process.env.SMTP_USER,
            pass: process.env.SMTP_PASS,
        },
    });
};

/**
 * Send OTP to a mobile number using MSG91
 * @param {string} phoneNumber - Mobile number with country code (e.g., 919876543210)
 * @returns {Promise<{success: boolean, message: string, requestId?: string}>}
 */
const sendOTP = async (phoneNumber) => {
    try {
        if (!MSG91_AUTH_KEY || MSG91_AUTH_KEY === 'your_msg91_auth_key_here') {
            console.error('MSG91_AUTH_KEY not configured');
            return { success: false, message: 'OTP service not configured' };
        }

        if (!MSG91_TEMPLATE_ID) {
            console.error('MSG91_TEMPLATE_ID not configured');
            return { success: false, message: 'OTP template not configured' };
        }

        // Ensure phone number is in correct format (remove + if present)
        const formattedPhone = phoneNumber.replace(/^\+/, '');

        console.log('Sending OTP to:', formattedPhone);

        const response = await axios.post(
            'https://control.msg91.com/api/v5/otp',
            {
                template_id: MSG91_TEMPLATE_ID,
                mobile: formattedPhone,
                otp_length: 6,
                otp_expiry: 5 // 5 minutes
            },
            {
                headers: {
                    'authkey': MSG91_AUTH_KEY,
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            }
        );

        console.log('MSG91 Response:', response.data);

        if (response.data && response.data.type === 'success') {
            return {
                success: true,
                message: 'OTP sent successfully',
                requestId: response.data.request_id
            };
        } else {
            console.error('MSG91 Send OTP Error:', response.data);
            return {
                success: false,
                message: response.data?.message || 'Failed to send OTP'
            };
        }
    } catch (error) {
        console.error('MSG91 Send OTP Exception:', error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send OTP'
        };
    }
};

/**
 * Verify OTP using MSG91
 * @param {string} phoneNumber - Mobile number with country code
 * @param {string} otp - OTP entered by user
 * @returns {Promise<{success: boolean, message: string}>}
 */
const verifyOTP = async (phoneNumber, otp) => {
    try {
        if (!MSG91_AUTH_KEY || MSG91_AUTH_KEY === 'your_msg91_auth_key_here') {
            console.error('MSG91_AUTH_KEY not configured');
            return { success: false, message: 'OTP service not configured' };
        }

        // Ensure phone number is in correct format
        const formattedPhone = phoneNumber.replace(/^\+/, '');

        const response = await axios.get(
            `https://control.msg91.com/api/v5/otp/verify`,
            {
                params: {
                    mobile: formattedPhone,
                    otp: otp
                },
                headers: {
                    'authkey': MSG91_AUTH_KEY
                }
            }
        );

        if (response.data && response.data.type === 'success') {
            return { success: true, message: 'OTP verified successfully' };
        } else {
            console.error('MSG91 Verify OTP Error:', response.data);
            return {
                success: false,
                message: response.data?.message || 'Invalid OTP'
            };
        }
    } catch (error) {
        console.error('MSG91 Verify OTP Exception:', error.response?.data || error.message);
        // MSG91 returns 400 for invalid OTP
        if (error.response?.status === 400) {
            return { success: false, message: 'Invalid or expired OTP' };
        }
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to verify OTP'
        };
    }
};

/**
 * Resend OTP using MSG91
 * @param {string} phoneNumber - Mobile number with country code
 * @param {string} retryType - 'text' or 'voice'
 * @returns {Promise<{success: boolean, message: string}>}
 */
const resendOTP = async (phoneNumber, retryType = 'text') => {
    try {
        if (!MSG91_AUTH_KEY || MSG91_AUTH_KEY === 'your_msg91_auth_key_here') {
            return { success: false, message: 'OTP service not configured' };
        }

        const formattedPhone = phoneNumber.replace(/^\+/, '');

        const response = await axios.get(
            `https://control.msg91.com/api/v5/otp/retry`,
            {
                params: {
                    mobile: formattedPhone,
                    retrytype: retryType
                },
                headers: {
                    'authkey': MSG91_AUTH_KEY
                }
            }
        );

        if (response.data && response.data.type === 'success') {
            return { success: true, message: 'OTP resent successfully' };
        } else {
            return {
                success: false,
                message: response.data?.message || 'Failed to resend OTP'
            };
        }
    } catch (error) {
        console.error('MSG91 Resend OTP Exception:', error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to resend OTP'
        };
    }
};

/**
 * Send transactional email using MSG91
 * @param {string} to - Recipient email address
 * @param {string} templateId - MSG91 email template ID
 * @param {object} variables - Template variables
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendEmail = async (to, templateId, variables = {}) => {
    try {
        if (!MSG91_AUTH_KEY) {
            console.error('MSG91_AUTH_KEY not configured');
            return { success: false, message: 'Email service not configured' };
        }

        if (!templateId) {
            console.error('Email template ID not provided');
            return { success: false, message: 'Email template not configured' };
        }

        const response = await axios.post(
            'https://control.msg91.com/api/v5/email/send',
            {
                to: [{ email: to }],
                from: { email: `noreply@${MSG91_EMAIL_DOMAIN}`, name: 'Tap2' },
                domain: MSG91_EMAIL_DOMAIN,
                template_id: templateId,
                variables: variables
            },
            {
                headers: {
                    'authkey': MSG91_AUTH_KEY,
                    'Content-Type': 'application/json'
                }
            }
        );

        if (response.data && (response.data.type === 'success' || response.status === 200)) {
            console.log('MSG91 Email sent successfully to:', to);
            return { success: true, message: 'Email sent successfully' };
        } else {
            console.error('MSG91 Send Email Error:', response.data);
            return {
                success: false,
                message: response.data?.message || 'Failed to send email'
            };
        }
    } catch (error) {
        console.error('MSG91 Send Email Exception:', error.response?.data || error.message);
        return {
            success: false,
            message: error.response?.data?.message || 'Failed to send email'
        };
    }
};

/**
 * Send welcome email to new user
 * @param {string} email - User's email
 * @param {string} username - User's username
 * @param {string} fullName - User's full name
 */
const sendWelcomeEmail = async (email, username, fullName) => {
    if (!MSG91_WELCOME_TEMPLATE_ID) {
        console.log('Welcome email template not configured (MSG91_WELCOME_EMAIL_TEMPLATE_ID)');
        return { success: false, message: 'Welcome email template not configured' };
    }

    return sendEmail(email, MSG91_WELCOME_TEMPLATE_ID, {
        name: fullName,
        username: username,
        profile_url: `https://tap2.me/${username}`
    });
};

/**
 * Send subscription confirmation email
 * @param {string} email - User's email
 * @param {string} fullName - User's full name
 * @param {string} planName - Subscription plan name
 * @param {number} amount - Amount paid
 * @param {Date} expiresAt - Subscription expiry date
 */
const sendSubscriptionEmail = async (email, fullName, planName, amount, expiresAt) => {
    if (!MSG91_SUBSCRIPTION_TEMPLATE_ID) {
        console.log('Subscription email template not configured (MSG91_SUBSCRIPTION_EMAIL_TEMPLATE_ID)');
        return { success: false, message: 'Subscription email template not configured' };
    }

    return sendEmail(email, MSG91_SUBSCRIPTION_TEMPLATE_ID, {
        name: fullName,
        plan_name: planName,
        amount: amount.toString(),
        expires_at: new Date(expiresAt).toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        })
    });
};

// In-memory OTP storage (use Redis in production)
const emailOTPStore = new Map();

/**
 * Generate a random 6-digit OTP
 */
const generateOTP = () => {
    return Math.floor(100000 + Math.random() * 900000).toString();
};

/**
 * Send OTP to email using Nodemailer SMTP
 * @param {string} email - Email address to send OTP
 * @returns {Promise<{success: boolean, message: string}>}
 */
const sendEmailOTP = async (email) => {
    try {
        // Create SMTP transporter
        const transporter = createEmailTransporter();

        if (!transporter) {
            return { success: false, message: 'Email service not configured. Please set SMTP credentials in .env' };
        }

        // Generate OTP
        const otp = generateOTP();
        const expiresAt = Date.now() + 5 * 60 * 1000; // 5 minutes

        // Store OTP for verification
        emailOTPStore.set(email.toLowerCase(), { otp, expiresAt });

        console.log(`Generated OTP for ${email}: ${otp}`); // For debugging

        // Email configuration
        const fromName = process.env.EMAIL_FROM_NAME || 'TapONN';
        const fromEmail = process.env.EMAIL_FROM || process.env.SMTP_USER;

        const mailOptions = {
            from: `"${fromName}" <${fromEmail}>`,
            to: email,
            subject: 'Your Verification Code - TapONN',
            html: `
                <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; background: #ffffff;">
                    <div style="text-align: center; margin-bottom: 40px;">
                        <div style="display: inline-block; width: 60px; height: 60px; background: linear-gradient(135deg, #7C3AED, #9333EA); border-radius: 16px; line-height: 60px; color: white; font-size: 24px; font-weight: bold;">T</div>
                    </div>
                    
                    <h1 style="color: #1F2937; font-size: 28px; margin-bottom: 20px; text-align: center;">Verify Your Email</h1>
                    
                    <p style="color: #4B5563; font-size: 16px; line-height: 1.6; margin-bottom: 20px; text-align: center;">
                        Your verification code is:
                    </p>
                    
                    <div style="background: linear-gradient(135deg, #7C3AED, #9333EA); padding: 25px; text-align: center; font-size: 36px; font-weight: bold; letter-spacing: 8px; margin: 30px 0; border-radius: 12px; color: white;">
                        ${otp}
                    </div>
                    
                    <p style="color: #9CA3AF; font-size: 14px; text-align: center; margin-bottom: 20px;">
                        This code expires in 5 minutes.
                    </p>
                    
                    <p style="color: #9CA3AF; font-size: 12px; text-align: center; border-top: 1px solid #E5E7EB; padding-top: 20px;">
                        If you didn't request this code, please ignore this email.
                    </p>
                </div>
            `
        };

        console.log('Sending OTP email via Nodemailer to:', email);

        const info = await transporter.sendMail(mailOptions);
        console.log('OTP Email sent successfully:', info.messageId);

        return { success: true, message: 'OTP sent to email successfully' };

    } catch (error) {
        console.error('Nodemailer Email Error:', error.message);
        return {
            success: false,
            message: error.message || 'Failed to send verification code'
        };
    }
};

/**
 * Verify email OTP from in-memory storage
 * @param {string} email - Email address
 * @param {string} otp - OTP entered by user
 * @returns {Promise<{success: boolean, message: string}>}
 */
const verifyEmailOTP = async (email, otp) => {
    try {
        const stored = emailOTPStore.get(email.toLowerCase());

        if (!stored) {
            return { success: false, message: 'OTP not found. Please request a new one.' };
        }

        if (Date.now() > stored.expiresAt) {
            emailOTPStore.delete(email.toLowerCase());
            return { success: false, message: 'OTP has expired. Please request a new one.' };
        }

        if (stored.otp !== otp) {
            return { success: false, message: 'Invalid OTP. Please try again.' };
        }

        // OTP verified - remove from store
        emailOTPStore.delete(email.toLowerCase());
        return { success: true, message: 'Email verified successfully' };

    } catch (error) {
        console.error('Verify Email OTP Exception:', error.message);
        return { success: false, message: 'Failed to verify OTP' };
    }
};

module.exports = {
    sendOTP,
    verifyOTP,
    resendOTP,
    sendEmail,
    sendWelcomeEmail,
    sendSubscriptionEmail,
    sendEmailOTP,
    verifyEmailOTP
};

