import { NotificationType } from '@prisma/client';
import { prisma } from '../lib/prisma';
import { sendEmail } from '../utils/email';

export async function createNotification(
  userId: string,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  sendEmailNotification = true
) {
  const notification = await prisma.notification.create({
    data: { userId, type, title, message, link },
  });

  if (sendEmailNotification) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (user) {
      await sendEmail(user.email, title, `<p>${message}</p>${link ? `<a href="${process.env.FRONTEND_URL}${link}">View Details</a>` : ''}`);
    }
  }

  return notification;
}
