const btnEdit = document.getElementById('btn-edit-profile');
const headerBtns = document.getElementById('header-btns');
const accountReadonly = document.getElementById('account-readonly');
const accountEdit = document.getElementById('account-edit');
let editing = false;

function toggleEdit() {
    editing = !editing;

    if (editing) {
        accountReadonly.style.display = 'none';
        accountEdit.style.display = 'block';
        headerBtns.innerHTML = `
            <button class="btn-save" onclick="saveProfile()">Save</button>
            <button class="btn-danger" style="padding: 8px 20px; border-radius: 10px; font-size: 13px;" onclick="discardEdit()">Discard</button>
        `;
    } else {
        discardEdit();
    }
}

function discardEdit() {
    editing = false;
    accountReadonly.style.display = 'block';
    accountEdit.style.display = 'none';
    headerBtns.innerHTML = `<button class="btn-save" id="btn-edit-profile" onclick="toggleEdit()">Edit Profile</button>`;
}

function saveProfile() {
    const username = document.getElementById('input-username').value.trim();
    const email = document.getElementById('input-email').value.trim();

    if (!username || !email) {
        alert('Username and email cannot be empty.');
        return;
    }

    // username: 3-50 chars, letters, numbers, underscores only
    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
        alert('Username must be 3-50 characters and can only contain letters, numbers, and underscores.');
        return;
    }

    // basic email format check
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    fetch('/api/profile/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, email })
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            document.getElementById('display-username').textContent = username;
            document.getElementById('display-email').textContent = email;
            document.getElementById('profile-username').textContent = username;
            document.getElementById('profile-email').textContent = email;
            document.getElementById('profile-avatar').textContent = (username[0] || 'U').toUpperCase();
            discardEdit();
        } else {
            alert(data.error || 'Failed to update profile');
        }
    })
    .catch(() => alert('Network error. Please try again.'));
}

// document.getElementById('del').addEventListener('click', function() {
//     window.location.href = "{{ url_for('main.register') }}";
// });

document.getElementById('del').addEventListener('click', function() {
    window.location.href = this.dataset.url;
});

document.getElementById('change_password').addEventListener('click', function() {
    window.location.href = this.dataset.url;
});

document.getElementById('change_password_edit').addEventListener('click', function() {
    window.location.href = this.dataset.url;
});