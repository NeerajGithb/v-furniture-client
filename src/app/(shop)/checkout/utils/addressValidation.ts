export const VALIDATION_PATTERNS = {
  phone: /^[6-9]\d{9}$/,
  postalCode: /^[1-9][0-9]{5}$/,
  name: /^[a-zA-Z\s]{2,50}$/,
} as const;

export const VALIDATION_MESSAGES = {
  fullName: {
    required: "Full name is required",
    invalid: "Name should contain only letters and spaces (2-50 characters)",
  },
  phone: {
    required: "Phone number is required",
    invalid: "Please enter a valid 10-digit Indian mobile number",
  },
  addressLine1: {
    required: "Address line 1 is required",
    minLength: "Address should be at least 10 characters long",
  },
  city: {
    required: "City is required",
    invalid: "City name should contain only letters and spaces",
  },
  state: {
    required: "State is required",
    invalid: "State name should contain only letters and spaces",
  },
  postalCode: {
    required: "PIN code is required",
    invalid: "Please enter a valid 6-digit PIN code",
  },
} as const;

export const validateField = (fieldName: string, value: string): string => {
  const trimmedValue = value.trim();

  switch (fieldName) {
    case "fullName":
      if (!trimmedValue) return VALIDATION_MESSAGES.fullName.required;
      if (!VALIDATION_PATTERNS.name.test(trimmedValue))
        return VALIDATION_MESSAGES.fullName.invalid;
      break;

    case "phone":
      if (!trimmedValue) return VALIDATION_MESSAGES.phone.required;
      if (!VALIDATION_PATTERNS.phone.test(trimmedValue))
        return VALIDATION_MESSAGES.phone.invalid;
      break;

    case "addressLine1":
      if (!trimmedValue) return VALIDATION_MESSAGES.addressLine1.required;
      if (trimmedValue.length < 10)
        return VALIDATION_MESSAGES.addressLine1.minLength;
      break;

    case "city":
      if (!trimmedValue) return VALIDATION_MESSAGES.city.required;
      if (!VALIDATION_PATTERNS.name.test(trimmedValue))
        return VALIDATION_MESSAGES.city.invalid;
      break;

    case "state":
      if (!trimmedValue) return VALIDATION_MESSAGES.state.required;
      if (!VALIDATION_PATTERNS.name.test(trimmedValue))
        return VALIDATION_MESSAGES.state.invalid;
      break;

    case "postalCode":
      if (!trimmedValue) return VALIDATION_MESSAGES.postalCode.required;
      if (!VALIDATION_PATTERNS.postalCode.test(trimmedValue))
        return VALIDATION_MESSAGES.postalCode.invalid;
      break;

    default:
      break;
  }
  return "";
};