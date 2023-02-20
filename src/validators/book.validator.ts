import {object, string, number} from 'yup';

const searches = ['language', 'title', 'author', 'subject'];

export const searchBookSchema = object({
    search: string().required('Search field is required').test({
        name: 'Test-Search',
        message: 'Search string do not match the criteria',
        test(value) {
            if(!value) {
                return false;
            }
            const [field, text] = value.split(':');
            if(field && text) {
                return searches.includes(field)
            }
            return true;
        }
    }),
    limit: number().default(20),
    page: number().default(1),
    sort: string().optional()
})

export const createBookSchema = object({
    key: string().required('Book key is required'),
    first_publish_year: string().required('Book year of publication is required')
})

export const updateBookSchema = object({
    rating: string().when('review', {
        is: (key?: string) => Boolean(key) === true,
        then: (schema) => schema.optional(),
        otherwise: (schema) => schema.required('Add a rating for this book')
    }),
    review: string()
})

