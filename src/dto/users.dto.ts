import { z } from "zod";

const RegisterUserDTO = z.object({
  body: z
    .object({
      email: z.string().email(),
      password: z.string().min(6).max(20),
    })
    .strict(),
});

export { RegisterUserDTO };

export type RegisterUserType = z.infer<typeof RegisterUserDTO.shape.body>;
