export const PASSWORD_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[A-Za-z\d@$!%*?&]{8,}$/;

export const VALIDATION_ERRORS = {
    required: 'This field is required',
    usernameLength: 'Username must be at least 4 characters',
    emailInvalid: 'Invalid email format',
    passwordStrength:
        'Password must be at least 8 characters, include at least one uppercase letter, one lowercase letter, and one number',
    pictureRequired: 'Please upload a profile picture',
};
