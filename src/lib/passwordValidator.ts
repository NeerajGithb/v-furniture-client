// Password strength validation

export interface PasswordValidation {
  valid: boolean;
  errors: string[];
  strength: "weak" | "medium" | "strong";
}

export function validatePassword(password: string): PasswordValidation {
  const errors: string[] = [];
  let strength: "weak" | "medium" | "strong" = "weak";

  // Minimum length
  if (password.length < 8) {
    errors.push("Password must be at least 8 characters long");
  }

  // Maximum length
  if (password.length > 128) {
    errors.push("Password must not exceed 128 characters");
  }

  // Must contain uppercase
  if (!/[A-Z]/.test(password)) {
    errors.push("Password must contain at least one uppercase letter");
  }

  // Must contain number
  if (!/\d/.test(password)) {
    errors.push("Password must contain at least one number");
  }

  // Must contain special character
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Password must contain at least one special character");
  }

  // Calculate strength
  if (errors.length === 0) {
    let score = 0;

    if (password.length >= 12) score++;
    if (password.length >= 16) score++;
    if (/[a-z]/.test(password) && /[A-Z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) score++;

    if (score >= 4) {
      strength = "strong";
    } else if (score >= 2) {
      strength = "medium";
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    strength,
  };
}

export function getPasswordStrengthColor(
  strength: "weak" | "medium" | "strong",
): string {
  switch (strength) {
    case "weak":
      return "#ef4444"; // red
    case "medium":
      return "#f59e0b"; // orange
    case "strong":
      return "#22c55e"; // green
  }
}

export function getPasswordStrengthText(
  strength: "weak" | "medium" | "strong",
): string {
  switch (strength) {
    case "weak":
      return "Weak";
    case "medium":
      return "Medium";
    case "strong":
      return "Strong";
  }
}
