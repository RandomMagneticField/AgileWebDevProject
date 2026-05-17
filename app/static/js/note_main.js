const NOTE_ID = document.getElementById('note-data').dataset.noteId || null;

function setMode(mode, element) {
    document.body.className = 'dashboard-body mode-' + mode;
    document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
    element.classList.add('active');
    if (mode !== 'edit') renderPreview();
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
    markUnsaved();
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

        const tagText = document.createTextNode(val + ' ');

        const removeBtn = document.createElement('button');
        removeBtn.className = 'tag-remove';
        removeBtn.textContent = '×';
        removeBtn.addEventListener('click', function () {
            removeTag(this);
        });

        pill.appendChild(tagText);
        pill.appendChild(removeBtn);

        document.getElementById('tags-wrap').insertBefore(pill, evnt.target);

        evnt.target.value = '';
        markUnsaved();
    }

    // function below makes backspace delete tags. Uncomment if we decide this is good UX. 
    // if (evnt.key === 'Backspace' && evnt.target.value === '') {
    //     const pills = document.querySelectorAll('#tags-wrap .tag-removable');
    //     if (pills.length) pills[pills.length - 1].remove();
    // }
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

window.addEventListener('resize', handleResponsiveMode);
handleResponsiveMode();

const isMobile = window.innerWidth <= 900;
document.body.classList.add(isMobile ? 'mode-edit' : 'mode-split');
renderPreview()


// Track unsaved changes
const saveBtn = document.getElementById('btn-save');

function markUnsaved() {
    saveBtn.classList.add('unsaved');
}

function markSaved() {
    saveBtn.classList.remove('unsaved');
}

noteTitle.addEventListener('input', markUnsaved);
textarea.addEventListener('input', markUnsaved);
document.getElementById('note-description').addEventListener('input', markUnsaved);

function saveNote() {
    if (!NOTE_ID) return;
    
    const data = {
        title: document.getElementById('note-title').innerText.trim(),
        content: document.getElementById('md-input').value,
        description: document.getElementById('note-description').value,
        is_public: document.getElementById('vis-public').classList.contains('active'),
        tags: Array.from(document.querySelectorAll('#tags-wrap .tag-removable'))
                .map(pill => pill.textContent.replace('×', '').trim())
    };

    fetch(`/api/notes/${NOTE_ID}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            markSaved();
            const now = new Date();
            const formatted = now.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
            document.getElementById('detail-updated').textContent = formatted;
        }
    });
}
function buildToc() {
    const list = document.getElementById('toc-list');

    // query all h1, h2, h3 elements from the preview
    const headings = preview.querySelectorAll('h1, h2, h3');

    if (headings.length === 0) {
        list.innerHTML = '<div class="toc-empty">No headings yet.</div>';
        return;
    }

    // clear existing toc before rebuilding
    list.innerHTML = '';

    headings.forEach(heading => {

        // wrapper row for the heading button and copy button
        const item = document.createElement('div');
        item.className = 'toc-item-row';

        // heading button 
        const btn = document.createElement('button');
        // toc-h1 (or h2 h3) class controls the indent level
        btn.className = `toc-item toc-${heading.tagName.toLowerCase()}`;
        btn.textContent = heading.textContent;
        btn.addEventListener('click', () => {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
        });

        // copy button (copies id)
        const copyBtn = document.createElement('button');
        copyBtn.className = 'heading-id-copy';
        copyBtn.innerHTML = '<i class="bi bi-copy"></i>';
        copyBtn.addEventListener('click', () => {
            // write #id to clipboard
            navigator.clipboard.writeText(`#${heading.id}`).then(() => {
                // show check icon briefly to confirm copy
                copyBtn.innerHTML = '<i class="bi bi-check"></i>';
                setTimeout(() => {
                    copyBtn.innerHTML = '<i class="bi bi-copy"></i>';
                }, 1500);
            });
        });

        item.appendChild(btn);
        item.appendChild(copyBtn);
        list.appendChild(item);
    });
}


if (NOTE_ID) {
    fetch(`/api/notes/${NOTE_ID}`)
        .then(res => res.json())
        .then(note => {
            document.getElementById('note-title').innerText = note.title;
            document.getElementById('md-input').value = note.content;
            document.getElementById('note-description').value = note.description;
            document.getElementById('detail-created').textContent = note.created_at;
            document.getElementById('detail-updated').textContent = note.updated_at;
            document.getElementById('detail-accessed').textContent = note.accessed_at;
            setVis(note.is_public ? 'public' : 'private');
            note.tags.forEach(tag => {
                const pill = document.createElement('span');
                pill.className = 'note-tag tag-removable';

                const tagText = document.createTextNode(tag + ' ');

                const removeBtn = document.createElement('button');
                removeBtn.className = 'tag-remove';
                removeBtn.textContent = '×';
                removeBtn.addEventListener('click', function () {
                    removeTag(this);
                });

                pill.appendChild(tagText);
                pill.appendChild(removeBtn);

                const input = document.getElementById('tag-input');
                document.getElementById('tags-wrap').insertBefore(pill, input);
            });
            renderPreview();
            markSaved(); 
        });
}

