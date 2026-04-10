// prisma/seed.js
import { PrismaClient } from '@prisma/client';
import { hashPassword } from '../src/utils/password.js';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Запуск seed...');

  // Admin
  const adminEmail = process.env.ADMIN_EMAIL || 'admin@perechyn-hospital.gov.ua';
  const existing = await prisma.user.findUnique({ where: { email: adminEmail } });

  if (!existing) {
    const hashed = await hashPassword(process.env.ADMIN_PASSWORD || 'Admin@12345');
    await prisma.user.create({
      data: {
        email: adminEmail,
        password: hashed,
        name: process.env.ADMIN_NAME || 'Адміністратор Системи',
        role: 'ADMIN',
      },
    });
    console.log(`✅ Admin: ${adminEmail} / Admin@12345`);
  } else {
    console.log(`⚠️  Admin вже існує: ${adminEmail}`);
  }

  // Registrar
  const registrarEmail = 'registry@perechyn-hospital.gov.ua';
  const existingRegistrar = await prisma.user.findUnique({ where: { email: registrarEmail } });
  if (!existingRegistrar) {
    const hashed = await hashPassword('Registry@12345');
    await prisma.user.create({
      data: {
        email: registrarEmail,
        password: hashed,
        name: 'Реєстратура Системи',
        role: 'REGISTRAR',
      },
    });
    console.log(`✅ Registrar: ${registrarEmail} / Registry@12345`);
  }

  // Test users
  const userEmail = 'user@example.com';
  const existingUser = await prisma.user.findUnique({ where: { email: userEmail } });

  let testUser = existingUser;
  if (!existingUser) {
    const hashed = await hashPassword('User@12345');
    testUser = await prisma.user.create({
      data: {
        email: userEmail,
        password: hashed,
        name: 'Петренко Олена Василівна',
        role: 'USER',
      },
    });
    console.log(`✅ User: ${userEmail} / User@12345`);
  }

  // Test requests
  if (testUser) {
    const count = await prisma.request.count({ where: { userId: testUser.id } });
    if (count === 0) {
      await prisma.request.createMany({
        data: [
          { userId: testUser.id, title: 'Запит на направлення до кардіолога', description: 'Прошу видати направлення до кардіолога. Маю скарги на серцебиття.', status: 'NEW' },
          { userId: testUser.id, title: 'Скарга на час очікування', description: 'Чекала на прийом більше трьох годин без пояснень.', status: 'IN_PROGRESS' },
          { userId: testUser.id, title: 'Пропозиція — онлайн запис', description: 'Пропоную впровадити онлайн-запис до лікарів через сайт лікарні.', status: 'DONE' },
        ],
      });
      console.log('✅ Тестові звернення першого пацієнта створені');
    }
  }

  // Test user 2
  const user2Email = 'patient2@example.com';
  const existingUser2 = await prisma.user.findUnique({ where: { email: user2Email } });
  let testUser2 = existingUser2;
  if (!existingUser2) {
    const hashed = await hashPassword('Patient@12345');
    testUser2 = await prisma.user.create({
      data: {
        email: user2Email,
        password: hashed,
        name: 'Іванов Іван Іванович',
        role: 'USER',
      },
    });
    console.log(`✅ User 2: ${user2Email} / Patient@12345`);
  }

  if (testUser2) {
    const count2 = await prisma.request.count({ where: { userId: testUser2.id } });
    if (count2 === 0) {
      await prisma.request.createMany({
        data: [
          { userId: testUser2.id, title: 'Біль у спині', description: 'Турбують сильні болі в попереку вже 3 дні.', status: 'NEW' },
          { userId: testUser2.id, title: 'Довідка в басейн', description: 'Потрібна медична довідка для відвідування басейну.', status: 'DONE' },
        ],
      });
      console.log('✅ Тестові звернення другого пацієнта створені');
    }
  }

  // Specialties
  console.log('🌱 Створення спеціальностей та лікарів...');
  const specialtiesData = [
    { nameUA: 'Терапія', nameEN: 'Therapy' },
    { nameUA: 'Кардіологія', nameEN: 'Cardiology' },
    { nameUA: 'Хірургія', nameEN: 'Surgery' },
    { nameUA: 'Педіатрія', nameEN: 'Pediatrics' },
    { nameUA: 'Неврологія', nameEN: 'Neurology' },
  ];

  for (const s of specialtiesData) {
    const specialty = await prisma.specialty.upsert({
      where: { id: s.nameEN.toLowerCase() }, // Using EN name as stable ID for seed
      update: {},
      create: { 
        id: s.nameEN.toLowerCase(),
        nameUA: s.nameUA, 
        nameEN: s.nameEN 
      },
    });

    // Create a doctor for each specialty if they don't exist
    const doctorCount = await prisma.user.count({ where: { specialtyId: specialty.id, role: 'DOCTOR' } });
    if (doctorCount === 0) {
      const email = `doctor.${specialty.id}@perechyn-hospital.gov.ua`;
      const hashed = await hashPassword('Doctor@12345');
      await prisma.user.create({
        data: {
          email,
          password: hashed,
          role: 'DOCTOR',
          name: s.nameEN === 'Therapy' ? 'Ковач Іван Петрович' : 
                s.nameEN === 'Cardiology' ? 'Сидоренко Ганна Миколаївна' :
                s.nameEN === 'Surgery' ? 'Бережний Олексій Вікторович' :
                s.nameEN === 'Pediatrics' ? 'Ткаченко Марія Іванівна' :
                'Григоренко Петро Сергійович',
          photoUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(s.nameUA)}&background=random&size=400`,
          specialtyId: specialty.id,
          bioUA: `Досвідчений спеціаліст у галузі ${s.nameUA.toLowerCase()}. Стаж роботи понад 15 років. Автор численних наукових праць.`,
          bioEN: `Experienced specialist in ${s.nameEN.toLowerCase()}. Over 15 years of practice. Author of numerous scientific papers.`,
        }
      });
    }
  }

  await prisma.log.create({ data: { action: 'SEED_COMPLETED', userId: null } });
  console.log('🎉 Seed завершено!');
}

main()
  .catch((e) => { console.error('❌ Seed помилка:', e); process.exit(1); })
  .finally(() => prisma.$disconnect());
