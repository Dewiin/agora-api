import { prisma } from "@/config/prismaClient"
import { body } from "express-validator"

const usernameValidator = body("username")
    .trim()
    .isLength({min: 1, max: 20})
    .withMessage(`Username must be between 1 to 20 characters.`)

const passwordValidator = body("password")
    .isLength({min: 8, max: 512})
    .withMessage(`Password must be between 8 to 512 characters.`)
    .matches(/^[\P{Cc}\P{Cn}\P{Cs}]+$/gu)
    .withMessage(`Password can only contain printable characters.`)

const validateSignup = [
    body("firstName")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage(`First name must be between 1 to 20 characters.`),
    body("lastName")
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage(`Last name must be between 1 to 20 characters.`),
    usernameValidator
    .custom(async (value) => {
        const user = await prisma.user.findUnique({
            where: { username: value }
        });
        if(user) throw new Error("Username already in use!")
    }),
    passwordValidator
]

const validateLogin = [
    usernameValidator,
    passwordValidator
]

export const authValidator = {
    validateSignup,
    validateLogin,
}
