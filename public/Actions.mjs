

fetch('/me', { credentials: 'include' })
    .then(res => res.ok ? res.json() : { id: null })
    .then(data => updateNavbarForAuth(data.id));
document.querySelectorAll("#connection").forEach(button => {
    button.addEventListener("click", log_in);
});
document.getElementById("load-courts").addEventListener("click", function (event) {
    event.preventDefault();
    window.location.href = "/courts";
});
  
function loadModalCSS() {
    if (!document.querySelector("#modal-css")) {
        const link = document.createElement("link");
        link.id = "modal-css";
        link.rel = "stylesheet";
        link.href = "log_in.css";  // Load your modal styles
        document.head.appendChild(link);
    }
}
export function updateNavbarForAuth(userId) {
    const connBtn = document.getElementById("connection");
    if (!connBtn) return;
    if (userId) {
        connBtn.textContent = "Έξοδος";
        connBtn.onclick = function(e) {
            e.preventDefault();
            fetch('/logout', { method: 'POST', credentials: 'include' })
                .then(() => window.location.reload());
        };
    } else {
        connBtn.textContent = "Σύνδεση";
        connBtn.onclick = function(e) {
            e.preventDefault();
            log_in();
        };
    }
}
export function log_in(onSuccess) {
    loadModalCSS();

    const overlay = document.createElement("div");
    overlay.className = "modal-overlay";

    const modalContainer = document.createElement("div");
    modalContainer.className = "login-modal";

    modalContainer.innerHTML = `
        <div class="modal-header">
            <h2>Σύνδεση</h2>
            <button class="close-modal" aria-label="Close">&times;</button>
        </div>
        <div class="modal-body">
            <form id="login-form" autocomplete="off">  
                <div class="form-group">
                    <label for="username">Όνομα Χρήστη</label>
                    <input type="text" id="username" name="username" required>
                </div>
                <div class="form-group">
                    <label for="password">Κωδικός</label>
                    <input type="password" id="password" name="password" required>
                </div>
                <button type="submit" class="login-btn">Σύνδεση</button>
            </form>
            <div class="register-section">
                <p>Δεν έχετε λογαριασμό;</p>
                <button id="show-register" class="register-btn">Εγγραφή</button>
            </div>
            <div id="register-form-container"></div>
        </div>
    `;

    // Add the register form to its container
    const registerFormHTML = `
        <form id="register-form" style="display: none;">
            <div class="form-group">
                <label for="reg-username">Όνομα Χρήστη</label>
                <input type="text" id="reg-username" name="username" required>
            </div>
            <div class="form-group">
                <label for="reg-email">Email</label>
                <input type="email" id="reg-email" name="email" required>
            </div>
            <div class="form-group">
                <label for="reg-password">Κωδικός</label>
                <input type="password" id="reg-password" name="password" required>
            </div>
            <div class="form-group">
                <label for="reg-password-confirm">Επιβεβαίωση Κωδικού</label>
                <input type="password" id="reg-password-confirm" required>
            </div>
            <div class="form-actions">
                <button type="submit" class="register-btn">Εγγραφή</button>
                <button type="button" class="back-to-login">Επιστροφή στη Σύνδεση</button>
            </div>
            <div class="login-section" style="margin-top: 15px; text-align: center;">
                <p>Έχετε ήδη λογαριασμό;</p>
                <button type="button" class="switch-to-login">Σύνδεση</button>
            </div>
        </form>
    `;

    overlay.appendChild(modalContainer);
    document.body.appendChild(overlay);
    
    // Add register form to the container
    modalContainer.querySelector("#register-form-container").innerHTML = registerFormHTML;

    // Get references to all elements AFTER they've been added to the DOM
    const loginForm = modalContainer.querySelector("#login-form");
    const registerFormElement = modalContainer.querySelector("#register-form");
    const registerSection = modalContainer.querySelector(".register-section");

    // Show modal with animation
    setTimeout(() => overlay.classList.add("active"), 10);

    // Close button functionality
    const closeModal = () => {
        overlay.classList.remove("active");
        setTimeout(() => overlay.remove(), 300);
    };

    modalContainer.querySelector(".close-modal").addEventListener("click", closeModal);

    // Handle form submission
    loginForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const username = loginForm.username.value;
        const password = loginForm.password.value;

        fetch("/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: 'include',
            body: JSON.stringify({ username, password })
        })
        .then(res => {
            if (!res.ok) throw new Error("Λάθος στοιχεία!");
            return res.json();
        })
        .then(() => {
            closeModal();
            fetch('/me', { credentials: 'include' })
        .then(res => res.ok ? res.json() : { id: null })
        .then(data => updateNavbarForAuth(data.id));
    if (onSuccess) onSuccess(); // Call the callback after successful login
        })
        .catch(err => {
            alert(err.message);
        });
    });

    // Show register form when button is clicked
    modalContainer.querySelector('#show-register').addEventListener('click', () => {
        loginForm.style.display = 'none';
        registerFormElement.style.display = 'block';
        registerSection.style.display = 'none';
    });

    // Function to switch back to login form
    function switchToLogin() {
        loginForm.style.display = 'block';
        registerFormElement.style.display = 'none';
        registerSection.style.display = 'block';
    }

    // Add both ways to return to login form
    modalContainer.querySelector('.back-to-login').addEventListener('click', switchToLogin);
    modalContainer.querySelector('.switch-to-login').addEventListener('click', switchToLogin);

    // Update register form submission to include email
    registerFormElement.addEventListener('submit', (e) => {
        e.preventDefault();
        const username = registerFormElement.querySelector('#reg-username').value;
        const email = registerFormElement.querySelector('#reg-email').value;
        const password = registerFormElement.querySelector('#reg-password').value;
        const confirmPassword = registerFormElement.querySelector('#reg-password-confirm').value;

        if (password !== confirmPassword) {
            alert('Οι κωδικοί δεν ταιριάζουν!');
            return;
        }

        fetch('/register', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, email, password })
        })
        .then(res => {
            if (!res.ok) throw new Error('Η εγγραφή απέτυχε');
            return res.json();
        })
        .then(data => {
            alert('Επιτυχής εγγραφή! Παρακαλώ συνδεθείτε.');
            switchToLogin();
        })
        .catch(err => {
            alert(err.message);
        });
    });

    // Stop propagation of clicks inside the modal
    modalContainer.addEventListener("click", (e) => {
        e.stopPropagation();
    });

    // Close on overlay click
    overlay.addEventListener("click", closeModal);

    return overlay; // Return the overlay element
}