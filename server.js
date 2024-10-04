const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const cors = require('cors');
const bcrypt = require('bcrypt');
const path = require('path');

const app = express();
const dbPath = path.join(__dirname, 'users.db'); // File-based database
const db = new sqlite3.Database(dbPath);

app.use(cors());
app.use(bodyParser.json());

// Number of salt rounds for bcrypt hashing
const saltRounds = 10;

// Create users table if it doesn't exist
db.serialize(() => {
    db.run("CREATE TABLE IF NOT EXISTS users (username TEXT PRIMARY KEY, password TEXT)");
});

// Register endpoint
app.post('/register', (req, res) => {
    const { username, password } = req.body;

    // Hash the password before storing
    bcrypt.hash(password, saltRounds, (err, hashedPassword) => {
        if (err) {
            return res.status(500).send('Error hashing password');
        }

        // Store the hashed password in the database
        db.run("INSERT INTO users (username, password) VALUES (?, ?)", [username, hashedPassword], function(err) {
            if (err) {
                return res.status(500).send('User already exists');
            }
            res.status(201).send('Registration successful');
        });
    });
});

// Login endpoint
app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Retrieve the hashed password from the database
    db.get("SELECT * FROM users WHERE username = ?", [username], (err, row) => {
        if (!row) {
            return res.status(401).send('Invalid username or password');
        }

        // Compare the hashed password with the user-provided password
        bcrypt.compare(password, row.password, (err, result) => {
            if (result) {
                res.send('Login successful');
            } else {
                res.status(401).send('Invalid username or password');
            }
        });
    });
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});

// Serve static files from the public directory
app.use(express.static(path.join(__dirname, 'public')));

// Update user endpoint
app.post('/update-user', (req, res) => {
    const { oldUsername, newUsername, oldPassword, newPassword } = req.body;

    // Retrieve the user's current hashed password from the database
    db.get("SELECT * FROM users WHERE username = ?", [oldUsername], (err, row) => {
        if (!row) {
            return res.status(404).send('User not found');
        }

        // Compare the old password with the stored hash
        bcrypt.compare(oldPassword, row.password, (err, result) => {
            if (!result) {
                return res.status(401).send('Old password is incorrect');
            }

            // Hash the new password
            bcrypt.hash(newPassword, saltRounds, (err, hashedPassword) => {
                if (err) {
                    return res.status(500).send('Error hashing new password');
                }

                // Update the user in the database
                db.run("UPDATE users SET username = ?, password = ? WHERE username = ?", 
                        [newUsername, hashedPassword, oldUsername], function(err) {
                    if (err) {
                        return res.status(500).send('Error updating user');
                    }
                    res.send('User updated successfully');
                    console.log("user updated sucessfully");
                });
            });
        });
    });
});
