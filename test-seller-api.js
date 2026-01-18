/**
 * Seller Dashboard API Test Script
 * Tests all seller API endpoints with proper authentication
 */

const BASE_URL = 'http://localhost:3001';
const TEST_CREDENTIALS = {
  email: 'testseller999@test.com',
  password: 'test123456'
};

// Test results storage
const testResults = {
  passed: [],
  failed: [],
  errors: []
};

/**
 * Login and get authentication token
 */
async function login() {
  console.log('🔐 Logging in...');
  console.log(`Email: ${TEST_CREDENTIALS.email}`);

  try {
    const response = await fetch(`${BASE_URL}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(TEST_CREDENTIALS),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Login failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    if (!data.token) {
      throw new Error('No token in response');
    }

    console.log('✅ Login successful');
    console.log(`Token: ${data.token.substring(0, 20)}...`);
    console.log(`User: ${data.user.name} (${data.user.email})`);
    console.log(`Role: ${data.user.role}`);
    console.log('');

    return data.token;
  } catch (error) {
    console.error('❌ Login failed:', error.message);
    throw error;
  }
}

/**
 * Test an API endpoint
 */
async function testEndpoint(name, url, token, expectedFields = []) {
  console.log(`\n📡 Testing: ${name}`);
  console.log(`URL: ${url}`);

  try {
    const response = await fetch(url, {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });

    console.log(`Status: ${response.status} ${response.statusText}`);

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API call failed: ${response.status} - ${errorText}`);
    }

    const data = await response.json();

    // Validate response structure
    if (expectedFields.length > 0) {
      const missingFields = expectedFields.filter(field => !(field in data));
      if (missingFields.length > 0) {
        throw new Error(`Missing expected fields: ${missingFields.join(', ')}`);
      }
    }

    console.log('✅ Success');
    console.log('Response data:', JSON.stringify(data, null, 2));

    testResults.passed.push({
      name,
      url,
      status: response.status,
      data
    });

    return data;
  } catch (error) {
    console.error('❌ Failed:', error.message);

    testResults.failed.push({
      name,
      url,
      error: error.message
    });

    testResults.errors.push({
      endpoint: name,
      error: error.message,
      stack: error.stack
    });

    return null;
  }
}

/**
 * Main test runner
 */
async function runTests() {
  console.log('=================================================');
  console.log('🧪 Seller Dashboard API Test Suite');
  console.log('=================================================\n');

  try {
    // Step 1: Login
    const token = await login();

    // Step 2: Test all endpoints
    console.log('\n=================================================');
    console.log('📊 Testing Analytics Endpoints');
    console.log('=================================================');

    // Analytics Overview
    await testEndpoint(
      'Analytics Overview',
      `${BASE_URL}/api/analytics/seller/overview?period=30d`,
      token,
      ['totalRevenue', 'totalOrders', 'totalProducts', 'averageOrderValue']
    );

    // Revenue Analytics
    await testEndpoint(
      'Revenue Analytics',
      `${BASE_URL}/api/analytics/seller/revenue?period=30d`,
      token,
      ['totalRevenue', 'revenueChange', 'revenueData']
    );

    // Top Products
    await testEndpoint(
      'Top Products',
      `${BASE_URL}/api/analytics/seller/top-products?period=30d&limit=10`,
      token,
      ['products']
    );

    // Orders Timeline
    await testEndpoint(
      'Orders Timeline',
      `${BASE_URL}/api/analytics/seller/orders-timeline?period=30d`,
      token,
      ['timeline']
    );

    // Customers Analytics
    await testEndpoint(
      'Customers Analytics',
      `${BASE_URL}/api/analytics/seller/customers?period=30d`,
      token,
      ['totalCustomers', 'newCustomers', 'returningCustomers']
    );

    console.log('\n=================================================');
    console.log('🛍️ Testing Products Endpoint');
    console.log('=================================================');

    // Products List
    await testEndpoint(
      'My Products',
      `${BASE_URL}/api/products/me`,
      token,
      ['products']
    );

    // Step 3: Print summary
    console.log('\n\n=================================================');
    console.log('📊 Test Summary');
    console.log('=================================================');

    console.log(`\n✅ Passed: ${testResults.passed.length}`);
    testResults.passed.forEach(result => {
      console.log(`  - ${result.name}`);
    });

    if (testResults.failed.length > 0) {
      console.log(`\n❌ Failed: ${testResults.failed.length}`);
      testResults.failed.forEach(result => {
        console.log(`  - ${result.name}`);
        console.log(`    Error: ${result.error}`);
      });
    }

    if (testResults.errors.length > 0) {
      console.log('\n\n=================================================');
      console.log('🔍 Detailed Error Information');
      console.log('=================================================');

      testResults.errors.forEach((error, index) => {
        console.log(`\nError ${index + 1}: ${error.endpoint}`);
        console.log('Message:', error.error);
        console.log('Stack:', error.stack);
      });
    }

    console.log('\n=================================================');
    console.log('✅ Test Suite Completed');
    console.log('=================================================\n');

    // Return summary
    return {
      total: testResults.passed.length + testResults.failed.length,
      passed: testResults.passed.length,
      failed: testResults.failed.length,
      passRate: (testResults.passed.length / (testResults.passed.length + testResults.failed.length) * 100).toFixed(2),
      results: testResults
    };

  } catch (error) {
    console.error('\n❌ Test suite failed:', error.message);
    console.error(error.stack);
    throw error;
  }
}

// Run tests
runTests()
  .then(summary => {
    console.log('\n📈 Final Results:');
    console.log(`Total Tests: ${summary.total}`);
    console.log(`Passed: ${summary.passed}`);
    console.log(`Failed: ${summary.failed}`);
    console.log(`Pass Rate: ${summary.passRate}%`);

    process.exit(summary.failed > 0 ? 1 : 0);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
