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
let correct_cards = []
let wrong_cards = []


//get the card
function renderCard(){
    const card = cards[currentIndex]
    document.getElementById('front-text').textContent = card.front
    document.getElementById('back-text').textContent = card.back
    document.getElementById('counter').textContent = `Card ${currentIndex + 1} of ${cards.length}`
    document.getElementById('inner').classList.remove('flipped')
    isFlipped = false
}


//go to the next card after right answer
document.getElementById('btn-correct').addEventListener('click', function(){
    correct_ans++
    correct_cards.push(cards[currentIndex])
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
    wrong_cards.push(cards[currentIndex])
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
    const percent = Math.round(correct_ans/cards.length *100)
    document.getElementById('results-percentage').textContent = `${percent}% correct`
    document.getElementById('results-correct').textContent = `${correct_ans} correct`
    document.getElementById('results-wrong').textContent = `${wrong_ans} wrong`

    const correctList = document.getElementById('correct-list')
    correctList.innerHTML = correct_cards.map((c, i) => `
        <div class="card-body" style="margin-bottom: 8px;">
            <div class="card-side">
                <div class="card-side-label">FRONT</div>
                <div class="card-side-text">${c.front}</div>
            </div>
            <div class="card-side-divider"></div>
            <div class="card-side">
                <div class="card-side-label">BACK</div>
                <div class="card-side-text">${c.back}</div>
            </div>
        </div>
    `).join('')

    const wrongList = document.getElementById('wrong-list')
    wrongList.innerHTML = wrong_cards.map((c, i) => `
        <div class="card-body" style="margin-bottom: 8px;">
            <div class="card-side">
                <div class="card-side-label">FRONT</div>
                <div class="card-side-text">${c.front}</div>
            </div>
            <div class="card-side-divider"></div>
            <div class="card-side">
                <div class="card-side-label">BACK</div>
                <div class="card-side-text">${c.back}</div>
            </div>
        </div>
    `).join('')

    document.querySelector('.editor-layout > div').style.display = 'none' //hide the card
    document.getElementById('result-page').style.display = 'block' //show result page
}

function restartDeck(){
    correct_ans = 0
    wrong_ans = 0
    currentIndex = 0
    correct_cards = []
    wrong_cards = []
    document.querySelector('.editor-layout > div').style.display = 'block'
    document.getElementById('result-page').style.display = 'none'
    renderCard()
}


renderCard()