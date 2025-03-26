import { PASSWORD_REGEX, VALIDATION_ERRORS } from '@/constants/auth-screen.const.ts';
import { Rule } from 'antd/es/form';

export const AuthFormValidationRules = {
    username: [
        { required: true, message: VALIDATION_ERRORS.required },
        { min: 4, message: VALIDATION_ERRORS.usernameLength },
    ],
    email: [
        { required: true, message: VALIDATION_ERRORS.required },
        { type: 'email', message: VALIDATION_ERRORS.emailInvalid },
    ],
    password: [
        { required: true, message: VALIDATION_ERRORS.required },
        { pattern: PASSWORD_REGEX, message: VALIDATION_ERRORS.passwordStrength },
    ],
    picture: [
        {
            validator: (_: unknown, value: unknown) =>
                value ? Promise.resolve() : Promise.reject(new Error(VALIDATION_ERRORS.pictureRequired)),
        },
    ],
} satisfies Record<string, Rule[]>;

export const UpdateUserValidationRules = {
    username: [{ min: 4, message: VALIDATION_ERRORS.usernameLength }],
    email: [{ type: 'email', message: VALIDATION_ERRORS.emailInvalid }],
} satisfies Record<string, Rule[]>;
