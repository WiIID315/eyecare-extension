const state = {
    screenTime: 1200000,
    breakTime: 20000,
    currentDisplay: { minutes: '20', seconds: '00' },
    isRunning: false,
    startTime: null,
    timerInterval: null,
    currentScreen: true,
    alternate: false
  };
  
  const keepAlive = () => setInterval(() => {
    if (state.isRunning) {
      chrome.storage.local.set({ timerState: state });
    }
  }, 20000);
  
  chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    switch(request.action) {
      case "startTimer":
        startTimer();
        break;
      case "stopTimer":
        stopTimer();
        break;
      case "updateScreenTime":
        state.screenTime = request.time;
        break;
      case "updateBreakTime":
        state.breakTime = request.time;
        break;
    }
    return true;
  });
  
  function startTimer() {
    state.startTime = Date.now();
    state.isRunning = true;
    state.currentScreen = true;
    state.alternate = false;
    
    state.timerInterval = setInterval(updateTimer, 250);
    chrome.storage.local.set({ timerState: state });
    keepAlive();
  }
  
  function stopTimer() {
    clearInterval(state.timerInterval);
    state.timerInterval = null;
    state.isRunning = false;
    chrome.storage.local.set({ timerState: state });
  }
  
  function updateTimer() {
    if (state.alternate) {
      state.currentScreen = !state.currentScreen;
      state.startTime = Date.now();
      state.alternate = false;
      
      if (state.currentScreen) {
        playAlertSound();
      }
    }
  
    const elapsed = Date.now() - state.startTime;
    const duration = state.currentScreen ? state.screenTime : state.breakTime;
    const remaining = Math.max(duration - elapsed, 0);
  
    if (remaining <= 0) {
      state.alternate = true;
      showTimeUpNotification();
    }
  
    updateDisplay(remaining);
  }
  
  function updateDisplay(remainingMs) {
    const mins = String(Math.floor(remainingMs / 60000)).padStart(2, '0');
    const secs = String(Math.floor((remainingMs % 60000) / 1000)).padStart(2, '0');
    
    state.currentDisplay = { minutes: mins, seconds: secs };
    
    chrome.runtime.sendMessage({
      type: 'timeUpdate',
      data: state.currentDisplay
    }).catch(() => {});
    
    chrome.storage.local.set({ timerState: state });
  }
  
  function playAlertSound() {
    try {
      chrome.runtime.sendMessage({ type: 'playSound' });
    } catch (error) {
      console.error("Sound playback failed:", error);
    }
  }
  
  function showTimeUpNotification() {
    chrome.notifications.create({
      type: 'basic',
      iconUrl: 'icon.png',
      title: 'Time Complete',
      message: state.currentScreen ? 'Screen time ended!' : 'Break time over!'
    });
  }
  
  chrome.runtime.onStartup.addListener(() => {
    chrome.storage.local.get(['timerState'], (result) => {
      if (result.timerState?.isRunning) {
        Object.assign(state, result.timerState);
        startTimer();
      }
    });
  });