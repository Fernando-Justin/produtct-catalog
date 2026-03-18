import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';

async function main() {
  await prisma.$connect();
  console.log('✅ Banco de dados conectado');

  app.listen(env.PORT, () => {
    console.log(`🚀 API rodando em http://localhost:${env.PORT}`);
  });
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
