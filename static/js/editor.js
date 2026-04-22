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


function handleResponsiveMode() {
    const isMobile = window.innerWidth <= 900;
    if (isMobile) {
        const previewBtn = document.querySelector('.view-btn[onclick*="preview"]');
        setMode('preview', previewBtn);
    }
}

window.addEventListener('resize', handleResponsiveMode);
handleResponsiveMode();

// Markdown preview rendering

// breaks treat breaks as br, gfm = github flavoured markdown, adds tables, strikethough etc.
marked.setOptions({ breaks: true, gfm: true });

const textarea = document.getElementById('md-input');
const preview = document.getElementById('md-preview');

const isMobile = window.innerWidth <= 900;
document.body.classList.add(isMobile ? 'mode-edit' : 'mode-split');
function renderPreview() {
    preview.innerHTML = marked.parse(textarea.value || '');
}


renderPreview()


function onEdit() {
    renderPreview();
}

function fmt(type) {

    // we added const textarea earlier (md-input)
    const el = textarea;
    // cursor start and end positions
    const start = el.selectionStart;
    const end = el.selectionEnd;

    // selected text
    const sel = el.value.substring(start, end);

    // everything before selected
    const before = el.value.substring(0, start);
    // everyting after
    const after = el.value.substring(end);

    let newText = ''
    let cursorOffset = 0
    let selectLen = 0;

    switch (type) {
        
        case 'bold':
            // if text is selected, wrap it. If not, insert placeholder and select it.
            newText = `**${sel || 'bold text'}**`;
            cursorOffset = sel ? newText.length : 2 + 9; 
            selectLen = sel ? 0 : 9;                     
            break;
        case 'italic':
            newText = `*${sel || 'italic text'}*`;
            cursorOffset = sel ? newText.length : 1 + 11; 
            selectLen = sel ? 0 : 11;
            break;
        case 'strike':
            newText = `~~${sel || 'strikethrough'}~~`;
            cursorOffset = sel ? newText.length : 2 + 13; 
            selectLen = sel ? 0 : 13;
            break;

        // headings
        case 'h1':
            // if the cursor is already at the start of a line, no \n is added. If it's mid-line, a \n is added first to push it onto a new line.
            // check if start is 0 or if char before is \n to determine this.
            const prefix1 = start === 0 || el.value[start - 1] === '\n' ? '' : '\n';
            newText = `${prefix1}# ${sel || 'Heading 1'}`;
            cursorOffset = newText.length;
            selectLen = sel ? 0 : 9;
            break;
        case 'h2':
            const prefix2 = start === 0 || el.value[start - 1] === '\n' ? '' : '\n';
            newText = `${prefix2}## ${sel || 'Heading 2'}`;
            cursorOffset = newText.length;
            selectLen = sel ? 0 : 9;
            break;
        case 'h3':
            const prefix3 = start === 0 || el.value[start - 1] === '\n' ? '' : '\n';
            newText = `${prefix3}### ${sel || 'Heading 3'}`;
            cursorOffset = newText.length;
            selectLen = sel ? 0 : 9;
            break;

        // lists and quote
        case 'ul':
            // same logic for heading
            const prefixUl = start === 0 || el.value[start - 1] === '\n' ? '' : '\n';
            newText = `${prefixUl}- ${sel || 'List item'}`;
            cursorOffset = newText.length;
            selectLen = sel ? 0 : 9;
            break;

        case 'ol':
            const prefixOl = start === 0 || el.value[start - 1] === '\n' ? '' : '\n';
            newText = `${prefixOl}1. ${sel || 'List item'}`;
            cursorOffset = newText.length;
            selectLen = sel ? 0 : 9;
            break;
        case 'quote':
            const prefixQ = start === 0 || el.value[start - 1] === '\n' ? '' : '\n';
            newText = `${prefixQ}> ${sel || 'Blockquote'}`;
            cursorOffset = newText.length;
            selectLen = sel ? 0 : 10;
            break;
            
        default:
            return;
    }
    // rebuild textarea with formatted text inserted
    el.value = before + newText + after;
    // focus back on textarea and set cursor selection
    el.focus();
    el.selectionStart = start + cursorOffset - selectLen;
    el.selectionEnd = start + cursorOffset;
    // re render preview
    onEdit();
}