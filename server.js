// Minimal Node + Express demo server for Jitsi booking + join flow
// WARNING: This is a demo with an in-memory 'DB' and stubbed auth. Do NOT use as-is in production.

const express = require('express');
const bodyParser = require('body-parser');
const { nanoid } = require('nanoid');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));

// In-memory DB: bookings keyed by bookingId
const bookings = {}; // { bookingId: { bookingId, mentorId, menteeId, startAt, endAt, roomName, status } }

// Simple auth stub middleware for demo:
// Pass ?userId=123&role=mentor or mentee in the URL when testing join route.
app.use((req, res, next) => {
  const { userId, role, displayName } = req.query;
  if (userId) {
    req.user = { id: userId, role: role || 'mentee', displayName: displayName || `User-${userId}` };
  }
  next();
});

// Helper to generate room name
function generateRoomName(mentorId, bookingId){
  const suffix = nanoid(8); // random-ish
  return `mentor-${mentorId}-${bookingId}-${suffix}`;
}

// POST /book
// Body: { mentorId, menteeId, startAt, endAt }
app.post('/book', (req, res) => {
  const { mentorId, menteeId, startAt, endAt } = req.body;
  if (!mentorId || !menteeId || !startAt || !endAt) return res.status(400).json({ error: 'mentorId, menteeId, startAt, endAt required' });
  const bookingId = String(Date.now());
  const roomName = generateRoomName(mentorId, bookingId);
  const booking = { bookingId, mentorId, menteeId, startAt, endAt, roomName, createdAt: new Date().toISOString(), status: 'confirmed' };
  bookings[bookingId] = booking;

  // For demo: return join URL and booking object. In production don't expose roomName until appropriate or secure it.
  const joinUrl = `${getBaseUrl(req)}/join/${bookingId}`;
  res.json({ booking, joinUrl, jitsiUrl: `https://meet.jit.si/${roomName}` });
});

// GET /booking/:id (returns booking if user is mentor/mentee)
app.get('/booking/:id', (req, res) => {
  const booking = bookings[req.params.id];
  if (!booking) return res.status(404).json({ error: 'Booking not found' });
  // Simple authorization: allow if user query matches mentorId or menteeId
  if (req.user && (req.user.id === booking.mentorId || req.user.id === booking.menteeId)) return res.json(booking);
  return res.status(403).json({ error: 'Forbidden' });
});

// GET /join/:bookingId -> validates user & time window, then serves join.html with placeholders replaced
app.get('/join/:bookingId', (req, res) => {
  const booking = bookings[req.params.bookingId];
  if (!booking) return res.status(404).send('Booking not found');
  if (!req.user) return res.status(401).send('You must be logged in for demo: add ?userId=...&role=mentor or mentee');
  // Check user is mentor or mentee
  if (req.user.id !== booking.mentorId && req.user.id !== booking.menteeId) return res.status(403).send('Forbidden: not part of this booking');

  // Time window: allow 10 minutes before start until end + 10 minutes
  const now = new Date();
  const start = new Date(booking.startAt);
  const end = new Date(booking.endAt);
  const windowStart = new Date(start.getTime() - 10*60*1000);
  const windowEnd = new Date(end.getTime() + 10*60*1000);
  if (now < windowStart || now > windowEnd) {
    return res.status(403).send(`You can join between ${windowStart.toISOString()} and ${windowEnd.toISOString()}`);
  }

  // Render join.html from /public/join.html with simple replacement
  const joinHtmlPath = path.join(__dirname, 'public', 'join.html');
  let html = fs.readFileSync(joinHtmlPath, 'utf8');
  html = html.replace(/REPLACE_WITH_ROOM_NAME/g, booking.roomName);
  html = html.replace(/REPLACE_WITH_DISPLAY_NAME/g, req.user.displayName || 'Guest');
  res.send(html);
});

// POST /api/record-join to record attendance (demo)
app.post('/api/record-join', (req, res) => {
  // in a real app you'd parse req.body and store attendance 
  console.log('attendance payload', req.body);
  res.json({ status: 'ok' });
});

function getBaseUrl(req){
  return (req.protocol + '://' + req.get('host'));
}

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Demo server running on http://localhost:${PORT}`));
