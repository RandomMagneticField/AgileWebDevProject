// ── Dummy data ──
// const notesData = [
//     { title: 'Agile Development Overview', body: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.', tags: ['CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2'], date: '31 Mar 2007', likes: 12 },
//     { title: 'HTTP & REST APIs', body: 'REST stands for Representational State Transfer. Key HTTP methods include GET, POST, PUT, DELETE.', tags: ['CITS3000', 'exam-prep'], date: '28 Mar 2036', likes: 78 },
//     { title: 'SQLAlchemy Relationships', body: 'One-to-many: use db.relationship() with back_populates. Many-to-many requires an association table.', tags: ['flask', 'database'], date: '25 Mar 2018', likes: 21 },
//     { title: 'CSS Flexbox & Grid', body: 'Flexbox is one-dimensional layout. Grid is two-dimensional. Use flex for nav bars and card rows.', tags: ['css', 'week-3'], date: '20 Mar 2026', likes: 44 },
//     { title: 'Flask Blueprints', body: 'Blueprints allow you to organise Flask routes into modules. Register with app.register_blueprint().', tags: ['flask', 'backend'], date: '18 Mar 2022', likes: 21 },
//     { title: 'JavaScript Promises', body: 'A Promise represents a value that may be available now,A Promise represents a value that may be available now,A Promise represents a value that may be available now, in the future, or never. async/await is syntactic sugar.', tags: ['javascript', 'week-4'], date: '15 Mar 2076', likes: 7 },
// ];

// const decksData = [
//     { title: 'Agile Development Overview', count: 20, lastScore: 16, lastTotal: 20, tags: ['CITS3000', 'week-longlonglonglonglonglonglonglong2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2','CITS3000', 'week-2'], date: '31 Mar 2098', likes: 9 },
//     { title: 'HTTP Status Codes', count: 15, lastScore: 9, lastTotal: 15, tags: ['exam-prep'], date: '28 Mar 2000', likes: 6 },
//     { title: 'Big O Notation', count: 18, lastScore: 16, lastTotal: 18, tags: ['algorithms', 'week-5'], date: '25 Mar 1989', likes: 17 },
//     { title: 'Flask Basics', count: 20, lastScore: 11, lastTotal: 20, tags: ['flask', 'backend'], date: '20 Mar 2010', likes: 53 },
//     { title: 'Git Commands', count: 24, lastScore: 18, lastTotal: 24, tags: ['CITS3000', 'tools'], date: '18 Mar 2005', likes: 10 },
// ];

let notesData = []
let decksData = []
let selectedTags = new Set()
let searchTimeout

//fetch discover data
fetch('/api/discover')
    .then(res => res.json())
    .then(data => {
        notesData = data.notes
        decksData = data.decks
        renderCards()
    })

function switchTab(tab, el) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
    document.getElementById('panel-notes').style.display = tab === 'notes' ? 'block' : 'none';
    document.getElementById('panel-decks').style.display = tab === 'decks' ? 'block' : 'none';
}


