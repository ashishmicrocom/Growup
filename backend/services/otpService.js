import crypto from 'crypto';

/**
 * Generate a 6-digit OTP
 * If SMTP is not configured or USE_DEFAULT_OTP is enabled, returns default OTP '000000'
 */
export const generateOTP = () => {
  // Use default OTP when explicitly enabled OR when SMTP is not configured
  if (process.env.USE_DEFAULT_OTP === 'true' || !process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.log('Using default OTP: 000000');
    return '000000';
  }
  return crypto.randomInt(100000, 999999).toString();
};

/**
 * Get OTP expiry time (10 minutes from now)
 */
export const getOTPExpiry = () => {
  return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

/**
 * Verify if OTP is valid and not expired
 */
export const verifyOTP = (storedOTP, storedExpiry, providedOTP) => {
  if (!storedOTP || !storedExpiry || !providedOTP) {
    return { valid: false, message: 'OTP not found or invalid' };
  }

  if (new Date() > new Date(storedExpiry)) {
    return { valid: false, message: 'OTP has expired. Please request a new one.' };
  }

  if (storedOTP !== providedOTP) {
    return { valid: false, message: 'Invalid OTP. Please check and try again.' };
  }

  return { valid: true, message: 'OTP verified successfully' };
};

/**
 * Hash OTP before storing in database
 */
export const hashOTP = (otp) => {
  return crypto.createHash('sha256').update(otp).digest('hex');
};
