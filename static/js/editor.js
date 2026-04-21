function setMode(el) {
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    el.classList.add('active');
}

const noteTitle = document.getElementById('note-title');



noteTitle.addEventListener('blur', () => {
    if (noteTitle.textContent.trim() === '') {
        noteTitle.textContent = 'Enter Note Name...';
    }
    noteTitle.scrollLeft = 0;
});

noteTitle.addEventListener('input', () => {
    if (noteTitle.textContent.length > 50) {
        noteTitle.textContent = noteTitle.textContent.substring(0, 50);
        // keep cursor at end
        const range = document.createRange();
        const sel = window.getSelection();
        range.selectNodeContents(noteTitle);
        range.collapse(false);
        sel.removeAllRanges();
        sel.addRange(range);
    }
});

function setVis(v) {
    document.getElementById('vis-private').classList.toggle('active', v === 'private');
    document.getElementById('vis-public').classList.toggle('active', v === 'public');
}

function autoResizeTextarea(element) {
    element.style.height = 'auto';
    element.style.height = element.scrollHeight + 'px';
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
    }

    // function below makes backspace delete tags. Uncomment if we decide this is good UX. 
    // if (evnt.key === 'Backspace' && evnt.target.value === '') {
    //     const pills = document.querySelectorAll('#tags-wrap .tag-removable');
    //     if (pills.length) pills[pills.length - 1].remove();
    // }
}
function removeTag(btn) { 
    btn.closest('.tag-removable').remove(); 
}