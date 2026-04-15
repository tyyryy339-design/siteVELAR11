// === БАЗА ДАННЫХ ===
class Database {
    constructor() {
        this.storageKey = 'velar_db';
        this.initDB();
    }

    initDB() {
        if (!localStorage.getItem(this.storageKey)) {
            localStorage.setItem(this.storageKey, JSON.stringify({
                bookings: [],
                users: [],
                reviews: []
            }));
        }
    }

    getAll(table) {
        const db = JSON.parse(localStorage.getItem(this.storageKey));
        return db[table] || [];
    }

    add(table, data) {
        const db = JSON.parse(localStorage.getItem(this.storageKey));
        const id = db[table].length > 0 ? Math.max(...db[table].map(d => d.id || 0)) + 1 : 1;
        const newRecord = { id, ...data, createdAt: new Date().toISOString() };
        db[table].push(newRecord);
        localStorage.setItem(this.storageKey, JSON.stringify(db));
        return newRecord;
    }

    update(table, id, data) {
        const db = JSON.parse(localStorage.getItem(this.storageKey));
        const index = db[table].findIndex(d => d.id === id);
        if (index !== -1) {
            db[table][index] = { ...db[table][index], ...data };
            localStorage.setItem(this.storageKey, JSON.stringify(db));
            return db[table][index];
        }
        return null;
    }

    delete(table, id) {
        const db = JSON.parse(localStorage.getItem(this.storageKey));
        db[table] = db[table].filter(d => d.id !== id);
        localStorage.setItem(this.storageKey, JSON.stringify(db));
        return true;
    }

    getById(table, id) {
        const records = this.getAll(table);
        return records.find(d => d.id === id);
    }
}

const db = new Database();

// === ФУНКЦИИ РАБОТЫ С БРОНИРОВАНИЯМИ ===
function saveBooking(carName, phone, dates) {
    const booking = db.add('bookings', {
        carName: carName,
        phone: phone,
        dates: dates,
        status: 'pending'
    });
    console.log('Бронирование сохранено:', booking);
    return booking;
}

function getBookings() {
    return db.getAll('bookings');
}

function updateBooking(id, status) {
    return db.update('bookings', id, { status: status });
}

function deleteBooking(id) {
    return db.delete('bookings', id);
}

// === ФУНКЦИИ РАБОТЫ С ОТЗЫВАМИ ===
function saveReview(carName, rating, text) {
    const review = db.add('reviews', {
        carName: carName,
        rating: rating,
        text: text
    });
    console.log('Отзыв сохранён:', review);
    return review;
}

function getReviews() {
    return db.getAll('reviews');
}

// === ФУНКЦИИ РАБОТЫ С ПОЛЬЗОВАТЕЛЯМИ ===
function saveUser(name, email, phone) {
    const user = db.add('users', {
        name: name,
        email: email,
        phone: phone
    });
    console.log('Пользователь сохранён:', user);
    return user;
}

function getUsers() {
    return db.getAll('users');
}

// Автомобили
const allCars = [
    {
        id: 1,
        name: 'Geely Emgrand',
        year: '2024',
        emoji: '🚙',
        prices: {
            '1-2 суток': 23000,
            '3-6 суток': 20000,
            '7-14 суток': 19000,
            '15-24 суток': 17000,
            '25+ месяц': 15000
        }
    },
    {
        id: 2,
        name: 'Changan CS55 Plus',
        year: '2024',
        emoji: '🚗',
        image: './backend/uploads/changan.jpg',
        prices: {
            '1-2 суток': 38000,
            '3-6 суток': 35000,
            '7-14 суток': 32000,
            '15-24 суток': 30000,
            '25+ месяц': 28000
        }
    },
    {
        id: 3,
        name: 'Mercedes-Benz CLS',
        year: '2013',
        emoji: '🏎️',
        prices: {
            '1-2 суток': 60000,
            '3-6 суток': 55000,
            '7-14 суток': 50000,
            '15-24 суток': 45000,
            '25+ месяц': 40000
        }
    },
    {
        id: 4,
        name: 'Jetour X95',
        year: '2023',
        emoji: '🚕',
        prices: {
            '1-2 суток': 42000,
            '3-6 суток': 38000,
            '7-14 суток': 35000,
            '15-24 суток': 37000,
            '25+ месяц': 25000
        }
    },
    {
        id: 5,
        name: 'Mercedes Benz C-300',
        year: '2017',
        emoji: '🏎️',
        prices: {
            '1-2 суток': 40000,
            '3-6 суток': 36000,
            '7-14 суток': 32000,
            '15-24 суток': 28000,
            '25+ месяц': 25000
        }
    },
    {
        id: 6,
        name: 'Toyota Camry',
        year: '2022',
        emoji: '🚗',
        prices: {
            '1-2 суток': 35000,
            '3-6 суток': 32000,
            '7-14 суток': 29000,
            '15-24 суток': 26000,
            '25+ месяц': 22000
        }
    },
    {
        id: 7,
        name: 'BMW X5',
        year: '2023',
        emoji: '🚙',
        prices: {
            '1-2 суток': 85000,
            '3-6 суток': 75000,
            '7-14 суток': 70000,
            '15-24 суток': 65000,
            '25+ месяц': 55000
        }
    },
    {
        id: 8,
        name: 'Audi A6',
        year: '2021',
        emoji: '🏎️',
        prices: {
            '1-2 суток': 55000,
            '3-6 суток': 50000,
            '7-14 суток': 45000,
            '15-24 суток': 40000,
            '25+ месяц': 35000
        }
    }
];

