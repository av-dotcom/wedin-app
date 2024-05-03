'use server';

import prisma from '@/db/client';
import { sendPasswordResetEmail } from '@/lib/mail';
import { generatePasswordResetToken } from '@/lib/tokens';
import { PasswordResetSchema } from '@/schemas';
import * as z from 'zod';

export const passwordReset = async (
  values: z.infer<typeof PasswordResetSchema>
) => {
  const validatedFields = PasswordResetSchema.safeParse(values);

  if (!validatedFields.success) {
    return { error: 'Campos inválidos' };
  }

  if (validatedFields.success) {
    const { email } = validatedFields.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (!existingUser) {
      return { error: 'No hay una cuenta asociada a este email' };
    }

    let passwordResetToken;

    try {
      passwordResetToken = await generatePasswordResetToken(email);
      // catch errors
    } catch (error) {
      return { error: 'Error generando token de recuperación de contraseña' };
    }

    try {
      const response = await sendPasswordResetEmail(
        passwordResetToken.email,
        passwordResetToken.token
      );
      console.log(response);
    } catch (error) {
      return {
        error: 'Error enviando el correo de recuperación de contraseña',
      };
    }
  }
};
