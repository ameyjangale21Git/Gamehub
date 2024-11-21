// Importing necessary modules
const express = require('express');
const path = require('path');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { Client } = require('pg');

// Create an express app
const app = express();

// Setup PostgreSQL client
const db = new Client({
  user: 'postgres',  // replace with your DB username
  host: 'localhost',
  database: 'gameproject',  // replace with your DB name
  password: 'password',  // replace with your DB password
  port: 5432,
});

// Connect to the database
db.connect();

// Middleware to parse JSON bodies
app.use(express.json());

// Serve static files (e.g., HTML, CSS, JavaScript) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Define route to serve the main page (e.g., index.html)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Serve the signup page
app.get('/signup', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'signup.html'));
});

// Serve the login page
app.get('/login', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'login.html'));
});

// Helper function to generate JWT token for a user
function generateToken(userId, username) {
  return jwt.sign({ userId, username }, 'your-secret-key', { expiresIn: '1h' });
}

// Sign-up route: register a new user
app.post('/signup', async (req, res) => {
    try {
      const { username, email, password } = req.body;
  
      // Check if the email already exists
      const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
      if (result.rows.length > 0) {
        return res.status(400).json({ message: 'Email already exists' });
      }
  
      // Hash the password before saving it to the database
      const hashedPassword = await bcrypt.hash(password, 10);
  
      // Insert the new user into the database
      await db.query('INSERT INTO users (username, email, password) VALUES ($1, $2, $3)', [username, email, hashedPassword]);
  
      res.status(201).json({ message: 'User registered successfully' });
    } catch (error) {
      console.error('Error during sign-up:', error);
      res.status(500).json({ message: 'An error occurred during sign-up' });
    }
  });
  
// Login route: authenticate user and provide a JWT token
app.post('/login', async (req, res) => {
    try {
      const { username, password } = req.body;
  
      // Check if the user exists
      const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
      if (result.rows.length === 0) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      const user = result.rows[0];
  
      // Compare the provided password with the stored hashed password
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
      }
  
      // Generate a JWT token and return it
      const token = generateToken(user.id, user.username);
      res.json({ token });
    } catch (error) {
      console.error('Error during login:', error);
      res.status(500).json({ message: 'An error occurred during login' });
    }
  });
  

// Highscore route: save high score for a user and a game
app.post('/highscore', async (req, res) => {
  const { token, gameName, score } = req.body;

  try {
    // Verify the JWT token to get user ID
    const decoded = jwt.verify(token, 'your-secret-key');
    const userId = decoded.userId;

    // Check if the high score exists for this game and user
    const result = await db.query('SELECT * FROM high_scores WHERE user_id = $1 AND game_name = $2', [userId, gameName]);

    if (result.rows.length === 0 || result.rows[0].score < score) {
      // Insert or update the high score
      if (result.rows.length === 0) {
        await db.query('INSERT INTO high_scores (user_id, game_name, score) VALUES ($1, $2, $3)', [userId, gameName, score]);
      } else {
        await db.query('UPDATE high_scores SET score = $1 WHERE user_id = $2 AND game_name = $3', [score, userId, gameName]);
      }
      res.status(200).json({ message: 'High score saved successfully' });
    } else {
      res.status(400).json({ message: 'Score is not higher than the existing high score' });
    }
  } catch (error) {
    res.status(400).json({ message: 'Invalid token' });
  }
});

// Start the server on a specified port
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
