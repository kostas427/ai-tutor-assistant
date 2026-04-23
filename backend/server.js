const express = require('express');
const cors = require('cors');
const Database = require('better-sqlite3');

const app = express();
app.use(cors());
app.use(express.json());

const db = new Database('tutor.db');
db.exec(`
  CREATE TABLE IF NOT EXISTS sessions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT DEFAULT 'Νέα Συνομιλία',
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
  CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    session_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (session_id) REFERENCES sessions(id)
  )
`);

const OPENAI_API_KEY = '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';

const SYSTEM_PROMPT = `Είσαι ένας εξειδικευμένος εκπαιδευτικός βοηθός για φοιτητές πληροφορικής. Βοηθάς με θέματα όπως προγραμματισμός, αλγόριθμοι, βάσεις δεδομένων, δίκτυα. Απαντάς πάντα στα ελληνικά με σαφήνεια και παραδείγματα.`;

const callOpenAI = async (messages) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${OPENAI_API_KEY}`
    },
    body: JSON.stringify({ model: 'gpt-3.5-turbo', messages })
  });
  const data = await response.json();
  return data.choices[0].message.content;
};

app.get('/', (req, res) => {
  res.json({ message: 'CS Tutor AI Backend is running!' });
});

app.post('/api/session', (req, res) => {
  const result = db.prepare('INSERT INTO sessions DEFAULT VALUES').run();
  res.json({ sessionId: result.lastInsertRowid });
});

app.get('/api/history', (req, res) => {
  const sessions = db.prepare('SELECT * FROM sessions ORDER BY created_at DESC').all();
  const sessionsWithMessages = sessions.map(session => {
    const messages = db.prepare('SELECT * FROM conversations WHERE session_id = ? ORDER BY timestamp ASC').all(session.id);
    return { ...session, messages };
  });
  res.json({ sessions: sessionsWithMessages });
});

app.post('/api/chat', async (req, res) => {
  const { message, sessionId } = req.body;
  if (!message || !sessionId) return res.status(400).json({ error: 'Message and sessionId are required' });

  db.prepare('INSERT INTO conversations (session_id, role, message) VALUES (?, ?, ?)').run(sessionId, 'user', message);

  // Check if this is the first message — generate title
  const messageCount = db.prepare('SELECT COUNT(*) as count FROM conversations WHERE session_id = ? AND role = ?').get(sessionId, 'user');
  if (messageCount.count === 1) {
    try {
      const title = await callOpenAI([
        { role: 'user', content: `Δημιούργησε έναν σύντομο τίτλο 3-5 λέξεων για μια συνομιλία που ξεκινά με: "${message}". Απάντησε ΜΟΝΟ τον τίτλο, χωρίς εισαγωγικά.` }
      ]);
      db.prepare('UPDATE sessions SET title = ? WHERE id = ?').run(title.trim(), sessionId);
    } catch (e) {
      console.error('Title generation failed:', e.message);
    }
  }

  try {
    const reply = await callOpenAI([
      { role: 'system', content: SYSTEM_PROMPT },
      { role: 'user', content: message }
    ]);

    db.prepare('INSERT INTO conversations (session_id, role, message) VALUES (?, ?, ?)').run(sessionId, 'assistant', reply);
    res.json({ reply });
  } catch (error) {
    console.error('Error:', error.message);
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/history', (req, res) => {
  db.prepare('DELETE FROM conversations').run();
  db.prepare('DELETE FROM sessions').run();
  res.json({ message: 'History cleared' });
});

app.listen(3000, () => console.log('Server running on http://localhost:3000'));