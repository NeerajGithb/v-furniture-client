export const formatEmail = (email: string): string => {
  return typeof email === 'string' ? email.trim().toLowerCase() : '';
};

export const formatName = (name: string): string => {
  if (typeof name !== 'string') return '';
  return name
    .trim()
    .split(' ')
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
};

export const formatPhone = (phone: string): string => {
  return typeof phone === 'string' ? phone.trim().replace(/\D/g, '') : '';
};

export const formatPassword = (password: string): string => {
  return typeof password === 'string' ? password.trim() : '';
};

interface UserDataInput {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

interface FormattedUserData {
  name: string;
  email: string;
  password: string;
  phone?: string;
}

export const formatUserData = ({ name, email, password, phone }: UserDataInput): FormattedUserData => {
  return {
    name: formatName(name),
    email: formatEmail(email),
    password: formatPassword(password),
    phone: phone ? formatPhone(phone) : undefined,
  };
};