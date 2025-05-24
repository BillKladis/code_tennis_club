import express from 'express';
import path from 'path';
import { fileURLToPath } from 'url';
import { readFile,writeFile } from 'fs/promises';
import dotenv from 'dotenv'
import { sessionMiddleware } from './app-setup/app-setup-session.mjs';
import * as loginController from './controllers/login.mjs';

dotenv.config();
const app = express();
const PORT = 3000;

// Setup paths
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Serve static files from public/
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.json()); // ✅ επιτρέπει να διαβάζουμε JSON από POST body
app.use(sessionMiddleware);
// 📥 Route για login
app.post('/register', async (req, res) => {
    try {
        // req.body should contain {username, email, password}
        await loginController.doRegister(req, res);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Σφάλμα κατά την εγγραφή'
        });
    }
});
app.post('/login', async (req, res) => {
    try {
        await loginController.doLogin(req, res);
    } catch (err) {
        res.status(500).json({
            success: false,
            message: 'Σφάλμα κατά τη σύνδεση'
        });
    }
});

app.get('/check-auth', (req, res) => {
    if (req.session.loggedUserId) {
        res.json({ authenticated: true });
    } else {
        res.status(401).json({ authenticated: false });
    }
});

app.post('/logout', (req, res) => {
    req.session.destroy();
    res.json({ success: true });
});

// Root route -> send the index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get("/courts", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "courts.html"));
});

let selectedCourts = [];  // Κρατάμε λίστα

app.post("/select-court", (req, res) => {
  selectedCourts = req.body.courts;  // Παίρνουμε ολόκληρη τη λίστα
  console.log("Επιλεγμένα γήπεδα:", selectedCourts);
  res.status(200).json({ message: "Επιλογές ενημερώθηκαν." });
});

let selectedTrainers = [];


app.post("/select-trainer", (req, res) => {
  selectedTrainers = req.body.trainers; // λίστα ή μεμονωμένο id
  console.log("Επιλεγμένοι προπονητές:", selectedTrainers);
  res.status(200).json({ message: "Προπονητές ενημερώθηκαν." });
});
app.get('/events', async (req, res) => {
  try {
    const model = await import(`./model/better-sqlite.mjs`);
    //const data = await readFile('public/events.json', 'utf-8');
    const data = await model.getSchedule()
    res.json(data);
  } catch (err) {
    console.error('Error reading events:', err);
    res.status(500).json({ error: 'Failed to load events' });
  }
});
// Add to server.js
app.get('/me', (req, res) => {
    if (req.session.loggedUserId) {
        // You can expand this to return more user info if needed
        res.json({ id: req.session.loggedUserId });
    } else {
        res.status(401).json({ id: null });
    }
});
// POST κράτηση
app.post('/book', loginController.checkAuthenticated, async (req, res) => {
  try {
    const model = await import('./model/better-sqlite.mjs');
    // Add court and trainer to the booking object
    const booking = {
      ...req.body,
      court: selectedCourts[0] || null,      // Use the first selected court
      trainer: selectedTrainers[0] || null   // Use the first selected trainer
    };
    await model.addSchedule(booking);
    res.status(200).json({ message: "Η κράτηση αποθηκεύτηκε." });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});
// Add this route to get trainer details
app.get('/trainer/:id', async (req, res) => {
  try {
    console.log("abc")
    const model = await import('./model/better-sqlite.mjs');
    console.log("def")
    console.log('Fetching trainer with ID:', req.params.id);
    const trainer = await model.getTrainerById(req.params.id);
    console.log("trainer")
    if (!trainer) {
      res.status(404).json({ error: 'Trainer not found' });
      return;
    }
    res.json(trainer);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});
app.get('/tour', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'tour.html'));
});
// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
