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
        pill.innerHTML = `${val} <button class="tag-remove" onclick="removeTag(this)">×</button>`;
        document.getElementById('tags-wrap').insertBefore(pill, evnt.target);

        // clear input
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



// Markdown preview rendering

const renderer = new marked.Renderer();
renderer.heading = function({ text, depth }) {
    const id = text.toLowerCase().replace(/[^\w]+/g, '-');
    return `<h${depth} id="${id}">${text}</h${depth}>`;
};



// breaks treat breaks as br, gfm = github flavoured markdown, adds tables, strikethough etc.
marked.setOptions({ 
    breaks: true, 
    gfm: true,
    renderer: renderer
});

const textarea = document.getElementById('md-input');
const preview = document.getElementById('md-preview');

window.addEventListener('resize', handleResponsiveMode);
handleResponsiveMode();

const isMobile = window.innerWidth <= 900;
document.body.classList.add(isMobile ? 'mode-edit' : 'mode-split');


function bindAnchorLinks() {
    // find all links in preview that start with #
    const anchorLinks = preview.querySelectorAll('a[href^="#"]');

    anchorLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault();

            // get the anchor target e.g. "#html5-fundamentals" → "html5-fundamentals"
            const targetId = link.getAttribute('href').substring(1);

            // find the heading in the preview with that id
            const targetEl = preview.querySelector(`#${targetId}`);

            if (targetEl) {
                // scroll the preview div to the heading
                targetEl.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        });
    });
}
function renderPreview() {
    preview.innerHTML = marked.parse(textarea.value || '');
    bindAnchorLinks();
    buildToc();
}


renderPreview()


function onEdit() {
    renderPreview();
}

function insertAtCursor(text) {
    const element = textarea;
    const start = element.selectionStart;
    element.value = element.value.substring(0, start) + text + element.value.substring(element.selectionEnd);
    element.selectionStart = element.selectionEnd = start + text.length;
    onEdit();
}


