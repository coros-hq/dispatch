import z from "zod"

const signInSchema = z.object({
  email: z.email("Please Enter a valid email address"),
  password: z.string().min(8, "Password must be at least 8 characters long").max(100)
})

const signUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  email: z.email('Please enter a valid email address.'),
  password: z.string().min(8, 'Password must be at least 8 characters.'),
  confirmPassword: z.string(),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match.',
  path: ['confirmPassword'],
})

const forgotPasswordSchema = z.object({
  email: z.email('Please enter a valid email address.'),
})

const resetPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters."),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match.",
    path: ["confirmPassword"],
  });

export { signInSchema, signUpSchema, forgotPasswordSchema, resetPasswordSchema }
