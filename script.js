const display = document.getElementById('display');
const historyDisplay = document.getElementById('history');
const historyList = document.getElementById('history-list');
const historyPanel = document.getElementById('history-panel');

let currentInput = '';
let explicitHistory = '';
let savedCalculations = [];

function updateScreen() {
    display.innerText = currentInput || '0';
    historyDisplay.innerText = explicitHistory;
}

function appendCharacter(char) {
    if (char === '.' && currentInput.includes('.')) return;
    if (display.innerText === 'Error') clearDisplay();

    if (['+', '-', '*', '/', '%'].includes(char)) {
        let displaySymbol = char;
        if (char === '*') displaySymbol = '×';
        if (char === '/') displaySymbol = '÷';
        if (char === '-') displaySymbol = '−';

        explicitHistory += (currentInput || '0') + displaySymbol;
        currentInput = '';
    } else {
        currentInput += char;
    }
    updateScreen();
}

function clearDisplay() {
    currentInput = '';
    explicitHistory = '';
    updateScreen();
}

function backspace() {
    if (currentInput.length > 0) {
        currentInput = currentInput.slice(0, -1);
    }
    updateScreen();
}

function toggleSign() {
    if (!currentInput && display.innerText !== '0') currentInput = display.innerText;
    if (currentInput) {
        currentInput = currentInput.startsWith('-') ? currentInput.slice(1) : '-' + currentInput;
        updateScreen();
    }
}

function calculate() {
    try {
        let expression = explicitHistory + currentInput;
        if (!expression) return;

        let computeTarget = expression.replace(/×/g, '*').replace(/÷/g, '/').replace(/−/g, '-');
        if (computeTarget.includes('%')) {
            computeTarget = computeTarget.replace(/(\d+(\.\d+)?)%/g, '($1/100)');
        }

        let result = eval(computeTarget);
        if (result % 1 !== 0) result = parseFloat(result.toFixed(8));

        saveToHistoryList(expression, result);

        explicitHistory = '';
        currentInput = result.toString();
        updateScreen();
    } catch (error) {
        display.innerText = 'Error';
        currentInput = '';
        explicitHistory = '';
    }
}

function saveToHistoryList(expr, res) {
    savedCalculations.unshift({ expression: expr, result: res });
    renderHistoryPanel();
}

function renderHistoryPanel() {
    if (savedCalculations.length === 0) {
        historyList.innerHTML = `<div class="empty-msg">No recent calculations</div>`;
        return;
    }

    historyList.innerHTML = '';
    savedCalculations.forEach((item, index) => {
        const div = document.createElement('div');
        div.className = 'history-item';
        div.setAttribute('onclick', `restoreHistoryItem(${index})`);
        div.innerHTML = `
            <div class="item-expr">${item.expression}</div>
            <div class="item-res">${item.result}</div>
        `;
        historyList.appendChild(div);
    });
}

function restoreHistoryItem(index) {
    const selected = savedCalculations[index];
    currentInput = selected.result.toString();
    explicitHistory = '';
    updateScreen();
    
    if(window.innerWidth <= 768) {
        historyPanel.classList.remove('open');
    }
}

function clearSavedHistory() {
    savedCalculations = [];
    renderHistoryPanel();
}

function toggleHistoryPanel() {
    historyPanel.classList.toggle('open');
}

/* Fix: Reliable Theme Switching Engine */
function toggleTheme() {
    const body = document.body;
    const themeBtn = document.getElementById('theme-toggle');
    
    // Toggle the 'light-theme' class on the body element
    body.classList.toggle('light-theme');
    
    if (body.classList.contains('light-theme')) {
        // Change to Sun Icon for Light Mode
        themeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12 7c-2.8 0-5 2.2-5 5s2.2 5 5 5 5-2.2 5-5-2.2-5-5-5zm0 8.5c-1.9 0-3.5-1.6-3.5-3.5s1.6-3.5 3.5-3.5 3.5 1.6 3.5 3.5-1.6 3.5-3.5 3.5zM12 5.5c.4 0 .8-.4.8-.8V3.2c0-.4-.4-.8-.8-.8s-.8.4-.8.8v1.5c0 .4.4.8.8.8zm0 13c-.4 0-.8.4-.8.8v1.5c0 .4.4.8.8.8s.8-.4.8-.8v-1.5c0-.4-.4-.8-.8-.8zm7-7c0-.4-.4-.8-.8-.8h-1.5c-.4 0-.8.4-.8.8s.4.8.8.8h1.5c.4 0 .8-.4.8-.8zM7.3 11.5H5.8c-.4 0-.8.4-.8.8s.4.8.8.8h1.5c.4 0 .8-.4.8-.8s-.4-.8-.8-.8z"/></svg>`;
    } else {
        // Change to Moon Icon for Dark Mode
        themeBtn.innerHTML = `<svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor"><path d="M12.3 22h-.1c-5.5-.1-10-4.6-10-10.2 0-3.9 2.3-7.4 5.7-8.9.4-.2.8 0 .9.4.2.4 0 .8-.4.9-2.9 1.3-4.8 4.2-4.8 7.5 0 4.7 3.8 8.5 8.5 8.6 3.3 0 6.2-1.9 7.5-4.8.2-.4.6-.5.9-.4.4.2.5.6.4.9-1.5 3.4-5 5.7-8.9 5.7z"/></svg>`;
    }
}

document.addEventListener('keydown', (event) => {
    const key = event.key;
    if ('0123456789+-*/.'.includes(key)) {
        appendCharacter(key);
    } else if (key === '%') {
        appendCharacter('%');
    } else if (key === 'Enter' || key === '=') {
        event.preventDefault();
        calculate();
    } else if (key === 'Backspace') {
        backspace();
    } else if (key === 'Escape' || key.toLowerCase() === 'c') {
        clearDisplay();
    }
});