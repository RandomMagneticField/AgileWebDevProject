let pendingDeleteQuizId = null;

function openQuizDeleteModal(quizId, quizName) {
    pendingDeleteQuizId = quizId;

    const modal = document.getElementById('quiz-delete-modal');
    const backdrop = document.getElementById('quiz-delete-modal-backdrop');
    const message = document.getElementById('quiz-delete-modal-message');

    if (!modal || !backdrop) return;

    if (message && quizName) {
        message.textContent = `Are you sure you want to permanently delete "${quizName}"? This action cannot be undone.`;
    }

    modal.hidden = false;
    backdrop.hidden = false;
}

function closeQuizDeleteModal() {
    const modal = document.getElementById('quiz-delete-modal');
    const backdrop = document.getElementById('quiz-delete-modal-backdrop');

    if (modal) modal.hidden = true;
    if (backdrop) backdrop.hidden = true;

    pendingDeleteQuizId = null;
}

function removeQuizHistoryItem(quizId) {
    const quizItem = document.querySelector(`.quiz-history-item[data-quiz-id="${quizId}"]`);
    const quizHistoryList = document.getElementById('quiz-history-list');

    if (quizItem) {
        quizItem.remove();
    }

    if (quizHistoryList && !quizHistoryList.querySelector('.quiz-history-item')) {
        quizHistoryList.innerHTML = '<div class="quiz-history-empty">No quizzes generated yet.</div>';
    }
}

function confirmQuizDelete() {
    if (!pendingDeleteQuizId) return;

    fetch(`/api/quiz/${pendingDeleteQuizId}`, {
        method: 'DELETE'
    })
        .then(res => res.json())
        .then(data => {
            if (!data.success) {
                alert(data.error || 'Failed to delete quiz.');
                closeQuizDeleteModal();
                return;
            }

            removeQuizHistoryItem(pendingDeleteQuizId);
            closeQuizDeleteModal();
        })
        .catch(() => {
            alert('Failed to delete quiz.');
            closeQuizDeleteModal();
        });
}

function initQuizHistoryActions() {
    const quizItems = document.querySelectorAll('.quiz-history-item');
    const deleteButtons = document.querySelectorAll('.quiz-history-delete-btn');
    const modalCancel = document.getElementById('quiz-delete-modal-cancel');
    const modalConfirm = document.getElementById('quiz-delete-modal-confirm');
    const modalBackdrop = document.getElementById('quiz-delete-modal-backdrop');

    quizItems.forEach((item) => {
        item.addEventListener('click', () => {
            const targetUrl = item.dataset.quizTarget;
            if (!targetUrl) return;
            window.location.href = targetUrl;
        });
    });

    deleteButtons.forEach((button) => {
        button.addEventListener('click', (event) => {
            event.stopPropagation();
            const quizId = button.dataset.quizId;
            const quizName = button.dataset.quizName;
            openQuizDeleteModal(quizId, quizName);
        });
    });

    if (modalCancel) {
        modalCancel.addEventListener('click', closeQuizDeleteModal);
    }

    if (modalConfirm) {
        modalConfirm.addEventListener('click', confirmQuizDelete);
    }

    if (modalBackdrop) {
        modalBackdrop.addEventListener('click', closeQuizDeleteModal);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initQuizHistoryActions);
} else {
    initQuizHistoryActions();
}

function deleteNote() {
    if (!NOTE_ID) return;
    if (!confirm('Are you sure you want to delete this note?')) return;
    
    fetch(`/api/notes/${NOTE_ID}`, {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = '/dashboard';
        }
    });
}

const quizBtn = document.querySelector('.btn-quiz');

function setQuizButtonLoading(isLoading) {
    if (!quizBtn) return;

    quizBtn.disabled = isLoading;
    quizBtn.innerHTML = isLoading
        ? '<i class="bi bi-lightning-charge"></i> Generating...'
        : '<i class="bi bi-lightning-charge"></i> Generate Quiz';
}

async function goToQuiz() {
    if (quizBtn && quizBtn.disabled) {
        return;
    }

    setQuizButtonLoading(true);

    const resetQuizButton = () => setQuizButtonLoading(false);

    // Require a saved note id first
    if (!NOTE_ID) {
        alert('Please save this note before generating a quiz.');
        resetQuizButton();
        return;
    }

    // If there are unsaved changes, block generation
    if (saveBtn.classList.contains('unsaved')) {
        alert('Please save this note before generating a quiz.');
        resetQuizButton();
        return;
    }

    // Fetch note data from DB
    let note;
    try {
        const noteRes = await fetch(`/api/notes/${Number(NOTE_ID)}`);
        if (!noteRes.ok) {
            alert('Could not load note from server.');
            resetQuizButton();
            return;
        }
        note = await noteRes.json();
    } catch (e) {
        alert('Could not load note from server.');
        resetQuizButton();
        return;
    }

    const noteTitle = (note.title || '').trim();
    const noteContent = (note.content || '').trim();

    if (!noteTitle) {
        alert('Please add a note title before generating a quiz.');
        resetQuizButton();
        return;
    }

    if (!noteContent) {
        alert('Please add note content before generating a quiz.');
        resetQuizButton();
        return;
    }

    try {
        const generateResponse = await fetch(`/api/quizzes/generate/${Number(NOTE_ID)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' }
        });

        const generatedQuiz = await generateResponse.json();

        if (!generateResponse.ok) {
            if (generatedQuiz.error === 'insufficient information') {
                alert('There is not enough information in this note to generate a quiz.');
                resetQuizButton();
                return;
            }

            alert('Could not generate quiz');
            resetQuizButton();
            return;
        }

        const saveResponse = await fetch(`/api/quizzes/save/${Number(NOTE_ID)}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(generatedQuiz)
        });

        const savedQuiz = await saveResponse.json();

        if (!saveResponse.ok || !savedQuiz.quiz_id) {
            alert('Could not generate quiz');
            resetQuizButton();
            return;
        }

        if (generatedQuiz.content_truncated) {
            alert('Note content is too long (approximately more than 40k characters). Generated quiz may not cover later parts of your note. Try splitting up your note into smaller notes in future quiz generations.');
        }

        window.location.href = `/quiz/active?id=${savedQuiz.quiz_id}`;
    } catch (error) {
        alert('Could not generate quiz');
        resetQuizButton();
        return;
    } finally {
        resetQuizButton();
    }

}