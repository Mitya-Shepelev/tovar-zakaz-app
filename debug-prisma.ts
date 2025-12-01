
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  try {
    const user = await prisma.user.findFirst();
    if (!user) {
      console.log('No user found');
      return;
    }

    console.log('Found user:', user.id);

    const deal = await prisma.deal.create({
      data: {
        userId: user.id,
        date: new Date(),
        clients: {
          create: [
            {
              name: "Test Client",
              phone: "1234567890",
              orderAmount: 100.0,
              totalItems: 1,
              calculatorItems: [
                { id: "123", name: "Test Item", price: 100.0 }
              ]
            }
          ]
        },
      },
      include: {
        clients: true,
      },
    });

    console.log('Deal created successfully:', JSON.stringify(deal, null, 2));
  } catch (e) {
    console.error('Error creating deal:', e);
  } finally {
    await prisma.$disconnect();
  }
}

main();
