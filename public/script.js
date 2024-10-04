async function register() {
    const username = document.getElementById('reg-username').value;
    const password = document.getElementById('reg-password').value;

    const response = await fetch('http://localhost:3000/register', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password}),
    });

    if (response.ok) {
        alert('Registration successful!');
    } else {
        alert('User already exists');
    }
}

async function login() {
    const username = document.getElementById('login-username').value;
    const password = document.getElementById('login-password').value;

    const response = await fetch('http://localhost:3000/login', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
    });

    if (response.ok) {
        // Store the username in local storage for later use
        localStorage.setItem('username', username);
        window.location.href = 'dashboard.html';
    } else {
        alert('Invalid username or password');
    }
}

async function GuestMode() {
    window.location.href = 'guest.html';
}