document.getElementById('signup-form').addEventListener('submit', async function (e) {
    e.preventDefault(); // Prevent the form from reloading the page
  
    // Get form data
    const username = document.getElementById('username').value;
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
  
    try {
        // Send the POST request to the backend
        const response = await fetch('/signup', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ username, email, password }),
        });
  
        // Handle response
        const data = await response.json();
        if (response.ok) {
            alert('User registered successfully');
            window.location.href = '/login'; // Redirect to login page after successful signup
        } else {
            alert(data.message); // Show the error message
        }
    } catch (error) {
        console.error('Error during signup:', error);
        alert('An error occurred while signing up.');
    }
});
