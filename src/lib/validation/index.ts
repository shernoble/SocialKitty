import { z } from "zod"

export const SignInValidation = z.object({
    username: z.string().min(2).max(50),
    password:z.string().min(8,{message:"Password should be atleast 8 chars long"}),
    })

export const SignUpValidation = z.object({
    name: z.string().min(2,{message: "Too short"}).max(50),
    username: z.string().min(2).max(50),
    email:z.string().email(),
    password:z.string().min(8,{message:"Password should be atleast 8 chars long"}),
})