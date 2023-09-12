/**
 * author: Jack Hunsberger
 * PomoTimer is a simple pomodoro timer app to help with studying and focus
 */
import apiKey from './api-key.json' assert { type: 'json' };

const Http = new XMLHttpRequest();
const url=' https://api.todoist.com/rest/v2/tasks';

fetch(url + '?filter=p1', {
   headers: {
      'Authorization': 'Bearer ' + apiKey.key,
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
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
    sessions: 0,
};

let interval; // inverval used to count down each second

let tasks = [];

/**
 * initialization; grabs the buttons from HTML and adds an event listener for 
 * when they are clicked
 */
const buttonSound = new Audio('button-sound.mp3')
const mainButton = window.document.getElementById('js-btn');
mainButton.addEventListener('click', () => {
    buttonSound.play();
    const {action} = mainButton.dataset;
    if (action === 'start') {
        startTimer();
    } else {
        stopTimer();
    }
});


const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);

// on loading the page, default to the pomodoro mode
document.addEventListener('DOMContentLoaded', () => {
    if ('Notification' in window) {
        if (Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission().then(function(permission) {
                if (permission === 'granted') {
                    new Notification(
                        'Notifications are ENABLED'
                    );
                }
            });
        }
    }

    switchMode('pomodoro');
})

const form = document.querySelector('.js-form');
form.addEventListener('submit', event => {
    event.preventDefault();
    const input = document.querySelector('.js-todo-input');
    const text = input.value.trim();
    if (text !== '') {
        addTodo(text);
        input.value = '';
        input.focus();
    }
})


/**
 * Temporarily stubbed out
 * 
 * @param {string} text the todo's title 
 * @returns 
 */
function addTodo(text) {
    return;
}


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

    const text = timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
    document.title = `${minutes}:${seconds} - ${text}`;

    const progress = document.getElementById('js-progress');
    progress.value = timer[timer.mode] * 60 - timer.remainingTime.total
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

    if (timer.mode === 'pomodoro') timer.sessions++;
    
    mainButton.dataset.action = 'stop';
    mainButton.textContent = 'stop';
    mainButton.classList.add('active');

    interval = setInterval(function() {
        timer.remainingTime = getRemainingTime(endTime);
        updateClock();

        total = timer.remainingTime.total
        if (total <= 0) {
            clearInterval(interval);

            switch (timer.mode) {
                case 'pomodoro':
                    if (timer.sessions % timer.longBreakInterval === 0) {
                        switchMode('longBreak');
                    } else {
                        switchMode('shortBreak');
                    }
                    break;
                default:
                    switchMode('pomodoro');
            }

            document.querySelector(`[data-sound="${timer.mode}"]`).play();
            if (Notification.permission === 'granted') {
                const text =
                    timer.mode === 'pomodoro' ? 'Get back to work!' : 'Take a break!';
                new Notification(text);
            }
        }
    }, 1000);
}


/**
 * Stops the timer from counting down without erasing time remaining
 */
function stopTimer() {
    clearInterval(interval);

    mainButton.dataset.action = 'start';
    mainButton.textContent = 'start';
    mainButton.classList.remove('active');
}


/**
 * Changes the current mode the clock has been set to (pomodoro, long break,
 * short break)
 * @param {string} mode mode to switch the clock to
 */
function switchMode(mode) {
    stopTimer();

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
    document
        .getElementById('js-progress')
        .setAttribute('max', timer.remainingTime.total);

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
