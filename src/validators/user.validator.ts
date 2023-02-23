import {object, string, number} from 'yup';

export const updateUserSchema = object({
    full_name: string().when('password', {is: (val: string | undefined) => Boolean(val),
        then: schema => schema.optional(),
        otherwise: schema => schema.required('Full name is required')
    }),
    password: string().min(5, 'Password must be at least five characters'),
    confirmPassword: string().test('confirmPassword', 'Passwords do not match', function (value, context) {
        return value === this.parent.password;
    }),
})

