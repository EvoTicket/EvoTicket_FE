/**
 * Common validation utilities for the application.
 */

/**
 * Validates if a string is a valid email address.
 */
export const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email.trim());
};

/**
 * Validates if a string is a valid Vietnamese phone number.
 * Supports prefixes: 03, 05, 07, 08, 09 or 84 equivalent.
 */
export const isValidPhone = (phone: string): boolean => {
    const phoneRegex = /^(84|0[3|5|7|8|9])[0-9]{8}$/;
    return phoneRegex.test(phone.trim());
};

/**
 * Validates if a full name is valid.
 * Requires at least 2 characters after trimming.
 */
export const isValidFullName = (name: string): boolean => {
    return name.trim().length >= 2;
};

/**
 * Validates if a string is a valid Vietnamese tax code.
 * Standard formats: 10 digits or 10 digits followed by a hyphen and 3 digits.
 */
export const isValidTaxCode = (taxCode: string): boolean => {
    const taxCodeRegex = /^(\d{10}|\d{10}-\d{3})$/;
    return taxCodeRegex.test(taxCode.trim());
};

/**
 * Validates if a string is a valid website URL.
 */
export const isValidWebsite = (url: string): boolean => {
    const urlRegex = /^(https?:\/\/)[^\s/$.?#].[^\s]*$/i;
    return urlRegex.test(url.trim());
};
