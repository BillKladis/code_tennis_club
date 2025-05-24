import db from 'better-sqlite3'
const sql = new db('model/data.db', { fileMustExist: true });
import argon2d from 'argon2';
export let getSchedule= () => {
    //Φέρε όλες τις εργασίας από τη βάση
    const stmt = sql.prepare("SELECT * FROM schedule");
    let tasks;
    try {
        tasks = stmt.all();
        
        return tasks;
    } catch (err) {
        throw err;
    }
}
export let addSchedule = (event) => {
    // Check duration (in ms)
    const start = new Date(event.start);
    const end = new Date(event.end);
    const duration = (end - start) / (1000 * 60 * 60); // hours
    console.log('duration', duration);
    if(duration < 0) {
        throw new Error('Η ώρα έναρξης είναι μετά την ώρα λήξης.');
    }
    if (duration > 2) {
        throw new Error('Η κράτηση δεν μπορεί να είναι πάνω από 2 ώρες.');
    }

    // Check for overlap
    const overlapStmt = sql.prepare(`
        SELECT * FROM schedule
        WHERE calendarId = ?
        AND (
            (? < end AND ? > start)
        )
    `);
    const overlaps = overlapStmt.all(
        event.calendarId,
        event.start, event.end
    );

    if (overlaps.length > 0) {
        throw new Error('Υπάρχει ήδη κράτηση σε αυτή τη χρονική περίοδο.');
    }
    const weekdayNames = [
    "Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"
        ];
        const bookingDate = new Date(event.start);
        const weekday = weekdayNames[bookingDate.getDay()];
        if (weekday === "Sunday") {
            throw new Error('Κυριακή είμαστε κλειστά.');
        }
        const openHourStmt = sql.prepare(`
        SELECT open_time, close_time FROM open_hours WHERE weekday = ?
        `);
        const openHour = openHourStmt.get(weekday);
    function timeToMinutes(t) {
            const [h, m] = t.split(':').map(Number);
            return h * 60 + m;
            }

    const bookingStart = bookingDate.getHours() * 60 + bookingDate.getMinutes();
    const bookingEnd = (new Date(event.end)).getHours() * 60 + (new Date(event.end)).getMinutes();

    if (openHour) {
    let open = timeToMinutes(openHour.open_time);
    let close = timeToMinutes(openHour.close_time);

   
    if (close <= open) close += 24 * 60;

    let start = bookingStart;
    let end = bookingEnd;
    if (end <= start) end += 24 * 60;
    console.log('open', open);
    console.log('close', close);
    console.log('start', start);
    console.log('end', end);
    if (start < open || end > close) {
        throw new Error('Η κράτηση είναι εκτός ωραρίου λειτουργίας.');
    }
    } else {
    throw new Error('Δεν υπάρχουν ωράρια λειτουργίας για αυτή την ημέρα.');
    }

    // Insert if all checks pass
    const stmt = sql.prepare(`
        INSERT INTO schedule (id, calendarId, title, category, start, end, isAllDay,court,trainer)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);
    stmt.run(
        event.id,
        event.calendarId,
        event.title,
        event.category,
        event.start,
        event.end,
        event.isAllDay ? 1 : 0,
        event.court,
        event.trainer
    );
};
export function getTrainerById(id) {
  console.log('Getting trainer with ID:', id);
  
  // Get trainer basic info
  const trainerStmt = sql.prepare(`
    SELECT id, name, img_path as img, bio, rating 
    FROM trainers 
    WHERE id = ?
  `);
  
  try {
    // Execute the query with the ID parameter
    const trainer = trainerStmt.get(id);
    console.log('Trainer query result:', trainer);

    if (!trainer) {
      console.log('No trainer found with ID:', id);
      return null;
    }

    // Get trainer skills
    const skillsStmt = sql.prepare(`
      SELECT skill 
      FROM trainer_skills 
      WHERE trainer_id = ?
    `);

    const skills = skillsStmt.all(id).map(row => row.skill);
    console.log('Trainer skills:', skills);

    // Add skills to trainer object
    trainer.skills = skills;

    return trainer;
  } catch (err) {
    console.error('Database error:', err);
    throw err;
  }
}
export async function getUserByUsername(username) {
    const stmt = sql.prepare('SELECT id, username, password FROM users WHERE username = ?');
    return stmt.get(username);
}

// You might also want to add a registration function
export async function registerUser(username, password, email) {
    // Check if username exists
    const existing = await getUserByUsername(username); // <-- await here!
    if (existing) {
        throw new Error('Το όνομα χρήστη υπάρχει ήδη');
    }

    // Hash password
    const hashedPassword = await argon2d.hash(password);

    // Insert new user
    const stmt = sql.prepare('INSERT INTO users (username, password, email) VALUES (?, ?, ?)');
    const result = stmt.run(username, hashedPassword, email);

    return { id: result.lastInsertRowid };
}