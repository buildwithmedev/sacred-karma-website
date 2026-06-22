const express = require('express');
const fs = require('fs').promises;
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const dataPath = path.join(__dirname, 'data.json');

async function readDB() {
    const data = await fs.readFile(dataPath, 'utf8');
    return JSON.parse(data);
}
async function writeDB(data) {
    await fs.writeFile(dataPath, JSON.stringify(data, null, 2));
}

// GET: All static cultural data (Only ONE route for this now!)
app.get('/api/data', async (req, res) => {
    try {
        const db = await readDB();
        res.json({
            symbols: db.symbols,
            deities: db.deities,
            chakras: db.chakras,
            texts: db.texts,
            sins: db.sins,
            gurus: db.gurus // Guru data is successfully passed here!
        });
    } catch (err) {
        res.status(500).json({ error: 'Failed to access the sacred texts.' });
    }
});

// GET: Guestbook entries
app.get('/api/guestbook', async (req, res) => {
    try {
        const db = await readDB();
        res.json(db.guestbook.sort((a, b) => b.id - a.id));
    } catch (err) {
        res.status(500).json({ error: 'Failed to read reflections.' });
    }
});

// POST: Add new guestbook entry
app.post('/api/guestbook', async (req, res) => {
    try {
        const { name, message } = req.body;
        if (!name || !message) return res.status(400).json({ error: 'Name and message required.' });

        const db = await readDB();
        const newEntry = { id: Date.now(), name, message, date: new Date().toLocaleDateString('en-IN'), likes: 0 };
        db.guestbook.push(newEntry);
        await writeDB(db);
        
        res.status(201).json({ success: true, entry: newEntry });
    } catch (err) {
        res.status(500).json({ error: 'Failed to record entry.' });
    }
});

// PUT: Like a guestbook entry
app.put('/api/guestbook/:id/like', async (req, res) => {
    try {
        const entryId = parseInt(req.params.id);
        const db = await readDB();
        const entryIndex = db.guestbook.findIndex(e => e.id === entryId);
        if (entryIndex === -1) return res.status(404).json({ error: 'Entry not found.' });

        db.guestbook[entryIndex].likes += 1;
        await writeDB(db);
        res.json({ success: true, likes: db.guestbook[entryIndex].likes });
    } catch (err) {
        res.status(500).json({ error: 'Failed to send blessing.' });
    }
});

app.listen(PORT, () => {
    console.log(`[BACKEND ACTIVE] Divine portal running at http://localhost:${PORT}`);
});