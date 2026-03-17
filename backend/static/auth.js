// auth.js

// Утилита: сохранение пользователя
function saveUser(email, password) {
    const users = JSON.parse(localStorage.getItem('lume_users') || '[]');
    const exists = users.some(user => user.email === email);
    if (!exists) {
        users.push({ email, password });
        localStorage.setItem('lume_users', JSON.stringify(users));
        return true;
    }
    return false; // пользователь уже существует
}

// Утилита: проверка учётных данных
function validateUser(email, password) {
    const users = JSON.parse(localStorage.getItem('lume_users') || '[]');
    return users.some(user => user.email === email && user.password === password);
}

// Утилита: установка текущего пользователя
function setCurrentUser(email) {
    localStorage.setItem('lume_current_user', email);
}

// Утилита: получение текущего пользователя
function getCurrentUser() {
    return localStorage.getItem('lume_current_user');
}

// Утилита: выход из аккаунта
function logout() {
    localStorage.removeItem('lume_current_user');
}