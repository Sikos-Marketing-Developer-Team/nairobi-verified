/**
 * Validates an email address
 * @param email The email address to validate
 * @returns True if the email is valid, false otherwise
 */
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Validates a password
 * @param password The password to validate
 * @returns True if the password is valid, false otherwise
 */
export const validatePassword = (password: string): boolean => {
  // Password must be at least 8 characters long and contain at least one uppercase letter,
  // one lowercase letter, one number, and one special character
  const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
  return passwordRegex.test(password);
};

/**
 * Checks if a user has a specific role
 * @param userRole The user's role
 * @param requiredRoles The roles to check against
 * @returns True if the user has one of the required roles, false otherwise
 */
export const hasPermission = (userRole: string, requiredRoles: string | string[]): boolean => {
  if (!userRole) {
    return false;
  }
  
  // If requiredRoles is a string, convert it to an array
  const roles = Array.isArray(requiredRoles) ? requiredRoles : [requiredRoles];
  
  return roles.includes(userRole);
};