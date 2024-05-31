import { checkSchema } from 'express-validator';

export const signupValidator = checkSchema({
    username: {
        in: ['body'],
        trim: true,
        isString: {
            errorMessage: "Invalid Username!"
        },
        notEmpty: {
            errorMessage: "Username is required"
        },
        isLength: {
            options: { min: 6 },
            errorMessage: 'Username must be at least 6 characters long',
        }
    },
    password: {
        in: ['body'],
        isString: {
            errorMessage: "Invalid Password!"
        },
        notEmpty: {
            errorMessage: "Password is required"
        },
        isLength: {
            options: { min: 6 },
            errorMessage: 'Password must be at least 6 characters long',
        }
    }
});

export const createTaskValidator = checkSchema({
    taskName: {
        in: ['body'],
        trim: true,
        isString: {
            errorMessage: "Invalid task name!"
        },
        notEmpty: {
            errorMessage: "task name is required"
        }
    }
});

export const updateTaskValidator = checkSchema({
    status: {
        in: ['body'],
        trim: true,
        isString: {
            errorMessage: "Invalid status!"
        },
        notEmpty: {
            errorMessage: "task status is required"
        },
        custom:{
            options: (value, { req }) =>{
                if (value !== "DONE" && value !== "ACTIVE")
                    throw new Error("Invalid status")
                return true;
            }
        }
    }
});
