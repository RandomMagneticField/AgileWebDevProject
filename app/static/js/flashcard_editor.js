let cards = [
    {front: 'Click to edit front', back: 'Click to edit back'}
]

let currentIndex = 0
let isFlipped = false


//get the card
function renderCard(){
    const card = cards[currentIndex]
    document.getElementById('front-text').textContent = card.front
    document.getElementById('back-text').textContent = card.back
    document.getElementById('counter').textContent = `Card ${currentIndex + 1} of ${cards.length}`
    document.getElementById('inner').classList.remove('flipped')
    isFlipped = false
}

//flip the card
function flipCard(){
    const inner = document.getElementById('inner')
    isFlipped = !isFlipped
    inner.classList.toggle('flipped', isFlipped)
}

//go to the previous card
document.getElementById('btn-prev').addEventListener('click', function(){
    if(currentIndex>0){
        currentIndex--
        renderCard()
    }
})

//go to the next card
document.getElementById('btn-next').addEventListener('click', function(){
    if(currentIndex < cards.length - 1){
        currentIndex++
        renderCard()
    }
})

//add new card
document.getElementById('add-card').addEventListener('click', function(){
    cards.push({front: "Front", back: "Back"})
    currentIndex = cards.length -1
    renderCard()
})

//delete current card
document.getElementById('btn-delete').addEventListener('click', function(){
    cards.splice(currentIndex, 1)
    if(currentIndex >= cards.length){
        currentIndex = cards.length -1
    }
    renderCard()
})

//edit front part of the card
document.getElementById('front-text').addEventListener('input', function(){
    cards[currentIndex].front = this.textContent
})

//edit back part of the card
document.getElementById('back-text').addEventListener('input', function(){
    cards[currentIndex].back = this.textContent
})

renderCard()