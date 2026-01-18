const axios = require('axios');

const MSG91_AUTH_KEY = process.env.MSG91_AUTH_KEY;
const MSG91_TEMPLATE_ID = process.env.MSG91_TEMPLATE_ID;

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

        // Ensure phone number is in correct format (remove + if present)
        const formattedPhone = phoneNumber.replace(/^\+/, '');

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
                    'Content-Type': 'application/json'
                }
            }
        );

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

module.exports = {
    sendOTP,
    verifyOTP,
    resendOTP
};
