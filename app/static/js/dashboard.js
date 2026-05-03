// ── Dummy data ──
// const notesData = [
//     { title: 'Agile Development Overview', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', tags: ['CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2'], date: '31 Mar' },
//     { title: 'HTTP & REST APIs', body: 'REST stands for Representational State Transfer. Key HTTP methods include GET, POST, PUT, DELETE.', tags: ['CITS3000', 'exam-prep'], date: '28 Mar' },
//     { title: 'SQLAlchemy Relationships', body: 'One-to-many: use db.relationship() with back_populates. Many-to-many requires an association table.', tags: ['flask', 'database'], date: '25 Mar' },
//     { title: 'CSS Flexbox & Grid', body: 'Flexbox is one-dimensional layout. Grid is two-dimensional. Use flex for nav bars and card rows.', tags: ['css', 'week-3'], date: '20 Mar' },
//     { title: 'Flask Blueprints', body: 'Blueprints allow you to organise Flask routes into modules. Register with app.register_blueprint().', tags: ['flask', 'backend'], date: '18 Mar' },
//     { title: 'JavaScript Promises', body: 'A Promise represents a value that may be available now,A Promise represents a value that may be available now,A Promise represents a value that may be available now, in the future, or never. async/await is syntactic sugar.', tags: ['javascript', 'week-4'], date: '15 Mar' },
// ];

// const decksData = [
//     { title: 'Agile Development Overview', count: 20, lastScore: 16, lastTotal: 20, tags: ['CITS3000', 'week-longlonglonglonglonglonglonglong2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2'], date: '31 Mar' },
//     { title: 'HTTP Status Codes', count: 15, lastScore: 9, lastTotal: 15, tags: ['exam-prep'], date: '28 Mar' },
//     { title: 'Big O Notation', count: 18, lastScore: 16, lastTotal: 18, tags: ['algorithms', 'week-5'], date: '25 Mar' },
//     { title: 'Flask Basics', count: 20, lastScore: 11, lastTotal: 20, tags: ['flask', 'backend'], date: '20 Mar' },
//     { title: 'Git Commands', count: 24, lastScore: 18, lastTotal: 24, tags: ['CITS3000', 'tools'], date: '18 Mar' },
// ];

fetch('/api/dashboard')
    .then(res => res.json())
    .then(data => {
        notesData = data.notes;
        decksData = data.decks;
        renderCards();
    });


function switchTab(tab, el) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('panel-notes').style.display = tab === 'notes' ? 'block' : 'none';
    document.getElementById('panel-decks').style.display = tab === 'decks' ? 'block' : 'none';
}


// ── Card builders ──
function createNoteCard(note) {
    const tags = note.tags.map(t => `<span class="note-tag">${t}</span>`).join('');
    return `
        <div class="note-card" onclick="window.location=ROUTES.note_editor + '?id=${note.id}'">
            <div class="note-card-content">
                <div class="note-card-title">${note.title}</div>
                <div class="note-card-body">${note.body}</div>
                <div class="note-card-footer">
                    <div class="note-card-tags">${tags}</div>
                    <span class="note-card-date">${note.date}</span>
                </div>
            </div>
        </div>
    `;
}

function createDeckCard(deck) {
    const tags = deck.tags.map(t => `<span class="note-tag">${t}</span>`).join('');
    const pct = Math.round((deck.lastScore / deck.lastTotal) * 100);
    return `
        <div class="deck-card" onclick="window.location=ROUTES.flashcard_editor">
            <div class="deck-card-content">
                <div class="deck-card-header">
                    <a href="${ROUTES.flashcard_play}" class="deck-play-btn" >
                        <i class="bi bi-play-fill"></i>
                    </a>
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
                    <span class="note-card-date">${deck.date}</span>
                </div>
            </div>
        </div>
    `;
}

//sort the notes and decks 
const sortBtn = document.getElementById('sort-btn')
const sortDropdown = document.getElementById('sort-dropdown')
let currentSort = 'date'

sortBtn.addEventListener('click', function(){
    sortDropdown.style.display = 
        sortDropdown.style.display === 'block' ? 'none' : 'block'
})

document.querySelectorAll('.select-option').forEach(function(option){
    option.addEventListener('click', function(e){
        currentSort = this.dataset.value
        sortBtn.innerHTML = this.textContent + ' <i class="bi bi-chevron-down" style="font-size:11px;"></i>'
        document.querySelectorAll('.select-option').forEach(o => o.classList.remove('active'))
        this.classList.add('active')
        sortDropdown.style.display = 'none'
        renderCards()
    })
})

document.addEventListener('click', function(e){
    if(!e.target.closest('#sort-wrapper')){
        sortDropdown.style.display = 'none'
    }
})

function sortdata(data){
    const sorted = [...data]
    if(currentSort === 'alpha'){
        sorted.sort((a,b) => a.title.localeCompare(b.title))
    } else if(currentSort === 'date'){
        sorted.sort((a,b) => new Date(b.date) - new Date(a.date))
    }
    return sorted
}

//open the decks tab from flashcard_editor and flashcard_play
const params = new URLSearchParams(window.location.search)
if(params.get('tab') === 'decks'){
    switchTab('decks', document.querySelectorAll('.tab-btn')[1])
}

// ── Render ──
function renderCards() {
    document.getElementById('notes-grid').innerHTML = sortdata(notesData).map(createNoteCard).join('');
    document.getElementById('decks-grid').innerHTML = sortdata(decksData).map(createDeckCard).join('');
}


function openCreateModal() {
    document.getElementById('create-note-backdrop').style.display = 'block';
    document.getElementById('create-note-modal').style.display = 'block';
}

function closeCreateModal() {
    document.getElementById('create-note-backdrop').style.display = 'none';
    document.getElementById('create-note-modal').style.display = 'none';
}

function submitCreateNote() {
    const title = document.getElementById('new-note-title').value.trim() || 'Untitled';
    fetch('/api/notes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title })
    })
    .then(res => res.json())
    .then(data => {
        window.location.href = ROUTES.note_editor + '?id=' + data.id;
    });
}

// AJAX search
const searchInput = document.querySelector('.search-input');
let searchTimeout;

searchInput.addEventListener('input', function() {
    // cancels previous search by restarting time (prevent too many request being sent by only sending a request if user stops typing for some time)
    clearTimeout(searchTimeout);
    const query = this.value.trim();
    
    if (query === '') {
        fetch('/api/dashboard')
            .then(res => res.json())
            .then(data => {
                notesData = data.notes;
                decksData = data.decks;
                renderCards();
            });
        return;
    }
    
    searchTimeout = setTimeout(() => {
        // encode to URL safe format (e.g. spaces to %20)
        fetch(`/api/search?q=${encodeURIComponent(query)}`)
            // "Promise". once receive data parse as JSON
            .then(res => res.json())
            // then use data
            .then(data => {
                notesData = data.notes;
                decksData = data.decks;
                renderCards();
            });
    }, 300);
});