function handleKeys(event) {

    if ((event.ctrlKey || event.metaKey) && event.key === 'b') {
        event.preventDefault();
        fmt('bold');
    }
    if ((event.ctrlKey || event.metaKey) && event.key === 'i') {
        event.preventDefault();
        fmt('italic');
    }

    // Auto continue lists on enter. 
    if (event.key === 'Enter') {
        const cursorPos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursorPos);

        // used /n to split lines, and used pop to get last (current) line
        const currentLine = textBefore.split('\n').pop();

        // check if current line is a bullet/num list item
        const ulMatch = currentLine.match(/^(\s*)-\s/);
        const olMatch = currentLine.match(/^(\s*)(\d+)\.\s/);

        if (ulMatch) {
            event.preventDefault();
            // ulMatch[1] captures (\s*), which is the indent (white spaces)
            const indent = ulMatch[1];

            // check if line is just a empty dash when enter is pressed
            if (currentLine.trim() === '-') {
                // if so, break out of list with a new line (delete the dash and add a new line)
                const newValue = textarea.value.substring(0, cursorPos - currentLine.length) + '\n' + textarea.value.substring(cursorPos);
                textarea.value = newValue;
                textarea.selectionStart = textarea.selectionEnd = cursorPos - currentLine.length + 1;
                onEdit();
            } else {
                // continue bullet list with same indent
                insertAtCursor(`\n${indent}- `);
            }

        } else if (olMatch) {
            event.preventDefault();
            const indent = olMatch[1];

            if (currentLine.trim() === `${olMatch[2]}.`) {
                const newValue = textarea.value.substring(0, cursorPos - currentLine.length) + '\n' + textarea.value.substring(cursorPos);
                textarea.value = newValue;
                textarea.selectionStart = textarea.selectionEnd = cursorPos - currentLine.length + 1;
                onEdit();
            } else {
                // continue numbered list with same indent
                insertAtCursor(`\n${indent}1. `);
            }
        }
    }

    // Tab indents and dedents (only lists)
    if (event.key === 'Tab') {

        event.preventDefault();

        const cursorPos = textarea.selectionStart;
        const textBefore = textarea.value.substring(0, cursorPos);
        
        const currentLine = textBefore.split('\n').pop();
        const isListLine = currentLine.match(/^(\s*)[-\d]/);

        if (isListLine) {
            const lineStart = cursorPos - currentLine.length;

            if (event.shiftKey) {
                // dedent 
                if (currentLine.startsWith('    ')) {
                    textarea.value = textarea.value.substring(0, lineStart) + currentLine.substring(4) + textarea.value.substring(cursorPos);
                    textarea.selectionStart = textarea.selectionEnd = cursorPos - 4;
                    onEdit();
                }
            } else {
                // indent
                textarea.value = textarea.value.substring(0, lineStart) + '    ' + currentLine + textarea.value.substring(cursorPos);
                textarea.selectionStart = textarea.selectionEnd = cursorPos + 4;
                onEdit();
            }
        } else {
            // not a list line, act as normal tab (insert 4 spaces)
            insertAtCursor('    ');
        }
    }
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
        

        case 'code':
            newText = `\`${sel || 'code'}\``;
            cursorOffset = sel ? newText.length : 1 + 4;
            selectLen = sel ? 0 : 4;
            break;
        case 'codeblock':
            const prefixCb = start === 0 || el.value[start - 1] === '\n' ? '' : '\n';
            newText = `${prefixCb}\`\`\`\n${sel || 'code here'}\n\`\`\`\n`;
            cursorOffset = sel ? newText.length : prefixCb.length + 4 + 9;
            selectLen = sel ? 0 : 9;
            break;

        case 'table':
            openTableModal();
            return;
        // note if --- is added right below a line, md will treat it as h2.
        case 'hr':
            const prefixHr = start === 0 || el.value[start - 1] === '\n' ? '' : '\n';
            newText = `${prefixHr}***\n`;
            cursorOffset = newText.length;
            selectLen = 0;
            break;
        case 'link':
            newText = `[${sel || 'link text'}](url)`;
            cursorOffset = sel ? newText.length - 5 : 1 + 9;
            selectLen = sel ? 0 : 9;
            break;
        default:
            return;
    }
    // rebuild textarea with formatted text inserted
    if (type === 'hr') {
        // include sel to prevent text deletion for hr
        el.value = before + newText + sel + after;
    } else {
        el.value = before + newText + after;
    }

   // save scroll position before focusing
    const scrollTop = el.scrollTop;

    // focus back on textarea and set cursor selection
    el.focus();
    el.selectionStart = start + cursorOffset - selectLen;
    el.selectionEnd = start + cursorOffset;

    // restore scroll position
    el.scrollTop = scrollTop;

    // re render preview
    onEdit();
}


// Table modal
const GRID_COLS = 8;
const GRID_ROWS = 6;
let selectedCols = 3, selectedRows = 3;

function buildGrid() {

    const picker = document.getElementById('grid-picker');
    picker.innerHTML = '';

    for (let r = 1; r <= GRID_ROWS; r++) {
        for (let c = 1; c <= GRID_COLS; c++) {
            const cell = document.createElement('div');
            // dataset allows you to set data-* attributes on elements. Used here to store rol and col nums
            cell.dataset.r = r;
            cell.dataset.c = c;
            cell.className = 'grid-cell';

            // () => used to only call the function on click, not immediately. 
            cell.addEventListener('mouseover', () => hoverGrid(r, c));
            cell.addEventListener('click', () => { selectedCols = c; selectedRows = r; syncFromGrid(); });
            picker.appendChild(cell);
        }
    }
    // for default 3x3 to show as active on open
    highlightGrid(selectedCols, selectedRows);
}

function hoverGrid(rows, cols) {
    highlightGrid(cols, rows);
    // update the "num x num" label on top of the grid
    document.getElementById('grid-label').textContent = `${cols} × ${rows}`;
}

