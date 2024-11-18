
function clearDisplay() {
    const display = document.querySelector('.calc-display');
    display.dataset.value = '0';
    display.textContent = '0';
}

function appendNumber(number) {
    const display = document.querySelector('.calc-display');
    if (display.dataset.value === '0') {
        display.dataset.value = number.toString();
    } else {
        display.dataset.value += number.toString();
    }
    display.textContent = display.dataset.value;
}

function appendDecimal() {
    const display = document.querySelector('.calc-display');
    if (!display.dataset.value.includes('.')) {
        display.dataset.value += '.';
    }
    display.textContent = display.dataset.value;
}

function toggleSign() {
    const display = document.querySelector('.calc-display');
    display.dataset.value = (-parseFloat(display.dataset.value)).toString();
    display.textContent = display.dataset.value;
}

function calculatePercent() {
    const display = document.querySelector('.calc-display');
    display.dataset.value = (parseFloat(display.dataset.value) / 100).toString();
    display.textContent = display.dataset.value;
}

function deleteLastDigit() {
    const display = document.querySelector('.calc-display');
    display.dataset.value = display.dataset.value.slice(0, -1) || '0';
    display.textContent = display.dataset.value;
}

function chooseOperation(operation) {
    const display = document.querySelector('.calc-display');
    display.dataset.operation = operation;
    display.dataset.previousValue = display.dataset.value;
    display.dataset.value = '0';
}

function computeResult() {
    const display = document.querySelector('.calc-display');
    const current = parseFloat(display.dataset.value);
    const previous = parseFloat(display.dataset.previousValue);
    let result = 0;
    switch (display.dataset.operation) {
        case '+':
            result = previous + current;
            break;
        case '-':
            result = previous - current;
            break;
        case '/':
            result = previous / current;
            break;
    }
    display.dataset.value = result.toString();
    display.textContent = display.dataset.value;
    display.dataset.operation = '';
    display.dataset.previousValue = '';
}
