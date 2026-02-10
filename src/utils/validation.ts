export const validateEmail = (email: string): boolean => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateSriLankanPhone = (phone: string): boolean => {
  // Accepts: +94771234567, 0771234567, 771234567
  // Removes spaces, dashes before checking
  const cleanPhone = phone.replace(/[\s-]/g, '');
  // Regex for SL mobile: Optional (+94 or 0) followed by 7 and 8 digits
  const re = /^(?:\+94|0)?7[0-9]{8}$/;
  return re.test(cleanPhone);
};

export const validateNIC = (nic: string): boolean => {
  // Old format: 9 digits + V/X (case insensitive)
  const oldFormat = /^[0-9]{9}[vVxX]$/;
  // New format: 12 digits
  const newFormat = /^[0-9]{12}$/;
  return oldFormat.test(nic) || newFormat.test(nic);
};

export const validatePassword = (password: string): boolean => {
  // At least 8 chars, mixed case (upper & lower), at least 1 number
  if (password.length < 8) return false;
  if (!/[a-z]/.test(password)) return false;
  if (!/[A-Z]/.test(password)) return false;
  if (!/[0-9]/.test(password)) return false;
  return true;
};

export interface PasswordRequirement {
  id: string;
  label: string;
  met: boolean;
}

export const getPasswordRequirements = (
password: string)
: PasswordRequirement[] => {
  return [
  {
    id: 'length',
    label: 'At least 8 characters',
    met: password.length >= 8
  },
  {
    id: 'mixed-case',
    label: 'Contains uppercase & lowercase letters',
    met: /[a-z]/.test(password) && /[A-Z]/.test(password)
  },
  {
    id: 'number',
    label: 'Contains at least one number',
    met: /[0-9]/.test(password)
  }];

};