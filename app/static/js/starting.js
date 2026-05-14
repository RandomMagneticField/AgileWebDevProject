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