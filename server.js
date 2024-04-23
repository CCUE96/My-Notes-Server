const express = require('express');
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3001;
const fs = require('fs');
//  Middleware for parsing JSON and urlencoded form data
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static('public'));
//  Routes
// homepage route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, './public/index.html'));
});
// creates endpoint for notes
app.get('/notes', (req, res) => {
    res.sendFile(path.join(__dirname, './public/notes.html'));
});
app.get('/api/notes', (req, res) => {
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read notes.' });
        }
        res.json(JSON.parse(data));
    });
});
app.post('/api/notes', (req, res) => {
    const { title, text } = req.body;
    if (title && text) {
        const newNote = {
            title,
            text,
            id: Math.floor(Math.random() * 1000000)
        };
        fs.readFile('./db/db.json', 'utf8', (err, data) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to read notes.' });
            }
            const notes = JSON.parse(data);
            notes.push(newNote);
            fs.writeFile('./db/db.json', JSON.stringify(notes), (err) => {
                if (err) {
                    console.error(err);
                    return res.status(500).json({ error: 'Failed to save note.' });
                }
                res.json(newNote);
            });
        });
    } else {
        res.status(400).json({ error: 'Request body must contain a title and text.' });
    }
});
app.delete('/api/notes/:id', (req, res) => {
    const id = parseFloat(req.params.id);
    if (!id) {
        return res.status(400).json({ error: 'Invalid note ID.' });
    }
    fs.readFile('./db/db.json', 'utf8', (err, data) => {
        if (err) {
            console.error(err);
            return res.status(500).json({ error: 'Failed to read notes.' });
        }
        const notes = JSON.parse(data);
        const newNotes = notes.filter((note) => note.id !== id);
        fs.writeFile('./db/db.json', JSON.stringify(newNotes), (err) => {
            if (err) {
                console.error(err);
                return res.status(500).json({ error: 'Failed to delete note.' });
            }
            res.json({ ok: true });
        });
    });
});
app.listen(PORT, () => {
    console.log(`Check website at http://localhost:${PORT}`);
});