// ── Card builders ──
function NoteCard(note) {
    const tags = note.tags.map(t => `<span class="note-tag">${t}</span>`).join('');
    const heartIcon = note.liked ? 'bi-heart-fill' : 'bi-heart'
    const heartColour = note.liked ? 'color:#e05c5c;' : '' 
    return `
        <div class="note-card" onclick="window.location='/discover/note/${note.id}'" style="cursor:pointer;">
            <div class="note-card-content">
                <div class="note-card-title">${note.title}</div>
                <div class="note-card-body">${note.body}</div>
                <div class="note-card-footer">
                    <div class="note-card-tags">${tags}</div>
                    <div style="display:flex; gap:8px; align-items:center; flex-shrink:0;">
                        <button class="like-btn" onclick="event.stopPropagation(); toggleNoteLike(this, ${note.id})">
                            <i class="bi ${heartIcon}" style="${heartColour}"></i>
                            <span>${note.likes}</span>
                        </button>
                        <button class="copy-btn" onclick="event.stopPropagation(); copyNote(this, ${note.id})" title="Copy to my library">
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
    const heartIcon = deck.liked ? 'bi-heart-fill' : 'bi-heart'
    const heartColour = deck.liked ? 'color:#e05c5c;' : '' 
    return `
        <div class="deck-card" onclick="window.location='/discover/deck/${deck.id}'" style="cursor:pointer;">
            <div class="deck-card-content">
                <div class="deck-card-header">
                    <div class="deck-card-info">
                        <div class="note-card-title">${deck.title}</div>
                        <div class="deck-card-count">${deck.count} Cards</div>
                    </div>
                </div>
                <div class="note-card-footer">
                    <div class="note-card-tags">${tags}</div>
                    <div style="display:flex; gap:8px; align-items:center; flex-shrink:0;">
                        <button class="like-btn" onclick="event.stopPropagation(); toggleDeckLike(this, ${deck.id})">
                            <i class="bi ${heartIcon}" style="${heartColour}"></i>
                            <span>${deck.likes}</span>
                        </button>
                        <button class="copy-btn" onclick="event.stopPropagation(); copyDeck(this, ${deck.id})" title="Copy to my library">
                            <i class="bi bi-copy"></i>
                        </button>
                    </div>
                </div>
            </div>
        </div>
    `;
}

// function toggleLike(btn){
//     const icon = btn.querySelector("i")
//     const count = btn.querySelector("span")
//     if(icon.classList.contains("bi-heart")){
//         icon.classList.remove("bi-heart")
//         icon.classList.add("bi-heart-fill")
//         icon.style.color = "#e05c5c"
//         count.textContent = parseInt(count.textContent) + 1
//     }
//     else{
//         icon.classList.remove("bi-heart-fill")
//         icon.classList.add("bi-heart")
//         icon.style.color=""
//         count.textContent = parseInt(count.textContent) - 1
//     }
// }

function toggleNoteLike(btn, noteId){
    fetch(`/api/notes/${noteId}/like`, {method: 'POST'})
        .then(res => res.json())
        .then(data => {
            const note = notesData.find(n => n.id === noteId)
            if (note) {
                note.liked = data.liked
                note.likes = data.likes
            }
            // const icon = btn.querySelector('i')
            // const count = btn.querySelector('span')
            // if (data.liked) {
            //     icon.classList.remove('bi-heart')
            //     icon.classList.add('bi-heart-fill')
            //     icon.style.color = '#e05c5c'
            // }
            // else{
            //     icon.classList.remove('bi-heart-fill')
            //     icon.classList.add('bi-heart')
            //     icon.style.color = ''
            // }
            // count.textContent = data.likes
            renderCards()
        })
}

function toggleDeckLike(btn, deckId){
    fetch(`/api/decks/${deckId}/like`, {method: 'POST'})
        .then(res => res.json())
        .then(data => {
            const deck = decksData.find(d => d.id === deckId)
            if (deck) {
                deck.liked = data.liked
                deck.likes = data.likes
            }
            // const icon = btn.querySelector('i')
            // const count = btn.querySelector('span')
            // if (data.liked) {
            //     icon.classList.remove('bi-heart')
            //     icon.classList.add('bi-heart-fill')
            //     icon.style.color = '#e05c5c'
            // }
            // else{
            //     icon.classList.remove('bi-heart-fill')
            //     icon.classList.add('bi-heart')
            //     icon.style.color = ''
            // }
            // count.textContent = data.likes
            renderCards()
        })
}

function copyNote(btn, noteId){
    fetch(`/api/notes/${noteId}/copy`, {method: 'POST'})
        .then(res => res.json())
        .then(data => {
            if (data.success){
                btn.innerHTML = '<i class="bi bi-check"></i>'
                btn.style.color = "var(--text-primary)"
                setTimeout(() => {
                    btn.innerHTML = '<i class="bi bi-copy"></i>'
                    btn.style.color = ""
                }, 1500)
            }
        })
}

function copyDeck(btn, deckId){
    fetch(`/api/decks/${deckId}/copy`, {method: 'POST'})
        .then(res => res.json())
        .then(data => {
            if (data.success){
                btn.innerHTML = '<i class="bi bi-check"></i>'
                btn.style.color = "var(--text-primary)"
                setTimeout(() => {
                    btn.innerHTML = '<i class="bi bi-copy"></i>'
                    btn.style.color = ""
                }, 1500)
            }
        })
}

// ── AJAX Search ──
const searchInput = document.getElementById('search-input')
let currentQuery = ''

searchInput.addEventListener('input', function () {
    clearTimeout(searchTimeout)
    const query = this.value.trim()
    currentQuery = query

    if (query === '') {
        fetch('/api/discover')
            .then(res => res.json())
            .then(data => {
                if(currentQuery !== '') return
                notesData = data.notes
                decksData = data.decks
                selectedTags.clear()
                updateTagFilterBtn()
                rebuildTagModal()
                renderCards()
            })
        return
    }

    searchTimeout = setTimeout(() => {
        fetch(`/api/discover/search?q=${encodeURIComponent(query)}`)
            .then(res => res.json())
            .then(data => {
                if (currentQuery !== query) return
                notesData = data.notes
                decksData = data.decks
                // clear any tags that no longer exist in new results
                const availableTags = getAvailableTags()
                selectedTags.forEach(t => { if (!availableTags.has(t)) selectedTags.delete(t) })
                updateTagFilterBtn()
                rebuildTagModal()
                renderCards()
            })
    }, 300)
})

// ── Tag modal ──
function getAvailableTags() {
    const isNotes = document.getElementById('panel-notes').style.display !== 'none'
    const data = isNotes ? notesData : decksData
    const tags = new Set()
    data.forEach(item => item.tags.forEach(t => tags.add(t)))
    return tags
}

function rebuildTagModal() {
    const pills = document.getElementById('tag-modal-pills')
    const availableTags = getAvailableTags()

    if (availableTags.size === 0) {
        pills.innerHTML = '<span style="color:var(--text-secondary); font-size:13px;">No tags available</span>'
        return
    }

    pills.innerHTML = [...availableTags].sort().map(tag => `
        <button class="tag-pill ${selectedTags.has(tag) ? 'active' : ''}" onclick="toggleTag('${tag}')">
            ${tag}
        </button>
    `).join('')
}

function openTagModal() {
    rebuildTagModal()
    document.getElementById('tag-modal-backdrop').style.display = 'block'
    document.getElementById('tag-modal').style.display = 'block'
}

function closeTagModal() {
    document.getElementById('tag-modal-backdrop').style.display = 'none'
    document.getElementById('tag-modal').style.display = 'none'
}

function toggleTag(tag) {
    if (selectedTags.has(tag)) {
        selectedTags.delete(tag)
    } else {
        selectedTags.add(tag)
    }
    rebuildTagModal()
    updateTagFilterBtn()
    renderCards()
}

function clearTags() {
    selectedTags.clear()
    rebuildTagModal()
    updateTagFilterBtn()
    renderCards()
}

function updateTagFilterBtn() {
    const count = document.getElementById('tag-filter-count')
    const btn = document.getElementById('tag-filter-btn')
    if (selectedTags.size > 0) {
        count.textContent = selectedTags.size
        count.style.display = 'inline'
        btn.classList.add('active')
    } else {
        count.style.display = 'none'
        btn.classList.remove('active')
    }
}


document.addEventListener('click', function (e) {
    if (!e.target.closest('#tag-wrapper') && !e.target.closest('#tag-modal-backdrop')) {
        closeTagModal()
    }
    if (!e.target.closest('#sort-wrapper')) {
        sortDropdown.style.display = 'none'
    }
})

//sort the notes and decks 
const sortBtn = document.getElementById('sort-btn')
const sortDropdown = document.getElementById('sort-dropdown')
let currentSort = 'likes' //set default sort by number of likes

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
        sorted.sort((a,b) => new Date(b.date_sort) - new Date(a.date_sort))
    } else if(currentSort === 'likes'){
        sorted.sort((a,b) => (b.likes || 0) - (a.likes || 0))
    }
    return sorted
}

// ── Render ──
function renderCards() {
    let notes = sortdata(notesData)
    let decks = sortdata(decksData)

    if (selectedTags.size > 0) {
        //all selected tag(s) must be in the shown note
        notes = notes.filter(n => [...selectedTags].every(t => n.tags.includes(t)))
        decks = decks.filter(d => [...selectedTags].every(t => d.tags.includes(t)))
        //as long as some of the selected tags are present
        // notes = notes.filter(n => n.tags.some(t => selectedTags.has(t)))
        // decks = decks.filter(d => d.tags.some(t => selectedTags.has(t)))
    }
    document.getElementById('notes-grid').innerHTML = notes.map(NoteCard).join('');
    document.getElementById('decks-grid').innerHTML = decks.map(DeckCard).join('');
}
