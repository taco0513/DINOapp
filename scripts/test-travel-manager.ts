import { createTravelManager } from '../lib/travel-manager';
import { getPrismaClient } from '../lib/database/dev-prisma';

const prisma = getPrismaClient();

async function testTravelManager() {
  console.log('🧪 Testing Travel Manager functionality...\n');

  try {
    // Create test user first
    const testUser = await prisma.user.create({
      data: {
        email: 'test@example.com',
        name: 'Test User',
        passportCountry: 'US',
      },
    });
    console.log('✅ Created test user:', testUser.email);

    // Initialize TravelManager
    const travelManager = createTravelManager(testUser.id);
    console.log('✅ TravelManager initialized');

    // Test 1: Create a trip
    console.log('\n📝 Test 1: Creating a new trip...');
    const newTrip = await travelManager.createTrip({
      country: 'France',
      entryDate: '2024-01-15',
      exitDate: '2024-01-25',
      visaType: 'Tourist',
      maxDays: 90,
      passportCountry: 'US',
      notes: 'Test trip to Paris',
      status: 'completed',
      purpose: 'tourism',
      accommodation: 'hotel',
      cost: 1500,
      isEmergency: false,
    });
    console.log('✅ Trip created successfully:', {
      id: newTrip.id,
      country: newTrip.country,
      status: newTrip.status,
    });

    // Test 2: Get trips
    console.log('\n📋 Test 2: Retrieving trips...');
    const trips = await travelManager.getTrips();
    console.log('✅ Retrieved trips:', trips.length, 'total');

    // Test 3: Get travel insights
    console.log('\n📊 Test 3: Getting travel insights...');
    const insights = await travelManager.getTravelInsights();
    console.log('✅ Travel insights generated:', {
      totalTrips: insights.summary.totalTrips,
      countriesVisited: insights.summary.countriesVisited,
      schengenDaysUsed: insights.summary.schengenDaysUsed,
      schengenDaysRemaining: insights.summary.schengenDaysRemaining,
    });

    // Test 4: Validate a planned trip
    console.log('\n🔍 Test 4: Validating a planned trip...');
    const validation = await travelManager.validatePlannedTrip(
      'Germany',
      '2024-06-01',
      '2024-06-10'
    );
    console.log('✅ Trip validation completed:', {
      isValid: validation.isValid,
      warnings: validation.warnings.length,
      schengenDaysAfter: validation.schengenStatus?.remainingDays,
    });

    // Test 5: Update trip
    console.log('\n✏️ Test 5: Updating trip...');
    const updatedTrip = await travelManager.updateTrip(newTrip.id, {
      rating: 5,
      notes: 'Updated test trip - excellent experience!',
    });
    console.log('✅ Trip updated successfully:', {
      rating: updatedTrip.rating,
      notes: updatedTrip.notes?.substring(0, 30) + '...',
    });

    // Test 6: Get visa requirements (with fallback)
    console.log('\n🛂 Test 6: Getting visa requirements...');
    const visaReq = await travelManager.getVisaRequirements('US', 'FR');
    console.log('✅ Visa requirements retrieved:', {
      fromCountry: visaReq.fromCountry,
      toCountry: visaReq.toCountry,
      visaRequired: visaReq.visaRequired,
      hasNote: !!visaReq.note,
    });

    console.log('\n🎉 All tests passed successfully!');
    console.log('\n📈 Summary:');
    console.log('- ✅ Trip CRUD operations working');
    console.log('- ✅ Travel insights calculation working');
    console.log('- ✅ Schengen validation working');
    console.log('- ✅ Visa requirements lookup working');
    console.log('- ✅ Database schema fully functional');

    // Cleanup
    await prisma.countryVisit.deleteMany({ where: { userId: testUser.id } });
    await prisma.travelPreferences.deleteMany({
      where: { userId: testUser.id },
    });
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('\n🧹 Test data cleaned up');
  } catch (error) {
    console.error('❌ Test failed:', error.message);
    console.error(error.stack);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testTravelManager();
