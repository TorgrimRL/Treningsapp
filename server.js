const express = require('express'); 
const bodyParser =  require('body-parser');
const db = require('./database');
const Joi = require('joi');

const app = express();


const port = 3000;

app.use(bodyParser.json());

const workoutSchema = Joi.object({
    type: Joi.string().required(),
    duration: Joi.number().integer().required()
}).strict();

// Rute for å håndtere GET-forespørsler til roten
app.get('/', (req, res) => {
    res.send('Welcome to the Workout App API!');
});

//Endepunkt for å lage en ny treningsøkt
app.post('/workouts', (req, res) => {
    const { error } = workoutSchema.validate(req.body);
    if (error) {
        return res.status(400).send(error.details[0].message);
    }
    const { type, duration } = req.body;
    db.run('INSERT INTO workouts ( type, duration) VALUES (?, ?)',[type, duration], function(err){
        if (err){
            return res.status(500).send(err.message);
        }
        res.status(201).json({ id: this.lastID });
    });
});

// Endepunkt for å hente alle treningsøkter
app.get('/workouts', (req, res) => {
    db.all('SELECT * FROM workouts', [], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(rows);
    });
});

// Endepunkt for å hente en spesifikk treningsøkt
app.get('/workouts/:id', (req, res) => {
    const { id } = req.params;
    db.get('SELECT * FROM workouts WHERE id= ?', [id], (err, row) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.json(row);
    });
});

//Endepunkt for å oppdatere en treningsøkt
app.put('/workouts/:id',(req, res) => {
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
app.delete('/workouts/:id', (req, res) => {
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