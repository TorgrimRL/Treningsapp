const express = require('express'); 
const bodyParser =  require('body-parser');
const db = require('./database');
const Joi = require('joi');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const cookieParser = require('cookie-parser');
const csurf = require('csurf');
const app = express();
const port = 3000;

app.use(bodyParser.json());
app.use(cookieParser());

app.use((req, res, next) => {
    console.log('Request Headers:', req.headers);
    console.log('Cookies:', req.cookies);
    next();
});
// CSRF-beskyttelse middleware
const csrfProtection = csurf({ cookie: true});
// app.use(csrfProtection);

const secretKey = 'secretkey';

// Middleware for å verifisere token
const authenticateToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) {
        console.log('No token provided');
        return res.status(401).send('Access Denied');
    }
    try {
        const verified = jwt.verify(token.split(' ')[1], secretKey);  // Split for å håndtere 'Bearer' token
        req.user = verified;
        next();
    } catch (error) {
        console.log('Invalid Token:', error);
        res.status(400).send('Invalid Token');
    }
};

// Rute for å hente en CSRF-token
app.get('/csrf-token', authenticateToken, csrfProtection, (req, res) => {
    const csrfToken = req.csrfToken();
    res.cookie('XSRF-TOKEN', csrfToken); // Sett CSRF-token som en cookie
    console.log('Generated CSRF Token:', csrfToken);
    res.json({ csrfToken });
});

// Rute for brukerregistrering (uten CSRF-beskyttelse)
app.post('/register', async(req, res) => {
    const { username, password } = req.body;

    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) return res.status(500).send(err.message);
        if (user) return res.status(400).send('Username already exists');

        const hashedPassword = await bcrypt.hash(password, 10);

        db.run('INSERT INTO users (username, password) VALUES (?, ?)', [username, hashedPassword], function(err) {
            if (err) return res.status(500).send(err.message);
            res.status(201).send('User registered');
        });
    });
});

// Rute for brukerpålogging (uten CSRF-beskyttelse)
app.post('/login', async (req, res) => {
    const { username, password } = req.body;
    
    db.get('SELECT * FROM users WHERE username = ?', [username], async (err, user) => {
        if (err) {
            console.log('Database Error:', err);
            return res.status(500).send(err.message);
        }
        if (!user) {
            console.log('Username not found');
            return res.status(400).send('Username or password is incorrect');
        }
        const validPass = await bcrypt.compare(password, user.password);
        if (!validPass) {
            console.log('Invalid password');
            return res.status(400).send('Username or password is incorrect');
        }

        const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });
        console.log('Generated Token:', token);
        res.json({ token });
    });
});

const workoutSchema = Joi.object({
    type: Joi.string().required(),
    duration: Joi.number().integer().required()
}).strict();

// Rute for å håndtere GET-forespørsler til roten
app.get('/', (req, res) => {
    res.send('Welcome to the Workout App API!');
});

// Endepunkt for å lage en ny treningsøkt
app.post('/workouts', authenticateToken, csrfProtection, (req, res) => {
    console.log('CSRF Token from Header:', req.headers['x-csrf-token']);
    const { error } = workoutSchema.validate(req.body);
    if (error) {
        console.log('Validation Error:', error.details[0].message);
        return res.status(400).send(error.details[0].message);
    }
    const { type, duration } = req.body;
    db.run('INSERT INTO workouts (type, duration) VALUES (?, ?)', [type, duration], function(err) {
        if (err) {
            console.log('Database Error:', err.message);
            return res.status(500).send(err.message);
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Endepunkt for å hente alle treningsøkter
app.get('/workouts', authenticateToken, csrfProtection, (req, res) => {
    db.all('SELECT * FROM workouts', [], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(rows);
    });
});

// Endepunkt for å hente en spesifikk treningsøkt
app.get('/workouts/:id', authenticateToken, csrfProtection,(req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM workouts WHERE id= ?', [id], (err, row) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(row);
    });
});

//Endepunkt for å oppdatere en treningsøkt
app.put('/workouts/:id',authenticateToken, csrfProtection,(req, res) => {
    const { id } = req.params;
    const { type, duration } = req.body;
    db.run('UPDATE workouts SET type = ?, duration = ? WHERE id = ?',[type, duration, id], function(err){
        if (err) {
            return res.status(500).send(err.message);
        }
        res.status(200).json({ changes: this.changes });
    });
});

//Endepunkt for å slette en treningsøkt
app.delete('/workouts/:id', authenticateToken, csrfProtection,(req, res) => {
    const { id } = req.params;
    db.run('DELETE FROM workouts WHERE id = ?', [id], function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.status(200).json({ changes: this.changes });
    });
});

app.listen(port, () => {
    console.log(`Server running on http://localhost:${port}`);
});