// Отрисовка машин
function renderCars(carsToShow = allCars) {
    const list = document.getElementById('carsList');
    list.innerHTML = '';
    
    carsToShow.forEach(car => {
        const card = document.createElement('div');
        card.className = 'car-card';
        
        let carImageContent;
        if (car.image) {
            carImageContent = `<img src="${car.image}" alt="${car.name}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='${car.emoji}'">`;
        } else {
            carImageContent = car.emoji;
        }
        
        card.innerHTML = `
            <div class="car-image">${carImageContent}</div>
            <div class="car-info">
                <div class="car-name">${car.name}</div>
                <div class="car-year">${car.year} год</div>
                <div class="car-prices">
                    ${Object.entries(car.prices).map(([prd, pr]) => 
                        `<div class="car-price-row">
                            <span class="price-label">${prd}</span>
                            <span class="price-value">${pr.toLocaleString()}₸</span>
                        </div>`
                    ).join('')}
                    <p style="margin-top: 8px; font-size: 11px; color: #999;">Цены указаны в пределах города</p>
                </div>
                <div class="car-footer">
                    <button class="btn btn-secondary" onclick="showCar(${car.id})">ПОДРОБНЕЕ</button>
                    <button class="btn btn-primary" onclick="reserve('${car.name}')">ЗАБРОНИРОВАТЬ</button>
                </div>
            </div>
        `;
        list.appendChild(card);
    });
}

// Поиск
document.getElementById('searchInput')?.addEventListener('input', (e) => {
    const term = e.target.value.toLowerCase();
    const found = allCars.filter(c => c.name.toLowerCase().includes(term));
    renderCars(found);
});

// Фильтр цены
document.getElementById('filterPrice')?.addEventListener('change', (e) => {
    const val = e.target.value;
    let res = allCars;
    
    if (val === 'cheap') {
        res = allCars.filter(c => c.prices['1-2 суток'] <= 30000);
    } else if (val === 'mid') {
        res = allCars.filter(c => {
            const p = c.prices['1-2 суток'];
            return p >= 30000 && p <= 50000;
        });
    } else if (val === 'premium') {
        res = allCars.filter(c => c.prices['1-2 суток'] > 50000);
    }
    
    renderCars(res);
});

// Показать детали
function showCar(id) {
    const car = allCars.find(c => c.id === id);
    if (car) {
        alert(`${car.name} (${car.year})\n\nМин. цена: ${Math.min(...Object.values(car.prices)).toLocaleString()}₸\nМакс. цена: ${Math.max(...Object.values(car.prices)).toLocaleString()}₸`);
    }
}

// Забронировать
function reserve(name) {
    const phone = prompt('Введите ваш номер телефона:');
    const dates = prompt('Введите даты аренды (например: 15-20 апреля):');
    
    if (phone && dates) {
        // Сохраняем в базу данных
        const booking = saveBooking(name, phone, dates);
        
        // Отправляем в WhatsApp
        const msg = encodeURIComponent(`Здравствуйте, хочу забронировать ${name}. Даты: ${dates}. Телефон: ${phone}`);
        window.open(`https://wa.me/48515919678?text=${msg}`, '_blank');
        
        alert('Ваше бронирование сохранено! Мы свяжемся с вами.');
    }
}

// Плавная прокрутка
function scrollToCars() {
    document.getElementById('cars').scrollIntoView({ behavior: 'smooth' });
}

function loadMore() {
    alert('Загрузка дополнительных автомобилей...');
}

// Инициализация
document.addEventListener('DOMContentLoaded', () => {
    renderCars();
});
