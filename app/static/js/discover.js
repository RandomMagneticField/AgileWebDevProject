// ── Dummy data ──
const notesData = [
    { title: 'Agile Development Overview', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', tags: ['CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2'], date: '31 Mar' },
    { title: 'HTTP & REST APIs', body: 'REST stands for Representational State Transfer. Key HTTP methods include GET, POST, PUT, DELETE.', tags: ['CITS3000', 'exam-prep'], date: '28 Mar' },
    { title: 'SQLAlchemy Relationships', body: 'One-to-many: use db.relationship() with back_populates. Many-to-many requires an association table.', tags: ['flask', 'database'], date: '25 Mar' },
    { title: 'CSS Flexbox & Grid', body: 'Flexbox is one-dimensional layout. Grid is two-dimensional. Use flex for nav bars and card rows.', tags: ['css', 'week-3'], date: '20 Mar' },
    { title: 'Flask Blueprints', body: 'Blueprints allow you to organise Flask routes into modules. Register with app.register_blueprint().', tags: ['flask', 'backend'], date: '18 Mar' },
    { title: 'JavaScript Promises', body: 'A Promise represents a value that may be available now,A Promise represents a value that may be available now,A Promise represents a value that may be available now, in the future, or never. async/await is syntactic sugar.', tags: ['javascript', 'week-4'], date: '15 Mar' },
];

const decksData = [
    { title: 'Agile Development Overview', count: 20, lastScore: 16, lastTotal: 20, tags: ['CITS3000', 'week-longlonglonglonglonglonglonglong2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2'], date: '31 Mar' },
    { title: 'HTTP Status Codes', count: 15, lastScore: 9, lastTotal: 15, tags: ['exam-prep'], date: '28 Mar' },
    { title: 'Big O Notation', count: 18, lastScore: 16, lastTotal: 18, tags: ['algorithms', 'week-5'], date: '25 Mar' },
    { title: 'Flask Basics', count: 20, lastScore: 11, lastTotal: 20, tags: ['flask', 'backend'], date: '20 Mar' },
    { title: 'Git Commands', count: 24, lastScore: 18, lastTotal: 24, tags: ['CITS3000', 'tools'], date: '18 Mar' },
];


function switchTab(tab, el) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('panel-notes').style.display = tab === 'notes' ? 'block' : 'none';
    document.getElementById('panel-decks').style.display = tab === 'decks' ? 'block' : 'none';
}


// ── Card builders ──
function NoteCard(note) {
    const tags = note.tags.map(t => `<span class="note-tag">${t}</span>`).join('');
    return `
        <div class="note-card">
            <div class="note-card-content">
                <div class="note-card-title">${note.title}</div>
                <div class="note-card-body">${note.body}</div>
                <div class="note-card-footer">
                    <div class="note-card-tags">${tags}</div>
                    <div style="display:flex; gap:8px; align-items:center; flex-shrink:0;">
                        <button class="like-btn" onclick="toggleLike(this)">
                            <i class="bi bi-heart"></i>
                            <span>12</span>
                        </button>
                        <button class="copy-btn" onclick="copyNote(this)" title="Copy to my library">
                            <i class="bi bi-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function DeckCard(deck) {
    const tags = deck.tags.map(t => `<span class="note-tag">${t}</span>`).join('');
    const pct = Math.round((deck.lastScore / deck.lastTotal) * 100);
    return `
        <div class="deck-card">
            <div class="deck-card-content">
                <div class="deck-card-header">
                    <div class="deck-card-info">
                        <div class="deck-card-title">${deck.title}</div>
                        <div class="deck-card-count">${deck.count} Cards</div>
                    </div>
                </div>
                <div class="deck-progress-section">
                    <div class="deck-progress-labels">
                        <span class="deck-progress-label">Last Session</span>
                        <span class="deck-progress-value">${deck.lastScore} / ${deck.lastTotal}</span>
                    </div>
                    <div class="deck-progress-bar">
                        <div class="deck-progress-fill" style="width: ${pct}%"></div>
                    </div>
                </div>
                <div class="note-card-footer">
                    <div class="note-card-tags">${tags}</div>
                    <div style="display:flex; gap:8px; align-items:center; flex-shrink:0;">
                        <button class="like-btn" onclick="toggleLike(this)">
                            <i class="bi bi-heart"></i>
                            <span>8</span>
                        </button>
                        <button class="copy-btn" onclick="copyDeck(this)" title="Copy to my library">
                            <i class="bi bi-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

function toggleLike(btn){
    const icon = btn.querySelector("i")
    const count = btn.querySelector("span")
    if(icon.classList.contains("bi-heart")){
        icon.classList.remove("bi-heart")
        icon.classList.add("bi-heart-fill")
        icon.style.color = "#e05c5c"
        count.textContent = parseInt(count.textContent) + 1
    }
    else{
        icon.classList.remove("bi-heart-fill")
        icon.classList.add("bi-heart")
        icon.style.color=""
        count.textContent = parseInt(count.textContent) - 1
    }
}

function copyNote(btn){
    btn.innerHTML = '<i class="bi bi-check"></i>'
    btn.style.color = "var(--text-primary)"
    setTimeout(() => {
        btn.innerHTML = '<i class="bi bi-copy"></i>'
        btn.style.color = ""
    }, 1500)
}

function copyDeck(btn){
    copyNote(btn)
}

 //search..
 const searchinput = document.getElementById("search-input")

 searchinput.addEventListener('input', function(){
    const val = this.value.toLowerCase()

    const filteredNotes = notesData.filter(note =>
        note.title.toLowerCase().includes(val) || note.tags.some(t => t.toLowerCase().includes(val))
    )

    const filteredDecks = decksData.filter(deck =>
        deck.title.toLowerCase().includes(val) || deck.tags.some(t => t.toLowerCase().includes(val))
    )

    document.getElementById('notes-grid').innerHTML = filteredNotes.map(NoteCard).join('')
    document.getElementById('decks-grid').innerHTML = filteredDecks.map(DeckCard).join('')
 })

// ── Render ──
function renderCards() {
    document.getElementById('notes-grid').innerHTML = notesData.map(NoteCard).join('');
    document.getElementById('decks-grid').innerHTML = decksData.map(DeckCard).join('');
}

renderCards();