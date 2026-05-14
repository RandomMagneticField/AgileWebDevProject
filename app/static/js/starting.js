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

//discover page demo
// ── Discover Demo ──
const discoverDemoNotes = [
    { id: null, title: 'Agile Development', body: 'Agile is an iterative approach to project management and software development that helps teams deliver value faster.', tags: ['CITS3000', 'week-2'], likes: 12, liked: false },
    { id: null, title: 'HTTP & REST APIs', body: 'REST stands for Representational State Transfer. Key HTTP methods include GET, POST, PUT, and DELETE.', tags: ['CITS3000', 'exam-prep'], likes: 78, liked: false },
    { id: null, title: 'SQLAlchemy Relationships', body: 'One-to-many: use db.relationship() with back_populates. Many-to-many requires an association table.', tags: ['flask', 'database'], likes: 21, liked: false },
    { id: null, title: 'CSS Flexbox & Grid', body: 'Flexbox is one-dimensional layout. Grid is two-dimensional. Use flex for nav bars and card rows.', tags: ['css', 'week-3'], likes: 44, liked: false },
    { id: null, title: 'Flask Blueprints', body: 'Blueprints let you organise Flask routes into modules. Register them with app.register_blueprint().', tags: ['flask', 'week-2'], likes: 31, liked: false },
    { id: null, title: 'JavaScript Promises', body: 'A Promise represents a value that may be available now, in the future, or never. async/await is syntactic sugar.', tags: ['javascript', 'week-3'], likes: 7, liked: false },
];

let demoSelectedTags = new Set();

function DiscoverDemo() {
    const searchInput = document.getElementById('search-input');
    if (!searchInput) return;

    searchInput.addEventListener('input', function () {
        renderDemoCards();
    });

    renderDemoCards();
}

function getDemoAvailableTags() {
    const tags = new Set();
    discoverDemoNotes.forEach(n => n.tags.forEach(t => tags.add(t)));
    return tags;
}

function openTagModal() {
    rebuildDemoTagModal();
    document.getElementById('tag-modal-backdrop').style.display = 'block';
    document.getElementById('tag-modal').style.display = 'block';
}

function closeTagModal() {
    document.getElementById('tag-modal-backdrop').style.display = 'none';
    document.getElementById('tag-modal').style.display = 'none';
}

function rebuildDemoTagModal() {
    const pills = document.getElementById('tag-modal-pills');
    const availableTags = getDemoAvailableTags();

    const existing = document.getElementById('tag-search-input');
    const inputSearch = existing ? existing.value.toLowerCase() : '';
    const wasFocused = existing && document.activeElement === existing;
    const filtered = [...availableTags].sort().filter(t => t.toLowerCase().includes(inputSearch));

    pills.innerHTML = `
        <input class="tag-search-input" id="tag-search-input" type="text" placeholder="Search tags..." value="${inputSearch}" oninput="rebuildDemoTagModal()" onclick="event.stopPropagation()"/>
        ${filtered.map(tag => `
            <button class="tag-pill ${demoSelectedTags.has(tag) ? 'active' : ''}" data-tag="${tag}" onclick="event.stopPropagation(); toggleDemoTag('${tag}')">
                ${tag}
            </button>
        `).join('')}
    `;

    if (wasFocused) {
        const newInput = document.getElementById('tag-search-input');
        newInput.focus();
        newInput.setSelectionRange(newInput.value.length, newInput.value.length);
    }
}

function toggleDemoTag(tag) {
    if (demoSelectedTags.has(tag)) {
        demoSelectedTags.delete(tag);
    } else {
        demoSelectedTags.add(tag);
    }
    rebuildDemoTagModal();
    updateDemoTagFilterBtn();
    renderDemoCards();
}

function clearTags() {
    demoSelectedTags.clear();
    rebuildDemoTagModal();
    updateDemoTagFilterBtn();
    renderDemoCards();
}

function updateDemoTagFilterBtn() {
    const count = document.getElementById('tag-filter-count');
    const btn = document.getElementById('tag-filter-btn');
    if (demoSelectedTags.size > 0) {
        count.textContent = demoSelectedTags.size;
        count.style.display = 'inline';
        btn.classList.add('active');
    } else {
        count.style.display = 'none';
        btn.classList.remove('active');
    }
}

function DemoNoteCard(note) {
    const tags = note.tags.map(t => `<span class="note-tag">${t}</span>`).join('');
    const heartIcon = note.liked ? 'bi-heart-fill' : 'bi-heart';
    const heartColour = note.liked ? 'color:#e05c5c;' : '';
    return `
        <div class="note-card" style="cursor:default;">
            <div class="note-card-content">
                <div class="note-card-title" style="font-size:13px;">${note.title}</div>
                <div class="note-card-footer" style="margin-top:8px;">
                    <div class="note-card-tags">${tags}</div>
                    <button class="like-btn" onclick="toggleDemoLike(this, '${note.title}')">
                        <i class="bi ${heartIcon}" style="${heartColour}"></i>
                        <span>${note.likes}</span>
                    </button>
                </div>
            </div>
        </div>
    `;
}

function toggleDemoLike(btn, title) {
    const note = discoverDemoNotes.find(n => n.title === title);
    if (!note) return;
    note.liked = !note.liked;
    note.likes += note.liked ? 1 : -1;
    renderDemoCards();
}

function renderDemoCards() {
    const query = (document.getElementById('search-input')?.value || '').toLowerCase().trim();
    let notes = [...discoverDemoNotes];

    if (query) {
        notes = notes.filter(n => n.title.toLowerCase().includes(query));
    }
    if (demoSelectedTags.size > 0) {
        notes = notes.filter(n => [...demoSelectedTags].every(t => n.tags.includes(t)));
    }

    const grid = document.getElementById('notes-grid');
    if (!grid) return;
    grid.innerHTML = notes.length
        ? notes.map(DemoNoteCard).join('')
        : '<p style="color:var(--text-secondary); font-size:14px; padding: 8px 0;">No notes found.</p>';
}

document.addEventListener('click', function (e) {
    if (!e.target.closest('#tag-wrapper') && !e.target.closest('#tag-modal-backdrop')) {
        closeTagModal();
    }
});

DiscoverDemo()