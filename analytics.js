document.addEventListener("DOMContentLoaded", () => {
  const ctxWeekly = document.getElementById("weeklyChart").getContext("2d");
  const ctxMonthly = document.getElementById("monthlyChart").getContext("2d");

  // Function to parse the duration from log messages
  function parseDuration(logMessage) {
    const timeRegex = /(\d{2}):(\d{2}):(\d{2})/;
    const match = logMessage.match(timeRegex);
    if (match) {
      const hours = parseInt(match[1], 10);
      const minutes = parseInt(match[2], 10);
      const seconds = parseInt(match[3], 10);
      return hours * 3600 + minutes * 60 + seconds; // Return total duration in seconds
    }
    return 0;
  }

  // Function to group durations by category for weekly chart (in seconds)
  function getDurationsForWeeklyChart(logs) {
    const categories = ["Work", "Exercise", "Leisure", "Sleep", "Others"];
    const durations = Array(categories.length).fill(0);

    logs.forEach((log) => {
      const duration = parseDuration(log);
      if (log.includes("Work")) {
        durations[0] += duration;
      } else if (log.includes("Exercise")) {
        durations[1] += duration;
      } else if (log.includes("Leisure")) {
        durations[2] += duration;
      } else if (log.includes("Sleep")) {
        durations[3] += duration;
      } else {
        durations[4] += duration;
      }
    });

    return durations;
  }

  // Function to group durations by week for monthly chart (in minutes)
  function getDurationsForMonthlyChart(logs) {
    const weeklyDurations = [0, 0, 0, 0]; // Assuming 4 weeks in a month

    logs.forEach((log) => {
      const durationInSeconds = parseDuration(log);
      const durationInMinutes = durationInSeconds / 60;
      const logDate = new Date(log.split(" - ")[2]);
      const week = Math.floor((logDate.getDate() - 1) / 7); // Determine the week of the log (0 to 3)
      if (week >= 0 && week < 4) {
        weeklyDurations[week] += durationInMinutes;
      }
    });

    return weeklyDurations;
  }

  // Load logs from localStorage
  const logs = JSON.parse(localStorage.getItem("activityLogs") || "[]");

  const weeklyDurations = getDurationsForWeeklyChart(logs);
  const monthlyDurations = getDurationsForMonthlyChart(logs);

  // Function to format duration in seconds to 00hr 00min 00sec
  function formatDuration(seconds) {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}hr ${mins
      .toString()
      .padStart(2, "0")}min ${secs.toString().padStart(2, "0")}sec`;
  }

  const weeklyChart = new Chart(ctxWeekly, {
    type: "doughnut",
    data: {
      labels: ["Work", "Exercise", "Leisure", "Sleep", "Others"],
      datasets: [
        {
          data: weeklyDurations,
          backgroundColor: [
            "#FF6384",
            "#36A2EB",
            "#FFCE56",
            "#4BC0C0",
            "#9966FF",
          ],
        },
      ],
    },
    options: {
      plugins: {
        tooltip: {
          callbacks: {
            label: function (context) {
              const durationInSeconds = context.raw;
              return formatDuration(durationInSeconds);
            },
          },
        },
      },
    },
  });

  const monthlyChart = new Chart(ctxMonthly, {
    type: "bar",
    data: {
      labels: ["Week 1", "Week 2", "Week 3", "Week 4"],
      datasets: [
        {
          label: "Hours",
          data: monthlyDurations,
          backgroundColor: ["#FF6384", "#36A2EB", "#FFCE56", "#4BC0C0"],
        },
      ],
    },
    options: {
      scales: {
        y: {
          beginAtZero: true,
        },
      },
    },
  });
});
