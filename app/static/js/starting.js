// Flashcard demo
const demoCards = [
    { front: "What is Flask?", back: "A lightweight Python web framework." },
    { front: "What is Jinja2?", back: "Flask's HTML templating engine." },
    { front: "What does @app.route do?", back: "Connects URLs to functions." },
    { front: "What is HTML?", back: "The structure of a webpage." },
    { front: "What is CSS?", back: "Styles a webpage." },
];
let demoIndex = 0;
let demoFlipped = false;

function demoRenderCard() {
    const card = demoCards[demoIndex];
    document.getElementById('demo-front-text').textContent = card.front;
    document.getElementById('demo-back-text').textContent = card.back;
    document.getElementById('demo-counter').textContent = `Card ${demoIndex + 1} of ${demoCards.length}`;
    document.getElementById('demo-inner').classList.remove('flipped');
    demoFlipped = false;
}

function demoFlipCard() {
    demoFlipped = !demoFlipped;
    document.getElementById('demo-inner').classList.toggle('flipped', demoFlipped);
}

document.getElementById('demo-btn-correct').addEventListener('click', function() {
    demoIndex = (demoIndex + 1) % demoCards.length;
    demoRenderCard();
});

document.getElementById('demo-btn-wrong').addEventListener('click', function() {
    demoIndex = (demoIndex + 1) % demoCards.length;
    demoRenderCard();
});

demoRenderCard();

// Notes demo
const renderer = new marked.Renderer();
marked.setOptions({ breaks: true, gfm: true, renderer: renderer });

const demoPreview = document.getElementById('notes-demo');

const demoContent = `# Agile Web Development

## Agile
A flexible software development method focused on collaboration and quick delivery.

## Scrum
An Agile framework using short development cycles called sprints.

## Sprint
A short period of development work, usually 1–4 weeks.

## Git
A version control system used to track code changes.

## Flask
A lightweight Python framework for web development.

## Frontend
The part of a website users interact with directly.

## Backend
The server-side logic and database handling.

## HTML
Used to structure webpage content.

## CSS
Used to style webpages.

## JavaScript
Adds interactivity to websites.

## API
Allows different software systems to communicate.

## Database
Stores application data in an organised way.

## Key fact
Agile development focuses on **iteration**, **team collaboration**, and continuous improvement.`;

let charIndex = 0;

function typeDemo() {
    if (charIndex < demoContent.length) {
        charIndex++;
        demoPreview.innerHTML = marked.parse(demoContent.substring(0, charIndex));
        setTimeout(typeDemo, 18);
    }
}

typeDemo();

const hovernotes = document.getElementById('notes-row')

hovernotes.addEventListener('mouseenter', function() {
    charIndex = 0;
    demoPreview.innerHTML = '';
    typeDemo();
});

//Quiz demo
const demoQuizzes = [
    { q: "What does HTML stand for?", opts: ["HyperText Markup Language", "High Transfer Markup Language", "HyperText Management Language", "Home Tool Markup Language"], correct: 0 },
    { q: "Which HTTP method is used to submit a form?", opts: ["GET", "POST", "PUT", "DELETE"], correct: 1 },
    { q: "What is the purpose of CSS?", opts: ["Server-side logic", "Database management", "Styling web pages", "Handling HTTP requests"], correct: 2 },
    { q: "What does Flask use to render HTML templates?", opts: ["Django", "Jinja2", "React", "Handlebars"], correct: 1 },
];
let demoQuizIndex = 0;
let demoQuizAnswered = false;

function renderDemoQuiz() {
    demoQuizAnswered = false;
    const q = demoQuizzes[demoQuizIndex];
    document.getElementById('demo-quiz-question').textContent = q.q;
    document.getElementById('demo-quiz-opts').innerHTML = q.opts.map((o, i) => `
        <div class="quiz-mcq-box" data-idx="${i}" onclick="selectDemoOpt(this, ${i})">
            <div class="quiz-option-letter">${String.fromCharCode(65+i)}</div>
            <div class="quiz-option-text">${o}</div>
        </div>
    `).join('');
}

function selectDemoOpt(el, idx) {
    if (demoQuizAnswered) return;
    demoQuizAnswered = true;
    const correct = demoQuizzes[demoQuizIndex].correct;
    document.querySelectorAll('#demo-quiz-opts .quiz-mcq-box').forEach((o, i) => {
        if (i === correct) o.classList.add('quiz-option-correct');
        else if (i === idx) o.classList.add('quiz-option-wrong');
    });
    setTimeout(() => {
        demoQuizIndex = (demoQuizIndex + 1) % demoQuizzes.length;
        renderDemoQuiz();
    }, 1500);
}

renderDemoQuiz();