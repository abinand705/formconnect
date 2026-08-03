async function testFlow() {
  const baseURL = 'http://localhost:5000/api';
  const email = `testuser_${Date.now()}@example.com`;
  const password = 'password123';
  
  try {
    console.log('1. Registering user...');
    await fetch(`${baseURL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    
    console.log('2. Logging in...');
    const loginRes = await fetch(`${baseURL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const loginData = await loginRes.json();
    const token = loginData.token;
    console.log('Token received:', token.substring(0, 20) + '...');
    
    console.log('3. Creating project...');
    const projectRes = await fetch(`${baseURL}/projects`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      },
      body: JSON.stringify({ name: 'Test Project' })
    });
    const projectData = await projectRes.json();
    const apiKey = projectData.apiKey;
    console.log('Project created. API Key:', apiKey);
    
    console.log('4. Submitting form...');
    const submitRes = await fetch(`${baseURL}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        apiKey,
        data: {
          name: 'John Doe',
          email: 'johndoe@example.com',
          message: 'This is a test submission'
        }
      })
    });
    const submitData = await submitRes.json();
    console.log('Submission successful:', submitData);
    console.log('Flow complete! Check if email notification was triggered (you should see a log in the server console).');
  } catch (err) {
    console.error('Flow failed:', err);
  }
}

testFlow();
