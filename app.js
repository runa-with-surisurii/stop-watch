(function () {
  // ---------- Shared UI helpers ----------
  function hide(element) {
    element.classList.add("u-display-none");
  }

  function show(element) {
    element.classList.remove("u-display-none");
  }

  function disable(element, value) {
    element.disabled = value;
  }

  // ---------- Stopwatch ----------
  var startButton = document.querySelector("#js--start");
  var stopButton = document.querySelector("#js--stop");
  var resetButton = document.querySelector("#js--reset");
  var stopwatch = document.querySelector("#js--stopwatch");
  var stopwatchTime = 0;
  var stopwatchTimerId = null;
  var stopwatchStartedAt = 0;

  function displayStopwatch(time) {
    var centiseconds = Math.floor((time % 1000) / 10);
    var seconds = Math.floor(time / 1000) % 60;
    var minutes = Math.floor(time / 60000);
    var cs = centiseconds < 10 ? "0" + centiseconds : centiseconds.toString();
    var s = seconds < 10 ? "0" + seconds : seconds.toString();
    var m = minutes < 10 ? "0" + minutes : minutes.toString();
    stopwatch.textContent = m + ":" + s + "." + cs;
  }

  function stopStopwatch() {
    if (stopwatchTimerId !== null) {
      clearInterval(stopwatchTimerId);
      stopwatchTimerId = null;
    }
  }

  displayStopwatch(0);

  startButton.addEventListener("click", function () {
    if (stopwatchTimerId !== null) return;
    hide(startButton);
    show(stopButton);
    disable(resetButton, true);
    stopwatchStartedAt = Date.now() - stopwatchTime;

    stopwatchTimerId = setInterval(function () {
      stopwatchTime = Date.now() - stopwatchStartedAt;
      displayStopwatch(stopwatchTime);
    }, 10);
  });

  stopButton.addEventListener("click", function () {
    stopStopwatch();
    hide(stopButton);
    show(startButton);
    disable(resetButton, false);
  });

  resetButton.addEventListener("click", function () {
    stopStopwatch();
    stopwatchTime = 0;
    displayStopwatch(0);
    hide(stopButton);
    show(startButton);
    disable(resetButton, true);
  });

  // ---------- Countdown Timer ----------
  var timerDisplay = document.querySelector("#js--timer");
  var timerMinutesInput = document.querySelector("#timer-minutes");
  var timerSecondsInput = document.querySelector("#timer-seconds");
  var timerStartButton = document.querySelector("#timer-start");
  var timerPauseButton = document.querySelector("#timer-pause");
  var timerResetButton = document.querySelector("#timer-reset");
  var timerInterval = null;
  var timerRemaining = 300;
  var timerInitial = 300;
  var timerEndAt = 0;

  function getTimerInputSeconds() {
    var minutes = parseInt(timerMinutesInput.value, 10) || 0;
    var seconds = parseInt(timerSecondsInput.value, 10) || 0;
    minutes = Math.max(0, Math.min(999, minutes));
    seconds = Math.max(0, Math.min(59, seconds));
    timerMinutesInput.value = minutes;
    timerSecondsInput.value = seconds;
    return minutes * 60 + seconds;
  }

  function displayTimer(totalSeconds) {
    var safeSeconds = Math.max(0, Math.ceil(totalSeconds));
    var minutes = Math.floor(safeSeconds / 60);
    var seconds = safeSeconds % 60;
    timerDisplay.textContent = (minutes < 10 ? "0" : "") + minutes + ":" + (seconds < 10 ? "0" : "") + seconds;
  }

  function stopTimer() {
    if (timerInterval !== null) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
  }

  function finishTimer() {
    stopTimer();
    timerRemaining = 0;
    displayTimer(0);
    hide(timerPauseButton);
    show(timerStartButton);
    timerDisplay.classList.add("timer-finished");
    setTimeout(function () {
      timerDisplay.classList.remove("timer-finished");
    }, 1200);
  }

  function startTimer() {
    if (timerInterval !== null) return;
    if (timerRemaining <= 0) {
      timerRemaining = getTimerInputSeconds();
      timerInitial = timerRemaining;
    }
    if (timerRemaining <= 0) return;

    hide(timerStartButton);
    show(timerPauseButton);
    timerMinutesInput.disabled = true;
    timerSecondsInput.disabled = true;
    timerEndAt = Date.now() + timerRemaining * 1000;

    timerInterval = setInterval(function () {
      timerRemaining = Math.max(0, (timerEndAt - Date.now()) / 1000);
      displayTimer(timerRemaining);
      if (timerRemaining <= 0) finishTimer();
    }, 100);
  }

  timerStartButton.addEventListener("click", startTimer);

  timerPauseButton.addEventListener("click", function () {
    if (timerInterval === null) return;
    timerRemaining = Math.max(0, (timerEndAt - Date.now()) / 1000);
    stopTimer();
    hide(timerPauseButton);
    show(timerStartButton);
    timerMinutesInput.disabled = false;
    timerSecondsInput.disabled = false;
    displayTimer(timerRemaining);
  });

  timerResetButton.addEventListener("click", function () {
    stopTimer();
    timerRemaining = getTimerInputSeconds();
    timerInitial = timerRemaining;
    displayTimer(timerRemaining);
    hide(timerPauseButton);
    show(timerStartButton);
    timerMinutesInput.disabled = false;
    timerSecondsInput.disabled = false;
    timerDisplay.classList.remove("timer-finished");
  });

  function updateTimerFromInputs() {
    if (timerInterval !== null) return;
    timerRemaining = getTimerInputSeconds();
    timerInitial = timerRemaining;
    displayTimer(timerRemaining);
  }

  timerMinutesInput.addEventListener("input", updateTimerFromInputs);
  timerSecondsInput.addEventListener("input", updateTimerFromInputs);
  displayTimer(timerRemaining);

  // ---------- Mode switching ----------
  var stopwatchMode = document.querySelector("#stopwatch-mode");
  var timerMode = document.querySelector("#timer-mode");
  var stopwatchModeButton = document.querySelector("#mode-stopwatch");
  var timerModeButton = document.querySelector("#mode-timer");
  var appTitle = document.querySelector("#app-title");

  stopwatchModeButton.addEventListener("click", function () {
    show(stopwatchMode);
    hide(timerMode);
    stopwatchModeButton.classList.add("active");
    timerModeButton.classList.remove("active");
    stopwatchModeButton.setAttribute("aria-selected", "true");
    timerModeButton.setAttribute("aria-selected", "false");
    appTitle.textContent = "Stopwatch";
  });

  timerModeButton.addEventListener("click", function () {
    hide(stopwatchMode);
    show(timerMode);
    timerModeButton.classList.add("active");
    stopwatchModeButton.classList.remove("active");
    timerModeButton.setAttribute("aria-selected", "true");
    stopwatchModeButton.setAttribute("aria-selected", "false");
    appTitle.textContent = "Timer";
  });
})();
