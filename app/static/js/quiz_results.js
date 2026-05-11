const QUIZ_ID = new URLSearchParams(window.location.search).get('id');

// Edit Quiz Name Modal
function openEditModal() {
    const modal = document.getElementById('quiz-edit-modal');
    const backdrop = document.getElementById('quiz-edit-modal-backdrop');
    const input = document.getElementById('quiz-edit-name-input');
    
    if (!modal || !backdrop) return;
    
    modal.hidden = false;
    backdrop.hidden = false;
    input.focus();
    input.select();
}

function closeEditModal() {
    const modal = document.getElementById('quiz-edit-modal');
    const backdrop = document.getElementById('quiz-edit-modal-backdrop');
    
    if (modal) modal.hidden = true;
    if (backdrop) backdrop.hidden = true;
}

async function submitEditName() {
    const input = document.getElementById('quiz-edit-name-input');
    const newName = input.value.trim();
    
    if (!newName) {
        alert('Quiz name cannot be empty');
        return;
    }
    
    try {
        const response = await fetch(`/api/quiz/${QUIZ_ID}/name`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name: newName })
        });
        
        if (response.ok) {
            // Update the quiz name in the page
            const data = await response.json();
            document.querySelector('.quiz-title').textContent = data.name;
            closeEditModal();
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to update quiz name');
        }
    } catch (error) {
        console.error('Error updating quiz name:', error);
        alert('An error occurred while updating the quiz name');
    }
}

// Delete Quiz Modal
function openDeleteModal() {
    const modal = document.getElementById('quiz-delete-modal');
    const backdrop = document.getElementById('quiz-delete-modal-backdrop');
    
    if (!modal || !backdrop) return;
    
    modal.hidden = false;
    backdrop.hidden = false;
}

function closeDeleteModal() {
    const modal = document.getElementById('quiz-delete-modal');
    const backdrop = document.getElementById('quiz-delete-modal-backdrop');
    
    if (modal) modal.hidden = true;
    if (backdrop) backdrop.hidden = true;
}

async function confirmDelete() {
    try {
        const response = await fetch(`/api/quiz/${QUIZ_ID}`, {
            method: 'DELETE'
        });
        
        if (response.ok) {
            // Redirect to the note editor page
            const data = await response.json();
            window.location.href = `/dashboard/note_editor?id=${data.note_id}`;
        } else {
            const data = await response.json();
            alert(data.error || 'Failed to delete quiz');
            closeDeleteModal();
        }
    } catch (error) {
        console.error('Error deleting quiz:', error);
        alert('An error occurred while deleting the quiz');
        closeDeleteModal();
    }
}

// Event listeners
document.addEventListener('DOMContentLoaded', () => {
    const editButton = document.getElementById('btn-edit-name');
    const deleteButton = document.getElementById('btn-delete');
    const editCancelBtn = document.getElementById('quiz-edit-modal-cancel');
    const editSubmitBtn = document.getElementById('quiz-edit-modal-submit');
    const editInput = document.getElementById('quiz-edit-name-input');
    const deleteCancelBtn = document.getElementById('quiz-delete-modal-cancel');
    const deleteConfirmBtn = document.getElementById('quiz-delete-modal-confirm');
    const editBackdrop = document.getElementById('quiz-edit-modal-backdrop');
    const deleteBackdrop = document.getElementById('quiz-delete-modal-backdrop');
    
    if (editButton) {
        editButton.addEventListener('click', openEditModal);
    }
    
    if (deleteButton) {
        deleteButton.addEventListener('click', openDeleteModal);
    }
    
    if (editCancelBtn) {
        editCancelBtn.addEventListener('click', closeEditModal);
    }
    
    if (editSubmitBtn) {
        editSubmitBtn.addEventListener('click', submitEditName);
    }
    
    if (editInput) {
        editInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                submitEditName();
            }
        });
    }
    
    if (deleteCancelBtn) {
        deleteCancelBtn.addEventListener('click', closeDeleteModal);
    }
    
    if (deleteConfirmBtn) {
        deleteConfirmBtn.addEventListener('click', confirmDelete);
    }
    
    // Close modals when clicking backdrop
    if (editBackdrop) {
        editBackdrop.addEventListener('click', closeEditModal);
    }
    
    if (deleteBackdrop) {
        deleteBackdrop.addEventListener('click', closeDeleteModal);
    }
});
