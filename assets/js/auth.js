// Funkcja do szyfrowania Base64
function base64Encode(data) {
    return btoa(data);
}

// Funkcja do deszyfrowania Base64
function base64Decode(data) {
    return atob(data);
}

// Funkcja do szyfrowania SHA-256
async function sha256Encode(data) {
    const encoder = new TextEncoder();
    const dataArray = encoder.encode(data);
    const hashBuffer = await crypto.subtle.digest('SHA-256', dataArray);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
}

// Funkcja do szyfrowania AES
async function aesEncrypt(data, key) {
    const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'AES-CBC' }, false, ['encrypt']);
    const iv = window.crypto.getRandomValues(new Uint8Array(16));
    const encrypted = await crypto.subtle.encrypt({ name: 'AES-CBC', iv: iv }, cryptoKey, new TextEncoder().encode(data));
    const buffer = new Uint8Array(encrypted);
    return { iv: base64Encode(String.fromCharCode.apply(null, iv)), data: base64Encode(String.fromCharCode.apply(null, buffer)) };
}

// Funkcja do szyfrowania hasła
async function encryptPassword(password) {
    const sha256 = await sha256Encode(password);
    const aesKey = 'your-unique-aes-key'; // Powinien być bezpiecznie przechowywany i unikalny
    const encrypted = await aesEncrypt(sha256, aesKey);
    return JSON.stringify(encrypted);
}

// Funkcja do deszyfrowania AES
async function aesDecrypt(encrypted, key) {
    const iv = new Uint8Array(base64Decode(encrypted.iv).split('').map(c => c.charCodeAt(0)));
    const data = new Uint8Array(base64Decode(encrypted.data).split('').map(c => c.charCodeAt(0)));
    const cryptoKey = await crypto.subtle.importKey('raw', new TextEncoder().encode(key), { name: 'AES-CBC' }, false, ['decrypt']);
    const decrypted = await crypto.subtle.decrypt({ name: 'AES-CBC', iv: iv }, cryptoKey, data);
    return new TextDecoder().decode(decrypted);
}

// Funkcja do deszyfrowania hasła
async function decryptPassword(encryptedPassword) {
    const aesKey = 'your-unique-aes-key'; // Ten sam klucz AES, co przy szyfrowaniu
    const parsed = JSON.parse(encryptedPassword);
    return aesDecrypt(parsed, aesKey);
}

document.getElementById('register-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const name = document.getElementById('register-username').value;
    const email = document.getElementById('register-email').value;
    const password = document.getElementById('register-password').value;
    const passwordConfirm = document.getElementById('register-password-confirm').value;

    if (password !== passwordConfirm) {
        alert('Hasła nie są identyczne!');
        return;
    }

    let users = JSON.parse(localStorage.getItem('users')) || [];
    if (users.find(user => base64Decode(user.data.email) === email)) {
        alert('Użytkownik o tym emailu już istnieje!');
        return;
    }

    const encryptedPassword = await encryptPassword(password);

    const newUser = {
        "ID": generateUniqueID(),
        "data": {
            "name": base64Encode(name),
            "email": base64Encode(email),
            "password": encryptedPassword,
            "role": base64Encode('user') // Można również zaszyfrować rolę
        }
    };

    users.push(newUser);
    localStorage.setItem('users', JSON.stringify(users));

    alert('Rejestracja zakończona sukcesem!');
    hideModal(document.getElementById('register-modal'));
});

document.getElementById('login-form').addEventListener('submit', async function(event) {
    event.preventDefault();

    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    let users = JSON.parse(localStorage.getItem('users')) || [];
    let user = users.find(user => base64Decode(user.data.email) === email);

    if (user) {
        const decryptedPassword = await decryptPassword(user.data.password);
        const hashedPassword = await sha256Encode(password);

        if (decryptedPassword === hashedPassword) {
            alert('Zalogowano pomyślnie!');
            // Tu możesz dodać kod do przekierowania użytkownika lub ustawienia sesji
            hideModal(document.getElementById('login-modal'));
        } else {
            alert('Niepoprawny email lub hasło!');
        }
    } else {
        alert('Niepoprawny email lub hasło!');
    }
});

function generateUniqueID() {
    return '_' + Math.random().toString(36).substr(2, 9);
}
