var checkbox = document.getElementById("checkbox");
let countdownMinutes = document.getElementById("clock-minutes");
let countdownSeconds = document.getElementById("clock-seconds");
let startTime;

const screenTimeElements = document.querySelectorAll(".screentime");
let screenTime = 1200000;

let breakMinutes = document.getElementById("break-minutes");
let breakSeconds = document.getElementById("break-seconds");
let breakTime = 20000;

let timerInterval;
let currentScreen = false;

function updateTimer() {
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const remainingTime = Math.max((currentScreen ? screenTime: breakTime) - elapsedTime, 0);

    if(remainingTime == 0) {
        currentScreen = !currentScreen;
        //Add function for when timer ends
    } else {
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);

        countdownMinutes.textContent = String(minutes).padStart(2, '0');
        countdownSeconds.textContent = String(seconds).padStart(2, '0');
    }
}

screenTimeElements.forEach(function(st) {
    st.addEventListener('change', function() {
        console.log("change");
        var minutes = Number(document.getElementById("screen-minutes"));
        var seconds = Number(document.getElementById("screen-seconds"));
        screentime = (minutes * 60000) + (seconds * 1000);
    });
})

checkbox.addEventListener('change', function() {
    if (this.checked) {
        console.log()
        startTime = Date.now();
        currentScreen = true;
        updateTimer();
        timerInterval = setInterval(updateTimer, 100);
    } else {
        clearInterval(timerInterval);
    }
});