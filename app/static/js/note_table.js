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
    markUnsaved();
    closeTableModal();
}


