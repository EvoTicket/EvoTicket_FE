/**
 * Common validation utilities for the application.
 */

/**
 * Validates if a string is a valid email address.
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email.trim());
};

/**
 * Validates if a string is a valid Vietnamese phone number.
 * Supports prefixes: 03, 05, 07, 08, 09 or 84 equivalent.
 */
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
    return phoneRegex.test(phone.trim());
};

/**
 * Validates if a full name is valid.
 * Requires at least 2 characters after trimming.
 */
export const isValidFullName = (name: string): boolean => {
    return name.trim().length >= 2;
};
