import { z } from "zod";

export const forgotPasswordZodValidation = z.object({
  email: z.email({ message: "Invalid email format!" }),
});
