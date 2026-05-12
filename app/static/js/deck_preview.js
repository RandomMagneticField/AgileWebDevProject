const DECK_ID = document.getElementById('deck-data').dataset.deckId || null

let cards = []
let currentIndex = 0
let isFlipped = false

// markdown renderer
const renderer = new marked.Renderer()

marked.setOptions({
    breaks: true,
    gfm: true,
    renderer: renderer
})

// load deck data
if (DECK_ID) {
    fetch(`/api/discover/decks/${DECK_ID}/preview`)
        .then(res => {
            if (!res.ok) throw new Error(res.status)
            return res.json()
        })
        .then(deck => {
            document.getElementById('decks-title').innerText = deck.title
            document.getElementById('detail-creator').textContent = deck.creator || 'unknown'
            document.getElementById('detail-count').textContent = deck.count ?? '-'
            document.getElementById('detail-created').textContent = deck.created_at
            const tagsWrap = document.getElementById('tags-wrap')
            tagsWrap.innerHTML = ''
            ;(deck.tags || []).forEach(tag => {
                const pill = document.createElement('span')
                pill.className = 'note-tag'
                pill.textContent = tag
                tagsWrap.appendChild(pill)
            });
            cards = deck.cards
            if (cards.length === 0) {
                document.getElementById('counter').textContent = 'No cards'
                return
            }

            renderCard()
        })
        .catch(err => {
            console.error('Failed to load deck:', err)
            document.getElementById('front-text').textContent = 'Failed to load deck.'
        })
}

// render current card
function renderCard() {
    const card = cards[currentIndex]

    isFlipped = false
    document.getElementById('inner').classList.remove('flipped')

    document.getElementById('front-text').innerHTML =
        marked.parse(card.front || '')

    document.getElementById('back-text').innerHTML =
        marked.parse(card.back || '')

    document.getElementById('counter').textContent =
        `Card ${currentIndex + 1} of ${cards.length}`

    updateProgress()
}

// progress bar
function updateProgress() {
    const pct = ((currentIndex + 1) / cards.length) * 100
    document.getElementById('progress-bar').style.width = `${pct}%`
    document.getElementById('progress-label').textContent =
        `${currentIndex + 1} / ${cards.length}`
}

// flip card
function flipCard() {
    isFlipped = !isFlipped
    document.getElementById('inner').classList.toggle('flipped', isFlipped)
}

// prev card
function prevCard() {
    if (currentIndex > 0) {
        currentIndex--
        renderCard()
    }
}

// next card
function nextCard() {
    if (currentIndex < cards.length - 1) {
        currentIndex++
        renderCard()
    }
}

// copy deck
function copyDeck() {
    fetch(`/api/decks/${DECK_ID}/copy`, {
        method: 'POST'
    })
    .then(res => {
        if (!res.ok) throw new Error(res.status)
        return res.json()
    })
    .then(data => {
        if (data.success) {
            const btn = document.getElementById('btn-save')
            btn.textContent = 'Copied!'
            setTimeout(() => {
                btn.textContent = 'Copy'
            }, 1500)
        }
    })
    .catch(err => {
        console.error('Failed to copy deck:', err)
    })
}