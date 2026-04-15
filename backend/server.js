const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static('uploads'));
app.use(express.static('.'));

// Папка для загрузки файлов
const uploadDir = 'uploads';
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir);
}

// Настройка multer для загрузки файлов
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage: storage });

// Инициализация SQLite БД
const db = new sqlite3.Database('./velar.db', (err) => {
    if (err) {
        console.error('Ошибка при открытии БД:', err);
    } else {
        console.log('БД загружена');
        initDatabase();
    }
});

// Создание таблиц
function initDatabase() {
    db.run(`
        CREATE TABLE IF NOT EXISTS cars (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            year INTEGER,
            emoji TEXT,
            image_url TEXT,
            price_1_2 INTEGER,
            price_3_6 INTEGER,
            price_7_14 INTEGER,
            price_15_24 INTEGER,
            price_25_plus INTEGER
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS bookings (
            id INTEGER PRIMARY KEY,
            car_name TEXT NOT NULL,
            phone TEXT,
            dates TEXT,
            status TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS reviews (
            id INTEGER PRIMARY KEY,
            car_name TEXT NOT NULL,
            rating INTEGER,
            text TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY,
            name TEXT NOT NULL,
            email TEXT,
            phone TEXT,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);
}

// === МАРШРУТЫ ДЛЯ АВТОМОБИЛЕЙ ===

// Получить все автомобили
app.get('/api/cars', (req, res) => {
    db.all('SELECT * FROM cars', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Получить автомобиль по ID
app.get('/api/cars/:id', (req, res) => {
    db.get('SELECT * FROM cars WHERE id = ?', [req.params.id], (err, row) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(row);
        }
    });
});

// Добавить автомобиль с фото
app.post('/api/cars', upload.single('image'), (req, res) => {
    const { name, year, emoji, price_1_2, price_3_6, price_7_14, price_15_24, price_25_plus } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const sql = `
        INSERT INTO cars (name, year, emoji, image_url, price_1_2, price_3_6, price_7_14, price_15_24, price_25_plus)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    db.run(sql, [name, year, emoji, imageUrl, price_1_2, price_3_6, price_7_14, price_15_24, price_25_plus], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, message: 'Автомобиль добавлен' });
        }
    });
});

// Обновить автомобиль
app.put('/api/cars/:id', upload.single('image'), (req, res) => {
    const { name, year, emoji, price_1_2, price_3_6, price_7_14, price_15_24, price_25_plus } = req.body;
    const imageUrl = req.file ? `/uploads/${req.file.filename}` : req.body.image_url;

    const sql = `
        UPDATE cars SET name = ?, year = ?, emoji = ?, image_url = ?, price_1_2 = ?, price_3_6 = ?, price_7_14 = ?, price_15_24 = ?, price_25_plus = ?
        WHERE id = ?
    `;

    db.run(sql, [name, year, emoji, imageUrl, price_1_2, price_3_6, price_7_14, price_15_24, price_25_plus, req.params.id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Автомобиль обновлён' });
        }
    });
});

// Удалить автомобиль
app.delete('/api/cars/:id', (req, res) => {
    db.run('DELETE FROM cars WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Автомобиль удалён' });
        }
    });
});

// === МАРШРУТЫ ДЛЯ БРОНИРОВАНИЙ ===

app.get('/api/bookings', (req, res) => {
    db.all('SELECT * FROM bookings ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/bookings', (req, res) => {
    const { car_name, phone, dates } = req.body;
    db.run('INSERT INTO bookings (car_name, phone, dates, status) VALUES (?, ?, ?, ?)', 
        [car_name, phone, dates, 'pending'], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, message: 'Бронирование добавлено' });
        }
    });
});

app.delete('/api/bookings/:id', (req, res) => {
    db.run('DELETE FROM bookings WHERE id = ?', [req.params.id], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ message: 'Бронирование удалено' });
        }
    });
});

// === МАРШРУТЫ ДЛЯ ОТЗЫВОВ ===

app.get('/api/reviews', (req, res) => {
    db.all('SELECT * FROM reviews ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/reviews', (req, res) => {
    const { car_name, rating, text } = req.body;
    db.run('INSERT INTO reviews (car_name, rating, text) VALUES (?, ?, ?)', 
        [car_name, rating, text], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, message: 'Отзыв добавлен' });
        }
    });
});

// === МАРШРУТЫ ДЛЯ ПОЛЬЗОВАТЕЛЕЙ ===

app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/users', (req, res) => {
    const { name, email, phone } = req.body;
    db.run('INSERT INTO users (name, email, phone) VALUES (?, ?, ?)', 
        [name, email, phone], function(err) {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ id: this.lastID, message: 'Пользователь добавлен' });
        }
    });
});

// Запуск сервера
app.listen(PORT, () => {
    console.log(`Сервер запущен на http://localhost:${PORT}`);
});
