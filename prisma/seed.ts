// prisma/seed.ts

import { PrismaClient, Role } from '@prisma/client';
import argon2 from 'argon2'; // Import Argon2 for password hashing

const prisma = new PrismaClient();

async function main() {
  const defaultGroupName = "Test";

  // 1. Ensure the "Test" group exists
  let testGroup = await prisma.group.findUnique({
    where: { name: defaultGroupName },
  });

  if (!testGroup) {
    testGroup = await prisma.group.create({
      data: {
        name: defaultGroupName,
      },
    });
    console.log(`Group "${defaultGroupName}" created.`);
  } else {
    console.log(`Group "${defaultGroupName}" already exists.`);
  }

  // 2. Create an Admin User (Optional)
  const adminEmail = "admin@example.com";

  const existingAdmin = await prisma.user.findUnique({
    where: { email: adminEmail },
  });

  if (!existingAdmin) {
    const hashedPassword = await argon2.hash("adminpassword123"); // Replace with a secure password

    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashedPassword,
        firstName: "Admin",
        lastName: "User",
        role: Role.admin, // Assigning admin role
        group: {
          connect: { id: testGroup.id },
        },
        // Initialize other fields as needed
      },
    });

    console.log(`Admin user "${adminEmail}" created.`);
  } else {
    console.log(`Admin user "${adminEmail}" already exists.`);
  }

  // 3. Create Sample Learner Users (Optional)
  const sampleUsers = [
    {
      email: "learner1@example.com",
      password: "learnerpassword1",
      firstName: "Learner",
      lastName: "One",
    },
    {
      email: "learner2@example.com",
      password: "learnerpassword2",
      firstName: "Learner",
      lastName: "Two",
    },
    // Add more users as needed
  ];

  for (const userData of sampleUsers) {
    const existingUser = await prisma.user.findUnique({
      where: { email: userData.email },
    });

    if (!existingUser) {
      const hashedPassword = await argon2.hash(userData.password);

      await prisma.user.create({
        data: {
          email: userData.email,
          password: hashedPassword,
          firstName: userData.firstName,
          lastName: userData.lastName,
          role: Role.learner, // Assigning learner role
          group: {
            connect: { id: testGroup.id },
          },
          // Initialize other fields as needed
        },
      });

      console.log(`Learner user "${userData.email}" created.`);
    } else {
      console.log(`Learner user "${userData.email}" already exists.`);
    }
  }

  // 4. Additional Setup (Optional)
  // You can add more groups or users here following the same pattern
}

main()
  .catch((e) => {
    console.error("Error seeding the database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
