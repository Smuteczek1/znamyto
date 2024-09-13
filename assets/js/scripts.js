document.addEventListener('DOMContentLoaded', function() {
    const loginModal = document.getElementById('login-modal');
    const registerModal = document.getElementById('register-modal');
    const loginLink = document.getElementById('login-link');
    const registerLink = document.getElementById('register-link');
    const closeLogin = document.getElementById('close-login');
    const closeRegister = document.getElementById('close-register');
    const showRegister = document.getElementById('show-register');
    const showLogin = document.getElementById('show-login');

    function showModal(modal) {
        modal.style.display = 'block';
        document.body.style.overflow = 'hidden'; // Zapobiega przewijaniu w tle
    }

    function hideModal(modal) {
        modal.style.display = 'none';
        document.body.style.overflow = 'auto'; // Przywraca przewijanie w tle
    }

    loginLink.addEventListener('click', function(event) {
        event.preventDefault();
        showModal(loginModal);
    });

    registerLink.addEventListener('click', function(event) {
        event.preventDefault();
        showModal(registerModal);
    });

    closeLogin.addEventListener('click', function() {
        hideModal(loginModal);
    });

    closeRegister.addEventListener('click', function() {
        hideModal(registerModal);
    });

    showRegister.addEventListener('click', function(event) {
        event.preventDefault();
        hideModal(loginModal);
        showModal(registerModal);
    });

    showLogin.addEventListener('click', function(event) {
        event.preventDefault();
        hideModal(registerModal);
        showModal(loginModal);
    });

    // Hide modals when clicking outside of them
    window.addEventListener('click', function(event) {
        if (event.target === loginModal) {
            hideModal(loginModal);
        }
        if (event.target === registerModal) {
            hideModal(registerModal);
        }
    });
});
