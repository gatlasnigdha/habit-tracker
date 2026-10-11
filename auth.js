const ACCOUNTS_KEY = "habitTrackerAccounts";
const SESSION_KEY = "habitTrackerUser";
const PASSWORD_ITERATIONS = 100000;

const authMessage = document.getElementById("authMessage");

function showAuthMessage(message) {
    if (authMessage) {
        authMessage.textContent = message;
    }
}

function loadAccounts() {
    const storedAccounts = localStorage.getItem(ACCOUNTS_KEY);
    if (storedAccounts === null) {
        return {};
    }

    const accounts = JSON.parse(storedAccounts);
    if (accounts === null || typeof accounts !== "object" || Array.isArray(accounts)) {
        throw new Error("Saved account data is invalid.");
    }

    return accounts;
}

function normalizeEmail(email) {
    return email.trim().toLowerCase();
}

async function hashPassword(password, salt) {
    const key = await crypto.subtle.importKey(
        "raw",
        new TextEncoder().encode(password),
        "PBKDF2",
        false,
        ["deriveBits"]
    );
    const bits = await crypto.subtle.deriveBits(
        {
            name: "PBKDF2",
            salt,
            iterations: PASSWORD_ITERATIONS,
            hash: "SHA-256"
        },
        key,
        256
    );

    return Array.from(new Uint8Array(bits), byte => byte.toString(16).padStart(2, "0")).join("");
}

async function createAccount(event) {
    event.preventDefault();
    showAuthMessage("");

    const form = event.currentTarget;
    const email = normalizeEmail(form.elements.email.value);
    const password = form.elements.password.value;

    try {
        const accounts = loadAccounts();
        if (Object.prototype.hasOwnProperty.call(accounts, email)) {
            showAuthMessage("An account with this email already exists. Please log in.");
            return;
        }

        const salt = crypto.getRandomValues(new Uint8Array(16));
        const passwordHash = await hashPassword(password, salt);
        accounts[email] = {
            salt: Array.from(salt, byte => byte.toString(16).padStart(2, "0")).join(""),
            passwordHash
        };
        localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(accounts));
        showAuthMessage("Account created. You can now log in.");
        document.getElementById("signupForm").reset();
        document.getElementById("signupPanel").hidden = true;
        document.getElementById("loginPanel").hidden = false;
        document.getElementById("loginEmail").value = email;
    } catch (error) {
        console.error("Unable to create account:", error);
        showAuthMessage("Unable to create your account. Please try again.");
    }
}

async function login(event) {
    event.preventDefault();
    showAuthMessage("");

    const form = event.currentTarget;
    const email = normalizeEmail(form.elements.email.value);
    const password = form.elements.password.value;

    try {
        const accounts = loadAccounts();
        if (!Object.prototype.hasOwnProperty.call(accounts, email)) {
            showAuthMessage("No account exists for this email. Please sign up first.");
            return;
        }

        const account = accounts[email];
        if (
            !account ||
            typeof account.salt !== "string" ||
            !/^[0-9a-f]{32}$/i.test(account.salt) ||
            typeof account.passwordHash !== "string"
        ) {
            throw new Error("Saved account data is invalid.");
        }

        const salt = Uint8Array.from(
            account.salt.match(/.{2}/g),
            byte => parseInt(byte, 16)
        );
        const passwordHash = await hashPassword(password, salt);
        if (passwordHash !== account.passwordHash) {
            showAuthMessage("Incorrect email or password.");
            return;
        }

        sessionStorage.setItem(SESSION_KEY, email);
        window.location.assign("dashboard.html");
    } catch (error) {
        console.error("Unable to log in:", error);
        showAuthMessage("Unable to log in. Please try again.");
    }
}

function logout(event) {
    event.preventDefault();
    try {
        sessionStorage.removeItem(SESSION_KEY);
        window.location.assign("login.html");
    } catch (error) {
        console.error("Unable to log out:", error);
        alert("Unable to log out. Please try again.");
    }
}

if (document.body.dataset.authRequired === "true" && !sessionStorage.getItem(SESSION_KEY)) {
    window.location.replace("login.html");
}

const loginForm = document.getElementById("loginForm");
if (loginForm) {
    loginForm.addEventListener("submit", login);
    document.getElementById("signupForm").addEventListener("submit", createAccount);
    document.getElementById("showSignup").addEventListener("click", () => {
        showAuthMessage("");
        document.getElementById("loginPanel").hidden = true;
        document.getElementById("signupPanel").hidden = false;
    });
    document.getElementById("showLogin").addEventListener("click", () => {
        showAuthMessage("");
        document.getElementById("signupPanel").hidden = true;
        document.getElementById("loginPanel").hidden = false;
    });
}

window.logout = logout;
