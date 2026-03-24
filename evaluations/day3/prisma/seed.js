require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const adminPassword = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD || 'Admin1234', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@bibliotheque.fr' },
    update: {},
    create: {
      nom: 'Administrateur',
      email: 'admin@bibliotheque.fr',
      password: adminPassword,
      role: 'admin',
    },
  });

  const userPassword = await bcrypt.hash(process.env.SEED_USER_PASSWORD || 'User1234', 12);
  await prisma.user.upsert({
    where: { email: 'user@bibliotheque.fr' },
    update: {},
    create: {
      nom: 'Utilisateur Test',
      email: 'user@bibliotheque.fr',
      password: userPassword,
      role: 'user',
    },
  });

  const livres = [
    { titre: 'Node.js en action', auteur: 'Mike Cantelon', annee: 2017, genre: 'Informatique' },
    { titre: 'Clean Code', auteur: 'Robert C. Martin', annee: 2008, genre: 'Informatique' },
    { titre: 'Le Petit Prince', auteur: 'Antoine de Saint-Exupéry', annee: 1943, genre: 'Roman' },
    { titre: 'Dune', auteur: 'Frank Herbert', annee: 1965, genre: 'Science-Fiction' },
    { titre: 'Sapiens', auteur: 'Yuval Noah Harari', annee: 2011, genre: 'Histoire' },
  ];

  for (const livre of livres) {
    await prisma.livre.upsert({
      where: { id: livres.indexOf(livre) + 1 },
      update: {},
      create: livre,
    });
  }

  console.log(`Seed terminé — admin@bibliotheque.fr / ${process.env.SEED_ADMIN_PASSWORD || 'Admin1234'}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
