const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');

const prismaClient = new PrismaClient();

async function main() {
  // Delete existing data in a specific order due to foreign key constraints
  await prismaClient.gift.deleteMany();
  await prismaClient.giftList.deleteMany();
  await prismaClient.category.deleteMany();

  // Seed categories
  const categories = await Promise.all(
    [
      'Luna de miel', 'Casa', 'Electrodomésticos', 
      'Viajes', 'Gastronomía', 'Aventura', 'Relax', 'Cultura y arte'
    ].map(async (name) => {
      return prismaClient.category.create({
        data: { name } 
      });
    })
  );

  // Seed gift lists without quantity and totalPrice
  const giftLists = await Promise.all(
    categories.map(async (category, index) => {
      return prismaClient.giftList.create({
        data: {
          name: `${category.name} Package`,
          description: faker.lorem.sentences(2),
          isDefault: faker.datatype.boolean(),
          quantity: "0",  // Initial placeholder
          totalPrice: "0",  // Initial placeholder
          categoryId: category.id,
        },
      });
    })
  );

  // Seed gifts and assign to gift lists
  let gifts = [];
  for (let i = 0; i < 50; i++) {
    const randomGiftList = faker.helpers.arrayElement(giftLists);
    const gift = await prismaClient.gift.create({
      data: {
        name: faker.commerce.productName(),
        description: faker.commerce.productDescription(),
        isDefault: faker.datatype.boolean(),
        price: faker.number.int({ min: 89000, max: 1820000 }).toString(),
        giftListId: randomGiftList.id,
        categoryId: randomGiftList.categoryId,
      },
    });
    gifts.push(gift);
  }

  // Update gift lists with calculated quantity and totalPrice
  for (let giftList of giftLists) {
    const giftsForList = gifts.filter(gift => gift.giftListId === giftList.id);
    const totalPrice = giftsForList.reduce((acc, curr) => acc + Number(curr.price), 0);
    await prismaClient.giftList.update({
      where: { id: giftList.id },
      data: {
        quantity: giftsForList.length.toString(),
        totalPrice: totalPrice.toString(),
      },
    });
  }

  console.log('Database has been seeded. 🌱');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prismaClient.$disconnect();
  });
