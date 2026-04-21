// Password Generator — TypeScript
// Author: Mahmoud Magdy

interface GeneratorOptions {
    length: number;
    upper: boolean;
    lower: boolean;
    digits: boolean;
    symbols: boolean;
}

const CHARSET = {
    upper: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
    lower: "abcdefghijklmnopqrstuvwxyz",
    digits: "0123456789",
    symbols: "!@#$%^&*()-_=+[]{};:,.<>?/|~",
};

function secureRandomInt(max: number): number {
    const array = new Uint32Array(1);
    crypto.getRandomValues(array);
    return array[0] % max;
}

function generatePassword(opts: GeneratorOptions): string {
    let pool = "";
    if (opts.upper) pool += CHARSET.upper;
    if (opts.lower) pool += CHARSET.lower;
    if (opts.digits) pool += CHARSET.digits;
    if (opts.symbols) pool += CHARSET.symbols;

    if (!pool) return "";

    let password = "";
    for (let i = 0; i < opts.length; i++) {
        password += pool[secureRandomInt(pool.length)];
    }
    return password;
}

function estimateStrength(pwd: string, opts: GeneratorOptions): { score: number; label: string; color: string } {
    let poolSize = 0;
    if (opts.upper) poolSize += 26;
    if (opts.lower) poolSize += 26;
    if (opts.digits) poolSize += 10;
    if (opts.symbols) poolSize += 28;

    const entropy = pwd.length * Math.log2(Math.max(poolSize, 2));

    if (entropy < 40) return { score: 25, label: "ضعيفة", color: "#e74c3c" };
    if (entropy < 60) return { score: 50, label: "متوسطة", color: "#f39c12" };
    if (entropy < 90) return { score: 75, label: "قوية", color: "#27ae60" };
    return { score: 100, label: "قوية جداً", color: "#16a085" };
}

// DOM wiring
const $ = <T extends HTMLElement>(id: string) => document.getElementById(id) as T;

const output = $<HTMLInputElement>("password-output");
const lengthInput = $<HTMLInputElement>("length");
const lengthValue = $<HTMLSpanElement>("length-value");
const optUpper = $<HTMLInputElement>("opt-upper");
const optLower = $<HTMLInputElement>("opt-lower");
const optDigits = $<HTMLInputElement>("opt-digits");
const optSymbols = $<HTMLInputElement>("opt-symbols");
const generateBtn = $<HTMLButtonElement>("generate-btn");
const copyBtn = $<HTMLButtonElement>("copy-btn");
const refreshBtn = $<HTMLButtonElement>("refresh-btn");
const strengthFill = $<HTMLDivElement>("strength-fill");
const strengthLabel = $<HTMLSpanElement>("strength-label");

function currentOptions(): GeneratorOptions {
    return {
        length: parseInt(lengthInput.value, 10),
        upper: optUpper.checked,
        lower: optLower.checked,
        digits: optDigits.checked,
        symbols: optSymbols.checked,
    };
}

function run(): void {
    const opts = currentOptions();
    const pwd = generatePassword(opts);
    output.value = pwd;

    if (!pwd) {
        strengthFill.style.width = "0%";
        strengthLabel.textContent = "اختر نوعاً واحداً على الأقل";
        return;
    }

    const s = estimateStrength(pwd, opts);
    strengthFill.style.width = s.score + "%";
    strengthFill.style.background = s.color;
    strengthLabel.textContent = s.label;
}

lengthInput.addEventListener("input", () => {
    lengthValue.textContent = lengthInput.value;
    run();
});

[optUpper, optLower, optDigits, optSymbols].forEach(el =>
    el.addEventListener("change", run)
);

generateBtn.addEventListener("click", run);
refreshBtn.addEventListener("click", run);

copyBtn.addEventListener("click", async () => {
    if (!output.value) return;
    try {
        await navigator.clipboard.writeText(output.value);
        const original = copyBtn.textContent;
        copyBtn.textContent = "✅";
        setTimeout(() => (copyBtn.textContent = original), 1200);
    } catch {
        output.select();
        document.execCommand("copy");
    }
});

// initial run
run();
