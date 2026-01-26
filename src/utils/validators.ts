export const isValidEmail = (email: string): boolean => {
  return typeof email === 'string' && /^\S+@\S+\.\S+$/.test(email.trim());
};

export const isValidPassword = (password: string): boolean => {
  return typeof password === 'string' && password.length >= 6;
};

export const isValidName = (name: string): boolean => {
  return typeof name === 'string' && name.trim().length > 0 && name.length <= 60;
};

export const isValidPhone = (phone: string): boolean => {
  return typeof phone === 'string' && /^[6-9]\d{9}$/.test(phone.trim());
};

interface UserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface ValidationErrors {
  name?: string;
  email?: string;
  password?: string;
  phone?: string;
}

export const validateUserData = ({ name, email, password, phone }: UserData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!isValidName(name)) errors.name = 'Name is required (max 60 chars)';
  if (!isValidEmail(email)) errors.email = 'Invalid email address';
  if (!isValidPassword(password)) errors.password = 'Password must be at least 6 characters';
  if (phone && !isValidPhone(phone)) errors.phone = 'Invalid phone number';

  return errors;
};