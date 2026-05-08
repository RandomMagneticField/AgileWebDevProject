let cards = []
const deckId = document.getElementById('deck-data').dataset.deckId

let currentIndex = 0
let isFlipped = false
let correct_ans = 0
let wrong_ans = 0
let answer = []

//get the card
function renderCard(){
    const card = cards[currentIndex]
    document.getElementById('front-text').textContent = card.front
    document.getElementById('back-text').textContent = card.back
    document.getElementById('counter').textContent = `Card ${currentIndex + 1} of ${cards.length}`
    document.getElementById('inner').classList.remove('flipped')
    isFlipped = false
    updateProgress()
}

//Progress Bar
function updateProgress(){
    const total = cards.length
    const percentage = total === 0 ? 0 : ((currentIndex) / total) * 100
    document.getElementById('progress-bar').style.width = percentage + '%'
    document.getElementById('progress-label').textContent = `${currentIndex} / ${total}`
}


//go to the next card after right answer
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

//go to the next card after wrong answer
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

//flip card
function flipCard(){
    const inner = document.getElementById('inner')
    isFlipped = !isFlipped
    inner.classList.toggle('flipped', isFlipped)
}

//change the save state based on the saving state
function saveProgress(){
    const indicator = document.getElementById('save-indicator')
    indicator.className = 'save-indicator saving'
    indicator.innerHTML = '<i class="bi bi-arrow-repeat"></i> Saving...'

    fetch(`/api/decks/${deckId}/progress`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({current_index: currentIndex})
    })
    .then(res => {
        if (res.ok) {
            indicator.className = 'save-indicator saved'
            indicator.innerHTML = '<i class="bi bi-check2"></i> Saved'
        } else {
            indicator.className = 'save-indicator failed'
            indicator.innerHTML = '<i class="bi bi-exclamation-circle"></i> Save failed'
        }
    })
    .catch(() => {
        indicator.className = 'save-indicator failed'
        indicator.innerHTML = '<i class="bi bi-exclamation-circle"></i> Save failed'
    })
}

//results
function displayResults(){
    //update the progress bar to be full
    document.getElementById('progress-bar').style.width = '100%'
    document.getElementById('progress-label').textContent = `${cards.length} / ${cards.length}`

    //count the percentage of correct ans
    const percent = Math.round(correct_ans / cards.length * 100)

    //swapping the save state to save button
    const indicator = document.getElementById('save-indicator')
    indicator.className = 'save-indicator'
    indicator.innerHTML = '<button class="btn-save" onclick="saveAndExit()">Save</button>'

    //print out the general info of the results
    document.getElementById('results-percentage').textContent = `${percent}% correct`
    document.getElementById('results-correct').textContent = `${correct_ans} correct`
    document.getElementById('results-wrong').textContent = `${wrong_ans} wrong`

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

    //reset progress
    fetch(`/api/decks/${deckId}/progress`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({current_index: 0})
    })
}

//restart deck
function restartDeck(){
    correct_ans = 0
    wrong_ans = 0
    currentIndex = 0
    answer = []
    const indicator = document.getElementById('save-indicator')
    indicator.className = 'save-indicator saved'
    indicator.innerHTML = '<i class="bi bi-check2"></i> Saved'
    document.getElementById('card-viewer').style.display = 'flex'
    document.getElementById('result-page').style.display = 'none'
    renderCard()
    saveProgress()
}

//save results and exit
function saveAndExit(){
    const results = answer.map(entry => ({
        flashcard_id: entry.card.id,
        is_correct: entry.result === 'correct'
    }))

    fetch(`/api/decks/${deckId}/results`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({results: results})
    }).then(() => {
        window.location.href = '/dashboard?tab=decks'})
}

//load deck and resume progress
if (deckId) {
    fetch(`/api/decks/${deckId}`)
        .then(res => res.json())
        .then(deck => {
            cards = deck.cards
            document.getElementById('decks-title').textContent = deck.title
            return fetch(`/api/decks/${deckId}/progress`)
        })
        .then(res => res.json())
        .then(data => {
            currentIndex = data.current_index
            renderCard()
        })
}