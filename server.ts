import express from "express";
import { createServer as createViteServer } from "vite";
import Database from "better-sqlite3";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("platform.db");

// Initialize database
db.exec(`
  CREATE TABLE IF NOT EXISTS courses (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    thumbnail TEXT,
    category TEXT,
    instructor TEXT,
    duration TEXT
  );

  CREATE TABLE IF NOT EXISTS lessons (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    course_id INTEGER,
    title TEXT NOT NULL,
    content TEXT,
    video_url TEXT,
    order_index INTEGER,
    FOREIGN KEY (course_id) REFERENCES courses (id)
  );

  CREATE TABLE IF NOT EXISTS progress (
    user_id TEXT,
    lesson_id INTEGER,
    completed INTEGER DEFAULT 0,
    PRIMARY KEY (user_id, lesson_id)
  );
`);

// Seed data if empty
const courseCount = db.prepare("SELECT COUNT(*) as count FROM courses").get() as { count: number };
if (courseCount.count === 0) {
  const insertCourse = db.prepare("INSERT INTO courses (title, description, thumbnail, category, instructor, duration) VALUES (?, ?, ?, ?, ?, ?)");
  const insertLesson = db.prepare("INSERT INTO lessons (course_id, title, content, video_url, order_index) VALUES (?, ?, ?, ?, ?)");

  const courseId = insertCourse.run(
    "Mastering Modern UI Design",
    "Learn the principles of professional UI design using modern tools and techniques.",
    "https://picsum.photos/seed/ui/800/450",
    "Design",
    "Alex Rivera",
    "6h 30m"
  ).lastInsertRowid;

  insertLesson.run(courseId, "Introduction to Visual Hierarchy", "Visual hierarchy is the arrangement or presentation of elements in a way that implies importance.", "https://example.com/video1", 1);
  insertLesson.run(courseId, "Color Theory for Interfaces", "Understanding how color affects user perception and accessibility.", "https://example.com/video2", 2);
  insertLesson.run(courseId, "Typography and Readability", "Choosing the right fonts and setting up a modular scale.", "https://example.com/video3", 3);

  const courseId2 = insertCourse.run(
    "Full-Stack Development with React",
    "Build scalable applications from scratch using the latest web technologies.",
    "https://picsum.photos/seed/code/800/450",
    "Development",
    "Sarah Chen",
    "12h 45m"
  ).lastInsertRowid;

  insertLesson.run(courseId2, "React 19 Fundamentals", "Getting started with the new features in React 19.", "https://example.com/video4", 1);
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Routes
  app.get("/api/courses", (req, res) => {
    const courses = db.prepare("SELECT * FROM courses").all();
    res.json(courses);
  });

  app.get("/api/courses/:id", (req, res) => {
    const course = db.prepare("SELECT * FROM courses WHERE id = ?").get(req.params.id) as any;
    if (!course) return res.status(404).json({ error: "Course not found" });
    
    const lessons = db.prepare("SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index").all(req.params.id);
    res.json({ ...course, lessons });
  });

  app.get("/api/progress/:userId", (req, res) => {
    const progress = db.prepare("SELECT lesson_id, completed FROM progress WHERE user_id = ?").all(req.params.userId);
    res.json(progress);
  });

  app.post("/api/progress", (req, res) => {
    const { userId, lessonId, completed } = req.body;
    db.prepare("INSERT OR REPLACE INTO progress (user_id, lesson_id, completed) VALUES (?, ?, ?)")
      .run(userId, lessonId, completed ? 1 : 0);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
