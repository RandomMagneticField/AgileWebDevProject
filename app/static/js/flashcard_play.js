//dummy data
let cards = [
    { front: 'Pallor Mortis', back: 'Paleness that occurs after death' },
    { front: 'Rigor Mortis', back: 'Stiffening of muscles after death' },
    { front: 'Livor Mortis', back: 'Purplish discoloration of skin after death' },
    { front: 'Algor Mortis', back: 'Cooling of the body after death' },
    { front: 'Putrefaction', back: 'Decomposition of body tissues after death' },
    { front: 'Forensic Entomology', back: 'Study of insects to determine time of death' },
    { front: 'Post-mortem Interval', back: 'Time elapsed since death occurred' },
    { front: 'Adipocere', back: 'Waxy substance formed from body fat after death' },
]

let currentIndex = 0
let isFlipped = false
let correct_ans = 0
let wrong_ans=0
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
    }
    else{
        displayResults()
    }
})

//go to the next card after wrong answer
document.getElementById('btn-wrong').addEventListener('click', function(){
    wrong_ans++
    answer.push({card: cards[currentIndex], result: 'wrong'})
    if(currentIndex < cards.length - 1){
        currentIndex++
        renderCard()
    }
    else{
        displayResults()
    }
})

//flip card
function flipCard(){
    const inner = document.getElementById('inner')
    isFlipped = !isFlipped
    inner.classList.toggle('flipped', isFlipped)
}

//results
function displayResults(){
    //update the progress bar to be full
    document.getElementById('progress-bar').style.width = '100%'
    document.getElementById('progress-label').textContent = `${cards.length} / ${cards.length}`
    //count the percentage of correct ans
    const percent = Math.round(correct_ans/cards.length *100)
    //print out the general info of the results
    document.getElementById('results-percentage').textContent = `${percent}% correct`
    document.getElementById('results-correct').textContent = `${correct_ans} correct`
    document.getElementById('results-wrong').textContent = `${wrong_ans} wrong`

    const list = document.getElementById('correct-list')
    document.getElementById('wrong-list').style.display = 'none'

    list.innerHTML = answer.map((entry, i) => `
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

    document.getElementById("card-viewer").style.display = 'none' //hide the card
    document.getElementById('result-page').style.display = 'block' //show result page
}

function restartDeck(){
    correct_ans = 0
    wrong_ans = 0
    currentIndex = 0
    answer = []
    document.getElementById("card-viewer").style.display = 'flex'
    document.getElementById('result-page').style.display = 'none'
    renderCard()
}

const backBtn = document.getElementById("back")
const params = new URLSearchParams(window.location.search)
const from = params.get('from')
if(from === "flashcard_editor"){
    backBtn.href="flashcard_editor.html"
}
else{
    backBtn.href="index.html?tab=decks"
}


renderCard()