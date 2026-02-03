// Validate email format using regex pattern
export const isValidEmail = (email: string): boolean => {
  return typeof email === "string" && /^\S+@\S+\.\S+$/.test(email.trim());
};

// Validate password minimum length (6 characters)
export const isValidPassword = (password: string): boolean => {
  return typeof password === "string" && password.length >= 6;
};

// Validate name is not empty and within character limit
export const isValidName = (name: string): boolean => {
  return (
    typeof name === "string" && name.trim().length > 0 && name.length <= 60
  );
};

// Validate Indian phone number format (10 digits starting with 6-9)
export const isValidPhone = (phone: string): boolean => {
  return (
    typeof phone === "string" && /^[6-9]\d{9}$/.test(phone.replace(/\s+/g, ""))
  );
};

// File validation constants
export const VALID_IMAGE_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];
export const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// Validate single image file (type and size)
export const validateImageFile = (
  file: File,
): { valid: boolean; error?: string } => {
  if (!VALID_IMAGE_TYPES.includes(file.type)) {
    return {
      valid: false,
      error: `Invalid file type: ${file.type}. Please use JPG, PNG, GIF, or WebP.`,
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      valid: false,
      error: `File too large: ${(file.size / 1024 / 1024).toFixed(1)}MB. Maximum size is 5MB.`,
    };
  }

  return { valid: true };
};

// Validate multiple image files (count, type, and size)
export const validateImageFiles = (
  files: FileList | File[],
): { valid: boolean; error?: string } => {
  const fileArray = Array.from(files);

  if (fileArray.length === 0) {
    return { valid: false, error: "No files selected" };
  }

  if (fileArray.length > 5) {
    return { valid: false, error: "Maximum 5 images allowed" };
  }

  for (const file of fileArray) {
    const validation = validateImageFile(file);
    if (!validation.valid) {
      return validation;
    }
  }

  return { valid: true };
};

// Convert file to base64 string for upload
export const fileToBase64 = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      if (reader.result) resolve(reader.result as string);
      else reject(new Error(`Failed to read file: ${file.name}`));
    };
    reader.onerror = () =>
      reject(new Error(`Failed to read file: ${file.name}`));
    reader.readAsDataURL(file);
  });
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

// Validate complete user data object and return all errors
export const validateUserData = ({
  name,
  email,
  password,
  phone,
}: UserData): ValidationErrors => {
  const errors: ValidationErrors = {};

  if (!isValidName(name)) errors.name = "Name is required (max 60 chars)";
  if (!isValidEmail(email)) errors.email = "Invalid email address";
  if (!isValidPassword(password))
    errors.password = "Password must be at least 6 characters";
  if (phone && !isValidPhone(phone)) errors.phone = "Invalid phone number";

  return errors;
};
