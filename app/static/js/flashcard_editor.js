//dummy data
// let cards = [
//     { front: 'Pallor Mortis', back: 'Paleness that occurs after death' },
//     { front: 'Rigor Mortis', back: 'Stiffening of muscles after death' },
//     { front: 'Livor Mortis', back: 'Purplish discoloration of skin after death' },
//     { front: 'Algor Mortis', back: 'Cooling of the body after death' },
//     { front: 'Putrefaction', back: 'Decomposition of body tissues after death' },
//     { front: 'Forensic Entomology', back: 'Study of insects to determine time of death' },
//     { front: 'Post-mortem Interval', back: 'Time elapsed since death occurred' },
//     { front: 'Adipocere', back: 'Waxy substance formed from body fat after death' },
// ]


let cards = []
const deckId = document.getElementById('deck-data').dataset.deckId
// console.log('deck id:', deckId)

//render all cards as list
function renderCards(){
    const list = document.getElementById('card-list')
    list.innerHTML = ""

    cards.forEach(function(card, index){
        const row = document.createElement('div')
        row.className = 'card-row'
        row.dataset.index = index

        //display all card 
        row.innerHTML = `
            <span class="card-num">${index + 1}.</span>
            <div class="card-body">
                <div class="card-drag-handle-wrap">
                    <i class="bi bi-grip-vertical card-drag-handle"></i>
                </div>
                <div class="card-side">
                    <div class="card-side-label">FRONT</div>
                    <textarea class="card-side-text" placeholder="Front side..." rows="2">${card.front}</textarea>
                </div>
                <div class="card-side-divider"></div>
                <div class="card-side">
                    <div class="card-side-label">BACK</div>
                    <textarea class="card-side-text" placeholder="Back side..." rows="2">${card.back}</textarea>
                </div>
                <button class="card-delete" onclick="deleteCard(${index})">
                    <i class="bi bi-trash"></i>
                </button>
            </div>
        `

        //save edits made by user
        const textareas = row.querySelectorAll('.card-side-text')
        //save changes made for front side of the flashcard
        textareas[0].addEventListener('input', function(){
            cards[index].front = this.value
            markUnsaved()
            updateProgress()
        })
        //save changes made for back side of the flashcard
        textareas[1].addEventListener('input', function(){
            cards[index].back = this.value
            markUnsaved()
            updateProgress()
        })

        list.appendChild(row)
    })
    
    updateProgress()

    // initialise sortable after rendering
    Sortable.create(list, {
        handle: '.card-drag-handle',
        animation: 150,
        ghostClass: 'sortable-ghost',
        onEnd: function(evt) {
            const moved = cards.splice(evt.oldIndex, 1)[0]
            cards.splice(evt.newIndex, 0, moved)
            renderCards()
            markUnsaved()
        }
    })
}

const deckTitle = document.getElementById('decks-title')

deckTitle.addEventListener('blur', () => {
    if (deckTitle.textContent.trim() === '') {
        deckTitle.textContent = 'Enter Deck Name...'
    }
    deckTitle.scrollLeft = 0
})

deckTitle.addEventListener('input', () => {
    markUnsaved()
    if (deckTitle.textContent.length > 50) {
        deckTitle.textContent = deckTitle.textContent.substring(0, 50)
        const range = document.createRange()
        const sel = window.getSelection()
        range.selectNodeContents(deckTitle)
        range.collapse(false)
        sel.removeAllRanges()
        sel.addRange(range)
    }
})


//add new card
document.getElementById('btn-add-card').addEventListener('click', function(){
    cards.push({front: "", back: ""})
    renderCards()
    markUnsaved()
    //scroll to the bottom to make it easier for user to see their new card
    const list = document.getElementById('card-list')
    list.lastElementChild.scrollIntoView({behavior: "smooth"})
})


//delete card
function deleteCard(index){
    if(cards.length === 1) {
        alert('A deck must have at least one card')
        return
    }
    else{
        cards.splice(index, 1)
        renderCards()
        markUnsaved()
    }
}

//Progress Bar
function updateProgress(){
    const filled = cards.filter(c => c.front.trim() && c.back.trim()).length
    const total = cards.length
    const percentage = total === 0 ? 0 : (filled/total) * 100
    document.getElementById('progress-bar').style.width = percentage + "%"
    document.getElementById('progress-label').textContent = `${filled} / ${total}`
}

//Visibility toggle
function applyVis(val) {
    document.getElementById('vis-private').classList.toggle('active', val === 'private')
    document.getElementById('vis-public').classList.toggle('active', val === 'public')
}

function setVis(val) {
    applyVis(val)
    markUnsaved()
}

function handleTag(evnt) {

    if (evnt.key === 'Enter' || evnt.key === ',') {
        const val = evnt.target.value.trim().replace(/,/g, '').substring(0, 20)
        if (!val) return
        const pill = document.createElement('span')
        pill.className = 'note-tag tag-removable'
        pill.innerHTML = `${val} <button class="tag-remove" onclick="removeTag(this)">×</button>`
        document.getElementById('tags-wrap').insertBefore(pill, evnt.target)
        evnt.target.value = ''
        markUnsaved()
    }
}


function removeTag(btn) { 
    btn.closest('.tag-removable').remove()
    markUnsaved()
}

const saveBtn = document.getElementById('btn-save')

function markUnsaved() {
    saveBtn.classList.add('unsaved')
}

function markSaved() {
    saveBtn.classList.remove('unsaved')
}



function saveDeck() {
    if (!deckId) return

    const hasEmptyCard = cards.some(card =>
        card.front.trim() === '' || card.back.trim() === ''
    )

    if (hasEmptyCard){
        alert("All flashcards must have both front and back text")
        return
    }

    const data = {
        title: document.getElementById('decks-title').innerText.trim(),
        cards: cards,
        is_public: document.getElementById('vis-public').classList.contains('active'),
        tags: Array.from(document.querySelectorAll('#tags-wrap .tag-removable'))
                .map(pill => pill.textContent.replace('×', '').trim())
    }

    fetch(`/api/decks/${deckId}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            markSaved()
            const now = new Date()
            const formatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
            document.getElementById('detail-updated').textContent = formatted
        }
    })
}

function deleteDeck() {
    if (!deckId) return
    if (!confirm('Are you sure you want to delete this deck?')) return
    
    fetch(`/api/decks/${deckId}`, {
        method: 'DELETE',
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/dashboard?tab=decks'
        }
    })
}

function playDeck(){
    window.location = '/dashboard/flashcard?id=' + deckId + '&from=flashcard_editor'
}

if (deckId) {
    fetch(`/api/decks/${deckId}`)
        .then(res => res.json())
        .then(deck => {
            document.getElementById('decks-title').textContent = deck.title
            cards = deck.cards
            applyVis(deck.is_public ? 'public' : 'private')
            deck.tags.forEach(tag => {
                const pill = document.createElement('span')
                pill.className = 'note-tag tag-removable'
                pill.innerHTML = `${tag} <button class="tag-remove" onclick="removeTag(this)">×</button>`
                const input = document.getElementById('tag-input')
                document.getElementById('tags-wrap').insertBefore(pill, input)
            })
            document.getElementById('detail-created').textContent = deck.created_at
            document.getElementById('detail-updated').textContent = deck.updated_at
            document.getElementById('detail-accessed').textContent = deck.accessed_at
            renderCards()
        })
}else {
    renderCards()
}