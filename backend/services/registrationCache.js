// Temporary in-memory storage for pending registrations
// In production, consider using Redis for distributed systems
const pendingRegistrations = new Map();

// Clean up expired registrations every 15 minutes
setInterval(() => {
  const now = Date.now();
  for (const [email, data] of pendingRegistrations.entries()) {
    if (now > data.expiresAt) {
      pendingRegistrations.delete(email);
    }
  }
}, 15 * 60 * 1000);

/**
 * Store pending registration data temporarily
 */
export const storePendingRegistration = (email, registrationData, otp, otpExpiry) => {
  pendingRegistrations.set(email, {
    ...registrationData,
    otp,
    otpExpiry,
    expiresAt: Date.now() + 30 * 60 * 1000 // 30 minutes
  });
};

/**
 * Get pending registration data
 */
export const getPendingRegistration = (email) => {
  return pendingRegistrations.get(email);
};

/**
 * Remove pending registration data
 */
export const removePendingRegistration = (email) => {
  pendingRegistrations.delete(email);
};

/**
 * Check if email has pending registration
 */
export const hasPendingRegistration = (email) => {
  return pendingRegistrations.has(email);
};
