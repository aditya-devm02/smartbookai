const axios = require('axios');

// Test the ML API directly
async function testMLAPI() {
  console.log('Testing ML API...');
  
  const testData = {
    booked_ids: [],
    all_activities: [
      {
        _id: '1',
        title: 'Yoga Session',
        category: 'wellness',
        popularity: 8,
        duration: 60,
        slots: 15
      },
      {
        _id: '2',
        title: 'Basketball Game',
        category: 'sports',
        popularity: 12,
        duration: 90,
        slots: 20
      },
      {
        _id: '3',
        title: 'Art Workshop',
        category: 'art',
        popularity: 6,
        duration: 120,
        slots: 10
      },
      {
        _id: '4',
        title: 'Tech Talk',
        category: 'tech',
        popularity: 15,
        duration: 45,
        slots: 25
      }
    ],
    activity_history: ['wellness', 'sports']
  };

  try {
    const response = await axios.post('http://localhost:5001/recommend', testData);
    console.log('✅ ML API Response:', response.data);
    return true;
  } catch (error) {
    console.error('❌ ML API Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
    return false;
  }
}

// Create a test user and event
async function createTestUser() {
  console.log('\nCreating test user and event...');
  
  try {
    // First, create an admin and event
    const adminResponse = await axios.post('http://localhost:5050/api/auth/register-admin-event', {
      username: 'testadmin',
      email: 'admin@test.com',
      password: 'password123',
      eventName: 'Test Event',
      eventSlug: 'test-event',
      branding: {
        primaryColor: '#00dfd8',
        secondaryColor: '#ff0080'
      }
    });
    
    console.log('✅ Admin and event created:', adminResponse.data);
    
    // Now create a regular user for the same event
    const userResponse = await axios.post('http://localhost:5050/api/auth/register', {
      username: 'testuser',
      email: 'user@test.com',
      password: 'password123',
      eventId: adminResponse.data.event._id
    });
    
    console.log('✅ Test user created:', userResponse.data);
    
    return {
      adminToken: adminResponse.data.token,
      userToken: null, // We'll get this by logging in
      eventId: adminResponse.data.event._id
    };
  } catch (error) {
    console.error('❌ Error creating test user:', error.response?.data || error.message);
    return null;
  }
}

// Test the backend recommendation endpoint
async function testBackendAPI() {
  console.log('\nTesting Backend API...');
  
  try {
    // First, we need to get a valid token by logging in
    const loginResponse = await axios.post('http://localhost:5050/api/auth/login', {
      email: 'user@test.com',
      password: 'password123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    
    // Test recommendations endpoint
    const recResponse = await axios.get('http://localhost:5050/api/recommend', {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    console.log('✅ Backend Recommendations Response:', recResponse.data);
    return true;
  } catch (error) {
    console.error('❌ Backend API Error:', error.response?.data || error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Headers:', error.response.headers);
    }
    return false;
  }
}

// Test health endpoints
async function testHealthEndpoints() {
  console.log('\nTesting Health Endpoints...');
  
  try {
    // Test ML API health
    const mlHealth = await axios.get('http://localhost:5001/health');
    console.log('✅ ML API Health:', mlHealth.data);
    
    // Test backend health (if available)
    try {
      const backendHealth = await axios.get('http://localhost:5050/health');
      console.log('✅ Backend Health:', backendHealth.data);
    } catch (e) {
      console.log('ℹ️  Backend health endpoint not available');
    }
    
    return true;
  } catch (error) {
    console.error('❌ Health Check Error:', error.message);
    return false;
  }
}

// Run tests
async function runTests() {
  console.log('🧪 Testing Recommendation System...\n');
  
  const healthSuccess = await testHealthEndpoints();
  const mlSuccess = await testMLAPI();
  
  // Create test user if needed
  const testSetup = await createTestUser();
  const backendSuccess = testSetup ? await testBackendAPI() : false;
  
  console.log('\n📊 Test Results:');
  console.log(`Health Checks: ${healthSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`ML API: ${mlSuccess ? '✅ PASS' : '❌ FAIL'}`);
  console.log(`Backend API: ${backendSuccess ? '✅ PASS' : '❌ FAIL'}`);
  
  if (healthSuccess && mlSuccess && backendSuccess) {
    console.log('\n🎉 All tests passed! Recommendation system is working.');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
}

runTests().catch(console.error); 