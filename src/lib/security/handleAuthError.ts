/**
 * User-friendly auth error messages
 * Maps backend error codes and messages to customer-facing text
 */

export const handleAuthError = (
  input: string | number,
  resBody: { error?: string } = {},
  setError: (message: string) => void
): void => {
  // Backend error message mapping (from actual API responses)
  const backendErrorMap: Record<string, string> = {
    // Login errors
    'Invalid email or password': 'The email or password you entered is incorrect.',
    'Email and password are required': 'Please enter both email and password.',
    'User not found': 'No account found with this email address.',
    'Invalid access token': 'Your session has expired. Please sign in again.',
    'Access token missing': 'Please sign in to continue.',
    'Please verify your email before logging in': 'Please verify your email address to continue.',
    'Too many failed attempts. Account locked for 30 minutes.': 'Your account has been temporarily locked due to multiple failed login attempts. Please try again in 30 minutes.',
    
    // Registration errors
    'Email is required': 'Please enter your email address.',
    'Missing required user data': 'Please provide all required information.',
    'Slug conflict. Try again.': 'Please try again in a moment.',
    'Password does not meet requirements': 'Your password must be at least 8 characters long and include uppercase, lowercase, number, and special character.',
    
    // Password reset errors
    'Missing email or password': 'Please enter both email and new password.',
    'Email required': 'Please enter your email address.',
    'No user with this email': 'No account found with this email address.',
    'Missing email': 'Please enter your email address.',
    'Missing code': 'Please enter the verification code.',
    'Reset code not set': 'Please request a new password reset code.',
    'Reset code expiry not set': 'Please request a new password reset code.',
    'Invalid reset code': 'The code you entered is incorrect. Please try again.',
    'Reset code has expired': 'This code has expired. Please request a new one.',
    'Failed to save reset code': 'Unable to process your request. Please try again.',
    'Failed to send reset email': 'Unable to send reset email. Please try again.',
    
    // Email verification errors
    'Verification token is required': 'Verification link is invalid.',
    
    // Token/Session errors
    'No refresh token': 'Your session has expired. Please sign in again.',
    
    // Server errors
    'Internal server error': 'Something went wrong on our end. Please try again.',
    'Failed to send verification email': 'Unable to send verification email. Please try again.',
  };

  // HTTP status code mapping
  const statusMap: Record<number, string> = {
    400: 'Please check your information and try again.',
    401: 'Incorrect email or password.',
    403: 'Access denied. Please sign in again.',
    404: 'No account found with this email address.',
    409: 'This email is already registered.',
    422: 'Please check your information and try again.',
    423: 'Your account is temporarily locked. Please try again later.',
    429: 'Too many attempts. Please wait a few minutes and try again.',
    500: 'Something went wrong. Please try again later.',
  };

  // Handle string error (backend error message)
  if (typeof input === 'string') {
    // Check for dynamic rate limit messages (e.g., "Too many attempts. Try again in 5 minutes.")
    if (input.startsWith('Too many attempts.')) {
      setError(input); // Use the message as-is since it includes helpful timing info
      return;
    }
    
    // Check for dynamic account lock messages (e.g., "Account is locked... Try again in 15 minutes.")
    if (input.startsWith('Account is locked')) {
      setError(`Your account has been temporarily locked due to multiple failed login attempts. ${input.split('Try again')[1] || 'Please try again later.'}`);
      return;
    }
    
    const message = backendErrorMap[input] || resBody?.error || 'Something went wrong. Please try again.';
    setError(message);
    return;
  }

  // Handle number error (HTTP status code)
  if (typeof input === 'number') {
    // First try to use backend error message if available
    if (resBody?.error && backendErrorMap[resBody.error]) {
      setError(backendErrorMap[resBody.error]);
      return;
    }
    
    // Fall back to status code mapping
    const message = statusMap[input] || resBody?.error || 'Something went wrong. Please try again.';
    setError(message);
    return;
  }

  // Fallback for unknown error types
  setError('An unexpected error occurred. Please try again.');
};
