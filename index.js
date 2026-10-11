const currentUser = sessionStorage.getItem("habitTrackerUser");
const habitsStorageKey = currentUser
    ? `habits:${encodeURIComponent(currentUser)}`
    : null;
const legacyHabitsKey = "habits";

function loadHabits() {
    if (!habitsStorageKey) {
        return [];
    }

    let storedHabits = localStorage.getItem(habitsStorageKey);
    if (storedHabits === null) {
        storedHabits = localStorage.getItem(legacyHabitsKey);
        if (storedHabits !== null) {
            localStorage.setItem(habitsStorageKey, storedHabits);
            localStorage.removeItem(legacyHabitsKey);
        }
    }

    if (storedHabits === null) {
        return [];
    }

    const savedHabits = JSON.parse(storedHabits);
    if (!Array.isArray(savedHabits)) {
        throw new Error("Saved habit data is invalid.");
    }

    return savedHabits;
}

let habits = loadHabits();

function saveHabits() {
    if (!habitsStorageKey) {
        throw new Error("Cannot save habits without a logged-in account.");
    }

    localStorage.setItem(habitsStorageKey, JSON.stringify(habits));
}

// Show habits when dashboard opens
if (document.getElementById("habitList")) {
    displayHabits();
}

// Add Habit
function addHabit() {
    let input = document.getElementById("habitInput");

    if (input.value.trim() === "") {
        alert("Please enter a habit");
        return;
    }

    habits.push({
        name: input.value,
        completed: false
    });

    saveHabits();

    input.value = "";

    displayHabits();
}

// Display Habits
function displayHabits() {

    let list = document.getElementById("habitList");

    list.innerHTML = "";

    habits.forEach((habit, index) => {

        let li = document.createElement("li");

        li.innerHTML = `
        <input type="checkbox"
        ${habit.completed ? "checked" : ""}
        onchange="toggleHabit(${index})">

        ${habit.name}
        `;

        list.appendChild(li);

    });

}

// Mark Habit Completed
function toggleHabit(index) {

    habits[index].completed = !habits[index].completed;

    saveHabits();

    displayHabits();
}

// Progress Page
if (document.getElementById("total")) {

    let total = habits.length;

    let completed = habits.filter(habit => habit.completed).length;

    let percentage = total == 0 ? 0 : Math.round((completed / total) * 100);

    document.getElementById("total").innerText = total;

    document.getElementById("completed").innerText = completed;

    document.getElementById("percentage").innerText = percentage + "%";

    document.getElementById("progressBar").value = percentage;

}