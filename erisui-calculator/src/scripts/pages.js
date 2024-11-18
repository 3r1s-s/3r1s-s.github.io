function mainPage() {
    page = `overview`;

    titlebar.set(``);
    titlebar.type('');
    titlebar.hide();
    titlebar.back(``);

    content.classList.add('max');
    content.scrollTo(0,0);
    content.style = ``;

    content.innerHTML = `
        <div class="calc">
            <div class="calc-display" data-value="0">0</div>
            <div class="calc-keypad">
                <div class="calc-keypad-column">
                    <button class="calc-keypad-button" onclick="clearDisplay()">C</button>
                    <button class="calc-keypad-button" onclick="appendNumber(7)">7</button>
                    <button class="calc-keypad-button" onclick="appendNumber(4)">4</button>
                    <button class="calc-keypad-button" onclick="appendNumber(1)">1</button>
                    <button class="calc-keypad-button" onclick="appendNumber(0)">0</button>
                </div>
                <div class="calc-keypad-column">
                    <button class="calc-keypad-button" onclick="toggleSign()">${icon.negate}</button>
                    <button class="calc-keypad-button" onclick="appendNumber(8)">8</button>
                    <button class="calc-keypad-button" onclick="appendNumber(5)">5</button>
                    <button class="calc-keypad-button" onclick="appendNumber(2)">2</button>
                    <button class="calc-keypad-button" onclick="appendDecimal()">.</button>
                </div>
                <div class="calc-keypad-column">
                    <button class="calc-keypad-button" onclick="calculatePercent()">${icon.percent}</button>
                    <button class="calc-keypad-button" onclick="appendNumber(9)">9</button>
                    <button class="calc-keypad-button" onclick="appendNumber(6)">6</button>
                    <button class="calc-keypad-button" onclick="appendNumber(3)">3</button>
                    <button class="calc-keypad-button" onclick="deleteLastDigit()">${icon.backspace}</button>
                </div>
                <div class="calc-keypad-column">
                    <button class="calc-keypad-button" onclick="chooseOperation('/')">${icon.divide}</button>
                    <button class="calc-keypad-button" onclick="chooseOperation('/')">${icon.multiply}</button>
                    <button class="calc-keypad-button" onclick="chooseOperation('-')">${icon.subtract}</button>
                    <button class="calc-keypad-button" onclick="chooseOperation('+')">${icon.add}</button>
                    <button class="calc-keypad-button equals accent" onclick="computeResult()">${icon.equals}</button>
                </div>
            </div>
        </div>
    `;

    pageElements();
}