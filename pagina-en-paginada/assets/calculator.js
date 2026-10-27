"use strict";

const display = document.querySelector("#display");
const expression = document.querySelector("#expression");
const keys = document.querySelector(".calculator__keys");

let currentInput = "0";
let storedValue = null;
let pendingOperator = null;
let shouldStartNewInput = false;
let hasError = false;

const operatorSymbols = {
    "+": "+",
    "-": "−",
    "*": "×",
    "/": "÷",
};

function render() {
    display.textContent = currentInput;
}

function clearCalculator() {
    currentInput = "0";
    storedValue = null;
    pendingOperator = null;
    shouldStartNewInput = false;
    hasError = false;
    expression.textContent = "";
    render();
}

function enterDigit(digit) {
    if (hasError || shouldStartNewInput) {
        currentInput = digit;
        shouldStartNewInput = false;
        hasError = false;
        if (pendingOperator === null) {
            expression.textContent = "";
        }
    } else if (currentInput === "0") {
        currentInput = digit;
    } else if (currentInput.replace("-", "").length < 15) {
        currentInput += digit;
    }

    render();
}

function enterDecimal() {
    if (hasError || shouldStartNewInput) {
        currentInput = "0.";
        shouldStartNewInput = false;
        hasError = false;
        if (pendingOperator === null) {
            expression.textContent = "";
        }
    } else if (!currentInput.includes(".")) {
        currentInput += ".";
    }

    render();
}

function calculate(left, right, operator) {
    switch (operator) {
        case "+":
            return left + right;
        case "-":
            return left - right;
        case "*":
            return left * right;
        case "/":
            return right === 0 ? null : left / right;
        default:
            return null;
    }
}

function formatResult(value) {
    if (!Number.isFinite(value)) {
        return null;
    }

    return String(Number(value.toPrecision(12)));
}

function chooseOperator(operator) {
    if (hasError) {
        return;
    }

    const inputValue = Number(currentInput);

    if (pendingOperator && !shouldStartNewInput) {
        const result = calculate(storedValue, inputValue, pendingOperator);
        const formattedResult = result === null ? null : formatResult(result);

        if (result === null) {
            showError("No se puede dividir entre cero");
            return;
        }

        if (formattedResult === null) {
            showError("El resultado está fuera de rango");
            return;
        }

        currentInput = formattedResult;
        storedValue = result;
        render();
    } else {
        storedValue = inputValue;
    }

    pendingOperator = operator;
    shouldStartNewInput = true;
    expression.textContent = `${currentInput} ${operatorSymbols[operator]}`;
}

function showError(message) {
    currentInput = "Error";
    storedValue = null;
    pendingOperator = null;
    shouldStartNewInput = true;
    hasError = true;
    expression.textContent = message;
    render();
}

function showResult() {
    if (hasError || pendingOperator === null || shouldStartNewInput) {
        return;
    }

    const left = storedValue;
    const right = Number(currentInput);
    const operator = pendingOperator;
    const result = calculate(left, right, operator);
    const formattedResult = result === null ? null : formatResult(result);

    if (result === null) {
        showError("No se puede dividir entre cero");
        return;
    }

    if (formattedResult === null) {
        showError("El resultado está fuera de rango");
        return;
    }

    expression.textContent = `${left} ${operatorSymbols[operator]} ${right} =`;
    currentInput = formattedResult;
    storedValue = null;
    pendingOperator = null;
    shouldStartNewInput = true;
    render();
}

function handleKey(key) {
    if (/^\d$/.test(key)) {
        enterDigit(key);
    } else if (key === ".") {
        enterDecimal();
    } else if (Object.hasOwn(operatorSymbols, key)) {
        chooseOperator(key);
    } else if (key === "=" || key === "Enter") {
        showResult();
    } else if (key === "Escape" || key === "Backspace") {
        clearCalculator();
    }
}

keys.addEventListener("click", (event) => {
    const button = event.target.closest("button");

    if (!button) {
        return;
    }

    if (button.dataset.number !== undefined) {
        enterDigit(button.dataset.number);
    } else if (button.dataset.operator) {
        chooseOperator(button.dataset.operator);
    } else if (button.dataset.action === "decimal") {
        enterDecimal();
    } else if (button.dataset.action === "equals") {
        showResult();
    } else if (button.dataset.action === "clear") {
        clearCalculator();
    }
});

document.addEventListener("keydown", (event) => {
    if (event.altKey || event.ctrlKey || event.metaKey) {
        return;
    }

    if (/^\d$/.test(event.key) || [".", "+", "-", "*", "/", "=", "Enter", "Escape", "Backspace"].includes(event.key)) {
        event.preventDefault();
        handleKey(event.key);
    }
});
