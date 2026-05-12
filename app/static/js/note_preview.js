const NOTE_ID = document.getElementById('note-data').dataset.noteId || null

const preview = document.getElementById('md-preview')

// markdown renderer
const renderer = new marked.Renderer()

renderer.heading = function({ text, depth }) {
    const id = text.toLowerCase().replace(/[^\w]+/g, '-')
    return `<h${depth} id="${id}">${text}</h${depth}>`
}

marked.setOptions({
    breaks: true,
    gfm: true,
    renderer: renderer
})

// load note preview data
if (NOTE_ID) {
    fetch(`/api/discover/notes/${NOTE_ID}/preview`)
        .then(res => {
            if (!res.ok) throw new Error(res.status)
                return res.json()})
        .then(note => {
            document.getElementById('note-title').innerText = note.title
            preview.innerHTML = marked.parse(note.content || '')
            document.getElementById('note-description').textContent = note.description || 'No description'
            document.getElementById('detail-creator').textContent = note.creator || 'Unknown'
            document.getElementById('detail-created').textContent = note.created_at
            document.getElementById('detail-updated').textContent = note.updated_at
            const tagsWrap = document.getElementById('tags-wrap') 
            tagsWrap.innerHTML = '';
            (note.tags || []).forEach(tag => {
                const pill = document.createElement('span')
                pill.className = 'note-tag'
                pill.textContent = tag
                tagsWrap.appendChild(pill)
            })
            buildToc()
            bindAnchorLinks()
        })
        .catch(err => {
            console.error('Failed to load note:', err)
            preview.innerHTML = '<p>Failed to load note.</p>'
        })
}

// table of contents
function buildToc() {
    const list = document.getElementById('toc-list')
    const headings = preview.querySelectorAll('h1, h2, h3')
    if (headings.length === 0) {
        list.innerHTML = '<div class="toc-empty">No headings yet.</div>'
        return
    }
    list.innerHTML = ''
    headings.forEach(heading => {
        const btn = document.createElement('button')
        btn.className = `toc-item toc-${heading.tagName.toLowerCase()}`
        btn.textContent = heading.textContent
        btn.addEventListener('click', () => {
            heading.scrollIntoView({
                behavior: 'smooth',
                block: 'start'
            })
        })
        list.appendChild(btn)
    })
}

// anchor links inside markdown
function bindAnchorLinks() {
    const anchorLinks = preview.querySelectorAll('a[href^="#"]')
    anchorLinks.forEach(link => {
        link.addEventListener('click', (event) => {
            event.preventDefault()
            const targetId = link.getAttribute('href').substring(1)
            const targetEl = preview.querySelector(`#${targetId}`)
            if (targetEl) {
                targetEl.scrollIntoView({
                    behavior: 'smooth',
                    block: 'start'
                })
            }
        })
    })
}

// copy note
function copyNote() {
    fetch(`/api/notes/${NOTE_ID}/copy`, {method: 'POST'})
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            const btn = document.getElementById('btn-save')
            btn.textContent = 'Copied!'
            setTimeout(() => {
                btn.textContent = 'Copy'
            }, 1500)
        }
    })
    .catch(err => console.error('Failed to copy note:', err))
}