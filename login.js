document.getElementById('login-form').addEventListener('submit', async function (e) {
    e.preventDefault();

    const username = document.getElementById('username').value;
    const password = document.getElementById('password').value;

    try {
        const response = await fetch('/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, password }),
        });

        const data = await response.json();
        if (response.ok) {
            alert('Login successful');
            localStorage.setItem('token', data.token); // Store the token
            window.location.href = '/'; // Redirect to the main page after successful login
        } else {
            alert(data.message); // Show the error message
        }
    } catch (error) {
        console.error('Error during login:', error);
        alert('An error occurred while logging in.');
    }
});
