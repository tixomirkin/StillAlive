import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const user = await prisma.user.upsert({
    where: { email: 'demo@stillalive.dev' },
    update: {},
    create: {
      email: 'demo@stillalive.dev',
      name: 'Demo User',
    },
  });

  const monitor1 = await prisma.monitor.create({
    data: {
      userId: user.id,
      name: 'Google',
      type: 'HTTP',
      url: 'https://google.com',
      interval: 300,
      timeout: 30,
      httpMethod: 'GET',
      expectedStatusCode: 200,
    },
  });

  const monitor2 = await prisma.monitor.create({
    data: {
      userId: user.id,
      name: 'GitHub',
      type: 'HTTP',
      url: 'https://github.com',
      interval: 300,
      timeout: 30,
      httpMethod: 'GET',
      expectedStatusCode: 200,
    },
  });

  const monitor3 = await prisma.monitor.create({
    data: {
      userId: user.id,
      name: 'JSON Placeholder API',
      type: 'HTTP',
      url: 'https://jsonplaceholder.typicode.com/todos/1',
      interval: 300,
      timeout: 30,
      httpMethod: 'GET',
      expectedStatusCode: 200,
    },
  });

  await prisma.checkResult.createMany({
    data: [
      {
        monitorId: monitor1.id,
        status: 'UP',
        statusCode: 200,
        responseTime: 120,
      },
      {
        monitorId: monitor2.id,
        status: 'UP',
        statusCode: 200,
        responseTime: 150,
      },
      {
        monitorId: monitor3.id,
        status: 'UP',
        statusCode: 200,
        responseTime: 80,
      },
    ],
  });

  console.log('Seed completed successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
