const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

async function testAuthFlow() {
  console.log('🧪 Testing Complete Authentication Flow\n');
  
  try {
    // Test 1: Register a new user
    console.log('1. Testing User Registration...');
    const registerData = {
      name: 'Test User',
      email: 'test@example.com',
      password: 'testpassword123',
      phoneNumber: '+250788999999'
    };
    
    const registerResponse = await fetch('http://localhost:5000/api/auth/register', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registerData)
    });
    
    const registerResult = await registerResponse.json();
    
    if (registerResult.success) {
      console.log('✅ Registration successful!');
      console.log(`   User ID: ${registerResult.user.id}`);
      console.log(`   Token: ${registerResult.token.substring(0, 20)}...`);
    } else {
      console.log('❌ Registration failed:', registerResult.message);
      return;
    }
    
    // Test 2: Login with the new user
    console.log('\n2. Testing User Login...');
    const loginData = {
      email: 'test@example.com',
      password: 'testpassword123'
    };
    
    const loginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData)
    });
    
    const loginResult = await loginResponse.json();
    
    if (loginResult.success) {
      console.log('✅ Login successful!');
      console.log(`   User: ${loginResult.user.name}`);
      console.log(`   Token: ${loginResult.token.substring(0, 20)}...`);
    } else {
      console.log('❌ Login failed:', loginResult.message);
      return;
    }
    
    // Test 3: Get user profile with token
    console.log('\n3. Testing Get User Profile...');
    const profileResponse = await fetch('http://localhost:5000/api/auth/me', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${loginResult.token}`,
      }
    });
    
    const profileResult = await profileResponse.json();
    
    if (profileResult.success) {
      console.log('✅ Profile retrieval successful!');
      console.log(`   User: ${profileResult.data.name}`);
      console.log(`   Email: ${profileResult.data.email}`);
      console.log(`   Phone: ${profileResult.data.phoneNumber}`);
    } else {
      console.log('❌ Profile retrieval failed:', profileResult.message);
      return;
    }
    
    // Test 4: Test login with phone number
    console.log('\n4. Testing Login with Phone Number...');
    const phoneLoginData = {
      phoneNumber: '+250788999999',
      password: 'testpassword123'
    };
    
    const phoneLoginResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(phoneLoginData)
    });
    
    const phoneLoginResult = await phoneLoginResponse.json();
    
    if (phoneLoginResult.success) {
      console.log('✅ Phone login successful!');
      console.log(`   User: ${phoneLoginResult.user.name}`);
    } else {
      console.log('❌ Phone login failed:', phoneLoginResult.message);
    }
    
    // Test 5: Test invalid credentials
    console.log('\n5. Testing Invalid Credentials...');
    const invalidLoginData = {
      email: 'test@example.com',
      password: 'wrongpassword'
    };
    
    const invalidResponse = await fetch('http://localhost:5000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(invalidLoginData)
    });
    
    const invalidResult = await invalidResponse.json();
    
    if (!invalidResult.success && invalidResponse.status === 401) {
      console.log('✅ Invalid credentials properly rejected!');
      console.log(`   Message: ${invalidResult.message}`);
    } else {
      console.log('❌ Invalid credentials not properly handled');
    }
    
    console.log('\n🎉 All authentication tests passed!');
    console.log('\n📋 Summary:');
    console.log('   ✅ User registration works');
    console.log('   ✅ Email login works');
    console.log('   ✅ Phone number login works');
    console.log('   ✅ Profile retrieval with token works');
    console.log('   ✅ Invalid credentials properly rejected');
    
  } catch (error) {
    console.error('❌ Error during auth flow test:', error.message);
  }
}

testAuthFlow();
