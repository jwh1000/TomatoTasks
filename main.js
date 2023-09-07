/**
 * author: Jack Hunsberger
 * PomoTimer is a simple pomodoro timer app to help with studying and focus
 */
import apiKey from './api-key.json' assert { type: 'json' };

const Http = new XMLHttpRequest();
const url=' https://api.todoist.com/rest/v2/projects';

fetch(url, {
   headers: {
      'Authorization': 'Bearer ' + apiKey.key
   }
})
   .then(response => response.text())
   .then(text => console.log(text))

Http.onreadystatechange = (e) => {
    console.log(Http.responseText)
}

/**
 * Timer variable stores the times needed for each pomodoro and break length
 */
const timer = {
    pomodoro: 1,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
};

let interval; // 


/**
 * initialization; grabs the buttons from HTML and adds an event listener for 
 * when they are clicked
 */
const mainButton = window.document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
    const {action} = mainButton.dataset;
    if (action === 'start') {
        startTimer();
    }
});

const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

// on loading the page, default to the pomodoro mode
document.addEventListener('DOMContentLoaded', () => {
    switchMode('pomodoro');
})


/**
 * Updates the numbers for the clock to display the remaining time
 * Pads the display with 0's for accurate time representation
 */
function updateClock() {
    const {remainingTime} = timer;
    const minutes = `${remainingTime.minutes}`.padStart(2, '0');
    const seconds = `${remainingTime.seconds}`.padStart(2, '0');

    const min = document.getElementById('js-minutes');
    const sec = document.getElementById('js-seconds');
    min.textContent = minutes;
    sec.textContent = seconds;
}


/**
 * Find how much time is remaining for the timer
 * @param {number} endTime 
 * @returns 
 */
function getRemainingTime(endTime) {
    const currentTime = Date.parse(new Date());
    const difference = endTime - currentTime;

    const total = Number.parseInt(difference / 1000, 10);
    const minutes = Number.parseInt((total / 60) % 60, 10);
    const seconds = Number.parseInt(total % 60, 10);

    return {
        total,
        minutes,
        seconds
    };
}

/**
 * starts counting down the timer, called when start button is pressed
 * interval ticks every second to update the timer
 */
function startTimer() {
    let {total} = timer.remainingTime;
    const endTime = Date.parse(new Date()) + total * 1000
    
    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');

    interval = setInterval(function() {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total
        if (total <= 0) {
            clearInterval(interval);
        }
    }, 1000);
}


/**
 * Changes the current mode the clock has been set to (pomodoro, long break,
 * short break)
 * @param {string} mode mode to switch the clock to
 */
function switchMode(mode) {
    timer.mode = mode;
    timer.remainingTime = {
        total: timer[mode] * 60,
        minutes: timer[mode],
        seconds: 0,
    };

    document
        .querySelectorAll('button[data-mode]')
        .forEach(e => e.classList.remove('active'));
    document.querySelector(`[data-mode="${mode}"]`).classList.add('active');
    document.body.style.backgroundColor = `var(--${mode})`;

    updateClock();
}


/**
 * When a button is clicked, switch modes to that button's associated
 * mode.
 * @param {Event} event 
 * @returns nothing
 */
function handleMode(event) {
    const {mode} = event.target.dataset;

    if (!mode) return;

    switchMode(mode);
}