function highlightGrid(cols, rows) {
    // getComputedStyle gets computed CSS styles on the html element (where :root vars live) and getPropertyValue gets the value of the specific CSS variable.
    const activeCell = getComputedStyle(document.documentElement).getPropertyValue('--grid-cell-active-bg').trim();
    const inactiveCell = getComputedStyle(document.documentElement).getPropertyValue('--grid-cell-bg').trim();
    const activeBorder = getComputedStyle(document.documentElement).getPropertyValue('--grid-cell-active-border').trim();
    const inactiveBorder = getComputedStyle(document.documentElement).getPropertyValue('--editor-box-border').trim();

    document.querySelectorAll('#grid-picker div').forEach(cell => {
        let isWithinSelection = false;

        // cols and rows are of the cell being hovered
        if (cell.dataset.c <= cols && cell.dataset.r <= rows) {
            isWithinSelection = true;
        }

        if (isWithinSelection) {
            cell.style.background = activeCell;
            cell.style.borderColor = activeBorder;
        } else {
            cell.style.background = inactiveCell;
            cell.style.borderColor = inactiveBorder;
        }
    });
}

// called when a cell is clicked. 
function syncFromGrid() {
    // sync input fields for row and cols
    document.getElementById('tbl-cols').value = selectedCols;
    document.getElementById('tbl-rows').value = selectedRows;

    // sync the preview label between input fields and the insert or cancel buttons.
    updatePreviewLabel();

    highlightGrid(selectedCols, selectedRows);
    // sync grid label above grid
    document.getElementById('grid-label').textContent = `${selectedCols} × ${selectedRows}`;
}

function syncFromInputs() {
    // converts input to int, defaults to 1 if empty or invalid. capped at col 50 and row 100.
    selectedCols = Math.max(1, Math.min(50, parseInt(document.getElementById('tbl-cols').value) || 1));
    selectedRows = Math.max(1, Math.min(100, parseInt(document.getElementById('tbl-rows').value) || 1));

    // ensure if input is larger than grid it won't break and will just highlight max grid.
    highlightGrid(Math.min(selectedCols, GRID_COLS), Math.min(selectedRows, GRID_ROWS));
    document.getElementById('grid-label').textContent = `${selectedCols} × ${selectedRows}`;
    updatePreviewLabel();
}

function updatePreviewLabel() {
    // handles grammar
    const colWord = selectedCols > 1 ? 'columns' : 'column';
    const rowWord = selectedRows > 1 ? 'rows' : 'row';

    const label = `${selectedCols} ${colWord} × ${selectedRows} ${rowWord} (+ 1 header row)`;
    document.getElementById('tbl-preview-label').textContent = label;
}

function openTableModal() {
    buildGrid();
    syncFromGrid();
    document.getElementById('table-modal-backdrop').style.display = 'block';
    document.getElementById('table-modal').style.display = 'block';
}

function closeTableModal() {
    document.getElementById('table-modal-backdrop').style.display = 'none';
    document.getElementById('table-modal').style.display = 'none';
}

function insertTable() {
    const cols = selectedCols;
    const rows = selectedRows;

    // build header row: | Column 1 | Column 2 | Column 3 | etc
    const colNames = Array.from({length: cols}, (_, i) => ` Column ${i + 1} `);
    const header = '|' + colNames.join('|') + '|';

    // build divider row: |---|---|---|
    const divider = '|' + Array(cols).fill('---').join('|') + '|';

    // build a single data row: | Cell | Cell | Cell |
    const dataRow = '|' + Array(cols).fill(' Cell ').join('|') + '|';

    // repeat the data row for however many rows selected
    const allDataRows = [];
    for (let i = 0; i < rows; i++) {
        allDataRows.push(dataRow);
    }

    // combine everything 
    const newText = `\n${header}\n${divider}\n${allDataRows.join('\n')}\n\n`;

    // insert at cursor position (this deletes any selected text)
    const el = textarea;
    const start = el.selectionStart;
    el.value = el.value.substring(0, start) + newText + el.value.substring(el.selectionEnd);

    // move cursor to end of inserted table
    el.focus();
    el.selectionStart = el.selectionEnd = start + newText.length;

    // re-render preview and close modal
    onEdit();
    closeTableModal();
}


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
    markSaved();
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