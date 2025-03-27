const checkbox = document.getElementById("checkbox");
const countdownMinutes = document.getElementById("clock-minutes");
const countdownSeconds = document.getElementById("clock-seconds");

async function initPopup() {
  const { timerState } = await chrome.storage.local.get(['timerState']);
  if (timerState) {
    updateDisplay(timerState.currentDisplay);
    checkbox.checked = timerState.isRunning;
  }
}

function updateDisplay(time) {
  countdownMinutes.textContent = time.minutes;
  countdownSeconds.textContent = time.seconds;
}

let syncInterval;
function setupPopupSync() {
  syncInterval = setInterval(async () => {
    const { timerState } = await chrome.storage.local.get(['timerState']);
    if (timerState) {
      updateDisplay(timerState.currentDisplay);
      checkbox.checked = timerState.isRunning;
    }
  }, 300);
}

chrome.runtime.onMessage.addListener((message) => {
  if (message.type === 'timeUpdate') {
    updateDisplay(message.data);
  }
});

checkbox.addEventListener('change', async function() {
  try {
    await chrome.runtime.sendMessage({ 
      action: this.checked ? "startTimer" : "stopTimer" 
    });
  } catch (error) {
    console.error("Timer control failed:", error);
    this.checked = !this.checked;
  }
});

document.querySelectorAll(".screentime").forEach(el => {
  el.addEventListener('input', () => handleTimeUpdate('screen'));
});

document.querySelectorAll(".breaktime").forEach(el => {
  el.addEventListener('input', () => handleTimeUpdate('break'));
});

async function handleTimeUpdate(type) {
  const minutes = Number(document.getElementById(`${type}-minutes`).value) || 0;
  const seconds = Number(document.getElementById(`${type}-seconds`).value) || 0;
  
  try {
    await chrome.runtime.sendMessage({
      action: `update${type.charAt(0).toUpperCase() + type.slice(1)}Time`,
      time: (minutes * 60000) + (seconds * 1000)
    });
  } catch (error) {
    console.error(`Failed to update ${type} time:`, error);
  }
}

window.addEventListener('focus', setupPopupSync);
window.addEventListener('blur', () => clearInterval(syncInterval));
document.addEventListener('DOMContentLoaded', initPopup);