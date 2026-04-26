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

//render all cards as list
function renderCards(){
    const list = document.getElementById('card-list')
    list.innerHTML = "" //clear everything inside card-list to avoid duplicating card everytime we re-render

    cards.forEach(function(card, index){
        const row = document.createElement('div') //create a new <div> for each flashcard (one row)
        row.className = 'card-row'
        row.draggable = true
        row.dataset.index = index //track which card is being dragged

        //display all card 
        row.innerHTML = `
            <span class="card-num">${index + 1}.</span>
            <i class="bi bi-grip-vertical card-drag-handle"></i>
            <div class="card-body">
                <div class="card-side">
                    <div class="card-side-label">FRONT</div>
                    <textarea class="card-side-text" placeholder="Front side..." rows="2">${card.front}</textarea>
                </div>
                <div class="card-side-divider"></div>
                <div class="card-side">
                    <div class="card-side-label">BACK</div>
                    <textarea class="card-side-text" placeholder="Back side..." rows="2">${card.back}</textarea>
                </div>
            </div>
            <button class="card-delete" onclick="deleteCard(${index})">
                <i class="bi bi-trash"></i>
            </button>
        `

        //save edits made by user
        const textareas = row.querySelectorAll('.card-side-text')
        //save changes made for front side of the flashcard
        textareas[0].addEventListener('input', function(){
            cards[index].front = this.value
        })
        //save changes made for back side of the flashcard
        textareas[1].addEventListener('input', function(){
            cards[index].back = this.value
        })


        //drag (to move the card order)
        row.addEventListener('dragstart', ondragstart)
        row.addEventListener('dragover', ondragover)
        row.addEventListener('drop', ondrop)
        row.addEventListener('dragend', ondragend)


        list.appendChild(row)//update the list
    })
    
    updateProgress()//update the progress bar
}


//add new card
document.getElementById('btn-add-card').addEventListener('click', function(){
    cards.push({front: "", back: ""})
    renderCards()
    //scroll to the bottom to make it easier for user to see their new card
    const list = document.getElementById('card-list')
    list.lastElementChild.scrollIntoView({behavior: "smooth"})
})


//delete card
function deleteCard(index){
    if(cards.length === 1) return //make sure we have atleast one flashcard
    else{
        cards.splice(index, 1)
        renderCards()
    }
}

//Progress Bar
function updateProgress(){
    const filled = cards.filter(c => c.front.trim() && c.back.trim()).length
    const total = cards.length
    const percentage = total === 0 ? 0 : (filled/total) * 100 //if total=0; we use 0/0. Otherwise, we compute it by filled/total * 100 to get the percentage
    document.getElementById('progress-bar').style.width = percentage + "%"
    document.getElementById('progress-label').textContent = `${filled} / ${total}`
}

//Visibility toggle
function setVis(val) {
    document.getElementById('vis-private').classList.toggle('active', val === 'private')
    document.getElementById('vis-public').classList.toggle('active', val === 'public')
}

function handleTag(evnt) {

    if (evnt.key === 'Enter' || evnt.key === ',') {
        const val = evnt.target.value.trim().replace(/,/g, '').substring(0, 20);

        if (!val) {
            return;
        }

        const pill = document.createElement('span');
        pill.className = 'note-tag tag-removable';
        pill.innerHTML = `${val} <button class="tag-remove" onclick="removeTag(this)">×</button>`;
        document.getElementById('tags-wrap').insertBefore(pill, evnt.target);

        // clear input
        evnt.target.value = '';
         markUnsaved();
    }
}


function removeTag(btn) { 
    btn.closest('.tag-removable').remove(); 
     markUnsaved();
}

function handleResponsiveMode() {
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
        const previewBtn = document.querySelector('.view-btn[onclick*="preview"]');
        setMode('preview', previewBtn);
    }
}

// Track unsaved changes
const saveBtn = document.getElementById('btn-save');

function markUnsaved() {
    saveBtn.classList.add('unsaved');
}

function markSaved() {
    saveBtn.classList.remove('unsaved');
}


function saveNote() {
    markSaved();
}

//Drag and Drop
let dragIndex = null

function ondragstart(e){
    dragIndex = parseInt(this.dataset.index)
    this.classList.add('dragging')
}

function ondragover(e){
    e.preventDefault()
    document.querySelectorAll('.card-row').forEach(r => r.classList.remove('drag-over'))
    this.classList.add('drag-over')
}

function ondrop(e){
    e.preventDefault()
    const dropIndex = parseInt(this.dataset.index)
    if(dragIndex === null || dragIndex === dropIndex) return 
    //reoder the cards array
    const moved = cards.splice(dragIndex, 1)[0]
    cards.splice(dropIndex, 0, moved)
    renderCards()
}

function ondragend(){
    document.querySelectorAll('.card-row').forEach(r => {
        r.classList.remove('dragging')
        r.classList.remove('drag-over')
    })
    dragIndex = null
}

renderCards() //initializer