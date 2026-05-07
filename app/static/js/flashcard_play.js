let cards = []
const deckId = document.getElementById('deck-data').dataset.deckId

let currentIndex = 0
let isFlipped = false
let correct_ans = 0
let wrong_ans = 0
let answer = []

function renderCard(){
    const card = cards[currentIndex]
    document.getElementById('front-text').textContent = card.front
    document.getElementById('back-text').textContent = card.back
    document.getElementById('counter').textContent = `Card ${currentIndex + 1} of ${cards.length}`
    document.getElementById('inner').classList.remove('flipped')
    isFlipped = false
    updateProgress()
}

function updateProgress(){
    const total = cards.length
    const percentage = total === 0 ? 0 : ((currentIndex) / total) * 100
    document.getElementById('progress-bar').style.width = percentage + '%'
    document.getElementById('progress-label').textContent = `${currentIndex} / ${total}`
}

function saveProgress(){
    fetch(`/api/decks/${deckId}/progress`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({current_index: currentIndex})
    })
}

document.getElementById('btn-correct').addEventListener('click', function(){
    correct_ans++
    answer.push({ card: cards[currentIndex], result: 'correct' })
    if(currentIndex < cards.length - 1){
        currentIndex++
        renderCard()
        saveProgress()
    } else {
        displayResults()
    }
})

document.getElementById('btn-wrong').addEventListener('click', function(){
    wrong_ans++
    answer.push({ card: cards[currentIndex], result: 'wrong' })
    if(currentIndex < cards.length - 1){
        currentIndex++
        renderCard()
        saveProgress()
    } else {
        displayResults()
    }
})

function flipCard(){
    const inner = document.getElementById('inner')
    isFlipped = !isFlipped
    inner.classList.toggle('flipped', isFlipped)
}

function displayResults(){
    document.getElementById('progress-wrap').style.display = 'none'
    document.getElementById('progress-label').style.display = 'none'
    document.getElementById('btn-save').style.display = 'block'
    document.getElementById('btn-save').closest('.editor-header-right').style.display = 'flex'
    const percent = Math.round(correct_ans / cards.length * 100)
    document.getElementById('results-percentage').textContent = `Score : ${percent}/100`

    const list = document.getElementById('correct-list')
    document.getElementById('wrong-list').style.display = 'none'

    list.innerHTML = answer.map((entry) => `
        <div class="card-body ${entry.result}" style="margin-bottom: 8px;">
            <div class="card-side">
                <div class="card-side-label">FRONT</div>
                <div class="card-side-text">${entry.card.front}</div>
            </div>
            <div class="card-side-divider"></div>
            <div class="card-side">
                <div class="card-side-label">BACK</div>
                <div class="card-side-text">${entry.card.back}</div>
            </div>
        </div>
    `).join('')

    document.getElementById('card-viewer').style.display = 'none'
    document.getElementById('result-page').style.display = 'block'

    fetch(`/api/decks/${deckId}/progress`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({current_index: 0})
    })
}

function restartDeck(){
    correct_ans = 0
    wrong_ans = 0
    currentIndex = 0
    answer = []
    document.getElementById('progress-wrap').style.display = 'block'
    document.getElementById('progress-label').style.display = 'block'
    document.getElementById('btn-save').style.display = 'none'
    document.getElementById('btn-save').closest('.editor-header-right').style.display = 'none'
    document.getElementById('card-viewer').style.display = 'flex'
    document.getElementById('result-page').style.display = 'none'
    renderCard()
}

function SaveandExit(){
    const results = answer.map(entry => ({
        flashcard_id: entry.card.id,
        is_correct: entry.result === 'correct'
    }))

    fetch(`/api/decks/${deckId}/results`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({results: results})
    }).then(() => {
        window.location.href = '{{ url_for("main.dashboard") }}?tab=decks'
    })
}

if (deckId) {
    fetch(`/api/decks/${deckId}`)
        .then(res => res.json())
        .then(deck => {
            cards = deck.cards
            return fetch(`/api/decks/${deckId}/progress`)
        })
        .then(res => res.json())
        .then(data => {
            currentIndex = data.current_index
            renderCard()
        })
}