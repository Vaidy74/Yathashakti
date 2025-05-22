// Database Connectivity Test Script for Yathashakti
// Tests all major features and database operations

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runTests() {
  console.log('🔄 Starting database connectivity tests...\n');
  let success = true;
  
  try {
    // Test 1: Basic connectivity
    console.log('🧪 Test 1: Basic database connectivity');
    const result = await prisma.$queryRaw`SELECT 1 as connected`;
    console.log(`✅ Database connection successful: ${result[0].connected === 1 ? 'Yes' : 'No'}\n`);

    // Test 2: User Management
    console.log('🧪 Test 2: User Management');
    const userCount = await prisma.user.count();
    console.log(`✅ Found ${userCount} users in the database\n`);

    // Test 3: Donor Management
    console.log('🧪 Test 3: Donor Management');
    const donorCount = await prisma.donor.count();
    console.log(`✅ Found ${donorCount} donors in the database\n`);

    // Test 4: Program Management
    console.log('🧪 Test 4: Program Management');
    const programCount = await prisma.program.count();
    console.log(`✅ Found ${programCount} programs in the database\n`);

    // Test 5: Grant Management
    console.log('🧪 Test 5: Grant Management');
    const grantCount = await prisma.grant.count();
    console.log(`✅ Found ${grantCount} grants in the database\n`);

    // Test 6: Service Provider Management
    console.log('🧪 Test 6: Service Provider Management');
    const serviceProviderCount = await prisma.serviceProvider.count();
    console.log(`✅ Found ${serviceProviderCount} service providers in the database\n`);

    // Test 7: Create a test service provider
    console.log('🧪 Test 7: Creating test service provider');
    
    // First check if test provider already exists
    const existingProvider = await prisma.serviceProvider.findFirst({
      where: {
        name: 'Test Provider'
      }
    });

    if (!existingProvider) {
      const testProvider = await prisma.serviceProvider.create({
        data: {
          name: 'Test Provider',
          category: 'Test Category',
          type: 'IMPLEMENTING_PARTNER_SELF',
          contactPerson: 'Test Person',
          contactNumber: '+1234567890',
          email: 'test@example.com',
          location: 'Test Location',
          services: ['Test Service 1', 'Test Service 2'],
          ratePerDay: 1000,
          registeredOn: new Date(),
          description: 'This is a test service provider'
        }
      });
      console.log(`✅ Created test service provider with ID: ${testProvider.id}\n`);
    } else {
      console.log(`ℹ️ Test provider already exists with ID: ${existingProvider.id}\n`);
    }

    // Test 8: Read the test service provider
    console.log('🧪 Test 8: Reading test service provider');
    const readProvider = await prisma.serviceProvider.findFirst({
      where: {
        name: 'Test Provider'
      }
    });
    
    if (readProvider) {
      console.log(`✅ Successfully read test provider: ${readProvider.name}\n`);
    } else {
      console.log(`❌ Failed to read test provider\n`);
      success = false;
    }

    // Test 9: Update the test service provider
    console.log('🧪 Test 9: Updating test service provider');
    const updatedProvider = await prisma.serviceProvider.update({
      where: {
        id: readProvider.id
      },
      data: {
        description: `Updated at ${new Date().toISOString()}`
      }
    });
    
    console.log(`✅ Updated test provider description: ${updatedProvider.description}\n`);

    // Test 10: Relationship test (if applicable)
    console.log('🧪 Test 10: Testing relationships');
    const providersWithRelations = await prisma.serviceProvider.findMany({
      include: {
        grants: true,
        programs: true
      },
      take: 1
    });
    
    console.log(`✅ Successfully queried service provider with relationships\n`);
    
    // Final summary
    console.log('✨ All database tests completed successfully!');
    console.log('📊 Database Schema Summary:');
    console.log(`- Users: ${userCount}`);
    console.log(`- Donors: ${donorCount}`);
    console.log(`- Programs: ${programCount}`);
    console.log(`- Grants: ${grantCount}`);
    console.log(`- Service Providers: ${serviceProviderCount}`);
    
    if (success) {
      console.log('\n🎉 All features have confirmed database connectivity!');
    } else {
      console.log('\n⚠️ Some tests failed, please check the logs above.');
    }

  } catch (error) {
    console.error('❌ Test failed with error:', error);
    success = false;
  } finally {
    await prisma.$disconnect();
  }

  return success;
}

// Run the tests
runTests()
  .then(success => {
    console.log(`\n🏁 Database connectivity test ${success ? 'PASSED' : 'FAILED'}`);
    process.exit(success ? 0 : 1);
  })
  .catch(e => {
    console.error('❌ Fatal error:', e);
    process.exit(1);
  });
