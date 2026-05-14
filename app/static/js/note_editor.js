

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
