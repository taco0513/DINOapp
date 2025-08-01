// Node.js 실행을 위한 import 방식
import { PrismaClient } from '@prisma/client';
import { createRequire } from 'module';
import { config } from 'dotenv';

// 환경 변수 로드
config({ path: '.env.local' });

const require = createRequire(import.meta.url);
const { ALL_VISA_REQUIREMENTS } = require('../data/visa-requirements.js');

const prisma = new PrismaClient();

async function seedVisaRequirements() {
  console.log('🌱 비자 요구사항 데이터 시딩 시작...');

  try {
    // 기존 데이터 삭제 (선택적)
    const deleteCount = await prisma.visaRequirement.deleteMany({});
    console.log(`🗑️  기존 ${deleteCount.count}개 비자 요구사항 삭제됨`);

    // 새 데이터 삽입
    let createdCount = 0;
    let updatedCount = 0;

    for (const requirement of ALL_VISA_REQUIREMENTS) {
      const existingRequirement = await prisma.visaRequirement.findUnique({
        where: {
          fromCountry_toCountry: {
            fromCountry: requirement.fromCountry,
            toCountry: requirement.toCountry
          }
        }
      });

      const data = {
        fromCountry: requirement.fromCountry,
        toCountry: requirement.toCountry,
        visaRequired: requirement.visaRequired,
        visaFreeStay: requirement.visaFreeStay || null,
        visaTypes: JSON.stringify(requirement.visaTypes),
        processingTime: requirement.processingTime || null,
        cost: requirement.cost || null,
        requirements: JSON.stringify(requirement.requirements || []),
        validityPeriod: requirement.validityPeriod || null,
        multipleEntry: requirement.multipleEntry,
        notes: requirement.notes || null
      };

      if (existingRequirement) {
        await prisma.visaRequirement.update({
          where: {
            id: existingRequirement.id
          },
          data
        });
        updatedCount++;
      } else {
        await prisma.visaRequirement.create({
          data
        });
        createdCount++;
      }
    }

    console.log(`✅ 비자 요구사항 시딩 완료:`);
    console.log(`   📝 신규 생성: ${createdCount}개`);
    console.log(`   🔄 업데이트: ${updatedCount}개`);
    console.log(`   📊 총 ${createdCount + updatedCount}개 비자 요구사항 처리됨`);

    // 통계 출력
    const totalRequirements = await prisma.visaRequirement.count();
    const visaFreeCount = await prisma.visaRequirement.count({
      where: { visaRequired: false }
    });
    const visaRequiredCount = await prisma.visaRequirement.count({
      where: { visaRequired: true }
    });

    console.log(`\n📈 데이터베이스 통계:`);
    console.log(`   전체 비자 요구사항: ${totalRequirements}개`);
    console.log(`   무비자 국가: ${visaFreeCount}개`);
    console.log(`   비자 필요 국가: ${visaRequiredCount}개`);

    // 국가별 통계
    const fromCountries = await prisma.visaRequirement.groupBy({
      by: ['fromCountry'],
      _count: {
        fromCountry: true
      },
      orderBy: {
        _count: {
          fromCountry: 'desc'
        }
      }
    });

    console.log(`\n🌍 여권 국가별 데이터:`);
    fromCountries.forEach(country => {
      console.log(`   ${country.fromCountry}: ${country._count.fromCountry}개 목적지`);
    });

  } catch (error) {
    console.error('❌ 비자 요구사항 시딩 실패:', error);
    throw error;
  }
}

// 독립 실행 모드
seedVisaRequirements()
  .then(() => {
    console.log('🎉 시딩 완료!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 시딩 실패:', error);
    process.exit(1);
  });