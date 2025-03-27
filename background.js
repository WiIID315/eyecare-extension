var checkbox = document.getElementById("checkbox");
let countdownMinutes = document.getElementById("clock-minutes");
let countdownSeconds = document.getElementById("clock-seconds");
let startTime;

const screenTimeElements = document.querySelectorAll(".screentime");
var screenTime = 1200000;

const breakTimeElements = document.querySelectorAll(".breaktime");
var breakTime = 20000;

let timerInterval;
let currentScreen = false;
let alternate = false;

function updateTimer() {
    if(alternate) {
        if(currentScreen) {
            alert("Take a break!");
            let sound = new Audio(chrome.runtime.getURL('audios/audios/mixkit-classic-alarm-995.wav'));
            sound.play().catch(error => console.error("Audio playback failed:", error));
        }

        currentScreen = !currentScreen
        startTime = Date.now();
        alternate = false;
    }
    const currentTime = Date.now();
    const elapsedTime = currentTime - startTime;
    const remainingTime = Math.max((currentScreen ? screenTime: breakTime) - elapsedTime, 0);

    if(remainingTime == 0) {
        //Add function for when timer ends
        alternate = true;
    } else {
        const minutes = Math.floor(remainingTime / 60000);
        const seconds = Math.floor((remainingTime % 60000) / 1000);

        countdownMinutes.textContent = String(minutes).padStart(2, '0');
        countdownSeconds.textContent = String(seconds).padStart(2, '0');
    }
}

screenTimeElements.forEach(function(st) {
    st.addEventListener('input', function() {
        var minutes = Number(document.getElementById("screen-minutes").value);
        var seconds = Number(document.getElementById("screen-seconds").value);

        if (isNaN(minutes) || isNaN(seconds)) {
            console.error("Invalid input: minutes and seconds must be numbers.");
            return;
        }

        screenTime = (minutes * 60000) + (seconds * 1000);
    });
})

breakTimeElements.forEach(function(bt) {
    bt.addEventListener('input', function() {
        var minutes = Number(document.getElementById("break-minutes").value);
        var seconds = Number(document.getElementById("break-seconds").value);
        if (isNaN(minutes) || isNaN(seconds)) {
            console.error("Invalid input: minutes and seconds must be numbers.");
            return;
        }

        breakTime = (minutes * 60000) + (seconds * 1000);
    });
})

checkbox.addEventListener('change', function() {
    if (this.checked) {
        console.log(screenTime)
        startTime = Date.now();
        currentScreen = true;
        updateTimer();
        timerInterval = setInterval(updateTimer, 100);
    } else {
        clearInterval(timerInterval);
    }
});