// Native fetch is available in Node 18+

const API_URL = 'http://localhost:5001/api';

const TEST_USER = {
    email: 'delete_test@example.com',
    password: 'password123',
    name: 'Delete Test User',
    userType: 'student',
    university: 'Test Uni'
};

async function testAccountDeletion() {
    console.log('--- Starting Account Deletion Test ---');

    try {
        // 1. Register User
        console.log('1. Registering user...');
        let res = await fetch(`${API_URL}/auth/register`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(TEST_USER)
        });
        let data = await res.json();

        if (!data.success && data.message !== 'User already exists') {
            // If user exists from previous failed run, try to login
            console.log('User might already exist, attempting login...');
        }

        // 2. Login (to get token if registration failed or just to be sure)
        console.log('2. Logging in...');
        res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
        });
        data = await res.json();

        if (!data.success) {
            throw new Error('Login failed: ' + data.message);
        }

        const token = data.data?.token || data.token;
        if (!token) throw new Error('No token returned');
        console.log('Logged in successfully.');

        // 3. Delete Account
        console.log('3. Deleting account...');
        res = await fetch(`${API_URL}/users/me`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        data = await res.json();

        if (!data.success) {
            throw new Error('Deletion failed: ' + data.message);
        }
        console.log('Account deleted successfully.');

        // 4. Verify Account is Gone (Try to login again)
        console.log('4. Verifying deletion (attempting login)...');
        res = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: TEST_USER.email, password: TEST_USER.password })
        });
        data = await res.json();

        if (data.success) {
            throw new Error('Login succeeded after deletion! Account was NOT deleted.');
        }
        console.log('Login failed as expected. Test PASSED.');

    } catch (error) {
        console.error('TEST FAILED:', error.message);
        process.exit(1);
    }
}

testAccountDeletion();
