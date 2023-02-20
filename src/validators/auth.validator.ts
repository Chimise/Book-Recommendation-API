import {object, string, ref} from 'yup';

export const registerSchema = object({
    full_name: string().required('Full name is required'),
    email: string().email('Enter a valid email').required('Email is required'),
    password: string().min(5, 'Password should be at least five characters').required('Password is required')
})

export const updatePasswordSchema = object({
    password: string().min(5, 'Password must be at least five characters').required('Password is required'),
    confirmPassword: string().required('Confirm password field is required').test('confirmPassword', 'Passwords do not match', function (value, context) {
        return value === this.parent.password;
    }),
    token: string().required('Token field is required')
})