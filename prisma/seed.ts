import { PrismaClient, UserRole } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Iniciando o seeding do banco de dados (Estrutura Real Mínima)...');

  // 1. Criar Tenant demonstrativo real inicial
  const tenant = await prisma.tenant.upsert({
    where: { cnpj: '12345678000199' },
    update: {},
    create: {
      nome: 'Empresa Demo Distribuidora LTDA',
      cnpj: '12345678000199',
      ativo: true,
    },
  });

  console.log(`✅ Tenant criado/verificado: ${tenant.nome} (${tenant.id})`);

  // 2. Criar Usuário Admin inicial do Tenant
  const senhaHash = await bcrypt.hash('admin123', 12);
  const user = await prisma.user.upsert({
    where: { email: 'admin@empresa.com.br' },
    update: {},
    create: {
      tenantId: tenant.id,
      nome: 'Administrador Sistema',
      email: 'admin@empresa.com.br',
      senhaHash,
      role: UserRole.TENANT_ADMIN,
      ativo: true,
    },
  });

  console.log(`✅ Usuário Admin criado/verificado: ${user.email}`);

  // 3. Criar Palavras-Chave de Interesse Iniciais (se não existirem)
  const termosInteresse = [
    { termo: 'água mineral', ufs: ['SP', 'RJ', 'MG'] },
    { termo: 'gás GLP', ufs: ['SP'] },
    { termo: 'botijão P13', ufs: [] },
  ];

  for (const item of termosInteresse) {
    const existe = await prisma.termoInteresse.findFirst({
      where: { tenantId: tenant.id, termo: item.termo },
    });
    if (!existe) {
      await prisma.termoInteresse.create({
        data: {
          tenantId: tenant.id,
          termo: item.termo,
          ufs: item.ufs,
          ativo: true,
        },
      });
    }
  }

  // 4. Criar Palavras de Exclusão Negativa (se não existirem)
  const termosExclusao = ['locação', 'manutenção', 'medicinal'];
  for (const termo of termosExclusao) {
    const existe = await prisma.termoExclusao.findFirst({
      where: { tenantId: tenant.id, termo },
    });
    if (!existe) {
      await prisma.termoExclusao.create({
        data: {
          tenantId: tenant.id,
          termo,
          ativo: true,
        },
      });
    }
  }

  console.log('✅ Configurações iniciais prontas!');
  console.log('🎉 Seeding concluído com sucesso!');
}

main()
  .catch((e) => {
    console.error('❌ Erro no seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
