const demoCards = [
    { front: "What is Flask?", back: "A lightweight Python web framework." },
    { front: "What is Jinja2?", back: "Flask’s HTML templating engine." },
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