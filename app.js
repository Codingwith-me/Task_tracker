// time format

function formatTime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = seconds % 60;
  return `${hrs.toString().padStart(2, "0")}:${mins
    .toString()
    .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
}

// Clock functions
function updateClock() {
  const now = new Date();
  const timeString = now.toLocaleTimeString();
  document.getElementById("current-time").textContent = timeString;
}
setInterval(updateClock, 1000);

// Timer functions
let timerInterval;
let timerStartTime; // store the start time of the timer
let timeLeft; // store the remaining time for the timer
let isTimerPaused = false; // flag to check if the timer is paused

document.getElementById("start-timer").addEventListener("click", () => {
  const hours = parseInt(document.getElementById("timer-hours").value, 10) || 0;
  const minutes =
    parseInt(document.getElementById("timer-minutes").value, 10) || 0;
  const seconds =
    parseInt(document.getElementById("timer-seconds").value, 10) || 0;

  if (hours === 0 && minutes === 0 && seconds === 0) {
    alert("Please enter at least one value to start the timer.");
    return;
  }

  if (!isTimerPaused) {
    timeLeft = hours * 3600 + minutes * 60 + seconds;
  }

  // Store the current time as the start time
  timerStartTime = new Date();
  clearInterval(timerInterval);
  timerInterval = setInterval(() => {
    timeLeft--;
    document.getElementById("timer-display").textContent = formatTime(timeLeft);

    if (timeLeft <= 0) {
      clearInterval(timerInterval);
      const endTime = new Date();
      const duration = formatTime(hours * 3600 + minutes * 60 + seconds);
      logActivity(
        `Timer ended  - Duration: ${duration} - Started at: ${timerStartTime.toLocaleString()}`
      );
    }
  }, 1000);
  isTimerPaused = false;
});

document.getElementById("pause-timer").addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    isTimerPaused = true;
  }
});

document.getElementById("stop-timer").addEventListener("click", () => {
  if (timerInterval) {
    clearInterval(timerInterval);
    document.getElementById("timer-display").textContent = "00:00:00";
    isTimerPaused = false;
  }
});

// Stopwatch functionality
let stopwatchInterval;
let stopwatchTime = 0;
let currentLogIndex = null; // Track the index of the current log
const stopwatchLabelInput = document.getElementById("stopwatch-label");

document.getElementById("start-stopwatch").addEventListener("click", () => {
  clearInterval(stopwatchInterval);
  stopwatchInterval = setInterval(() => {
    stopwatchTime++;
    document.getElementById("stopwatch-display").textContent = new Date(
      stopwatchTime * 1000
    )
      .toISOString()
      .slice(11, 19);
  }, 1000);

  // Disable label input while stopwatch is running
  stopwatchLabelInput.disabled = true;

  // Create a new log if the stopwatch was reset
  if (stopwatchTime === 0) {
    const timestamp = new Date().toLocaleString();
    currentLogIndex = logActivity(
      `Stopwatch started at ${new Date()
        .toISOString()
        .slice(11, 19)} - ${timestamp}`
    );
  } else if (currentLogIndex !== null) {
    // Update log if an existing log is being continued
    updateLog(
      currentLogIndex,
      `Stopwatch continued at ${new Date(stopwatchTime * 1000)
        .toISOString()
        .slice(11, 19)}`
    );
  }
});

document.getElementById("stop-stopwatch").addEventListener("click", () => {
  clearInterval(stopwatchInterval);
  const label = stopwatchLabelInput.value;
  const timestamp = new Date().toLocaleString();
  if (currentLogIndex === null) {
    // Create new log if there is no existing log
    currentLogIndex = logActivity(
      `Stopwatch stopped at ${new Date(stopwatchTime * 1000)
        .toISOString()
        .slice(11, 19)} - ${label} - ${timestamp}`
    );
  } else {
    // Update existing log
    updateLog(
      currentLogIndex,
      `Stopwatch stopped at ${new Date(stopwatchTime * 1000)
        .toISOString()
        .slice(11, 19)} - ${label} - ${timestamp}`
    );
  }

  // Keep label input disabled after stopping the stopwatch

  stopwatchLabelInput.disabled = true;
});

document.getElementById("reset-stopwatch").addEventListener("click", () => {
  if (stopwatchTime > 0) {
    // Create a log if the stopwatch is not stopped yet
    const label = stopwatchLabelInput.value;
    const timestamp = new Date().toLocaleString();
    if (currentLogIndex === null) {
      currentLogIndex = logActivity(
        `Stopwatch stopped at ${new Date(stopwatchTime * 1000)
          .toISOString()
          .slice(11, 19)} - ${label} - ${timestamp}`
      );
    } else {
      updateLog(
        currentLogIndex,
        `Stopwatch stopped at ${new Date(stopwatchTime * 1000)
          .toISOString()
          .slice(11, 19)} - ${label} - ${timestamp}`
      );
    }
  }
  clearInterval(stopwatchInterval);
  stopwatchTime = 0;
  document.getElementById("stopwatch-display").textContent = "00:00:00";

  // Enable label input after stopwatch is reset
  stopwatchLabelInput.disabled = false;
});

// Log activity
function logActivity(message) {
  const logsList = document.getElementById("logs-list");
  const logItem = document.createElement("li");
  logItem.textContent = message;
  logsList.appendChild(logItem);
  saveLogs();
  return logsList.children.length - 1; // Return the index of the new log item
}

// Update existing log
function updateLog(index, message) {
  const logsList = document.getElementById("logs-list");
  if (index >= 0 && index < logsList.children.length) {
    logsList.children[index].textContent = message;
    saveLogs();
  }
}

// Save logs to localStorage
function saveLogs() {
  const logsList = document.getElementById("logs-list");
  const logs = [];
  logsList.querySelectorAll("li").forEach((logItem) => {
    logs.push(logItem.textContent);
  });
  localStorage.setItem("activityLogs", JSON.stringify(logs));
}

// Load logs from localStorage
function loadLogs() {
  const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");
  const logsList = document.getElementById("logs-list");
  logs.forEach((log) => {
    const logItem = document.createElement("li");
    logItem.textContent = log;
    logsList.appendChild(logItem);
  });
}
loadLogs();

// Clear logs
document.getElementById("clear-logs").addEventListener("click", () => {
  document.getElementById("logs-list").innerHTML = "";
  localStorage.removeItem("activityLogs");
});
