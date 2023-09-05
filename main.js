/**
 * Timer variable stores the times needed for each pomodoro and break length
 */
const timer = {
    pomodoro: 25,
    shortBreak: 5,
    longBreak: 15,
    longBreakInterval: 4,
};


/**
 * initialization; grabs the buttons from HTML and adds an event listener for 
 * when they are clicked
 */
const modeButtons = document.querySelector('#js-mode-buttons');
modeButtons.addEventListener('click', handleMode);


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

