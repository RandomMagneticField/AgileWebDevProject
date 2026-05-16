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
    const pfpInput = document.getElementById('input-pfp');

    if (!username || !email) {
        alert('Username and email cannot be empty.');
        return;
    }

    if (!/^[a-zA-Z0-9_]{3,50}$/.test(username)) {
        alert('Username must be 3-50 characters and can only contain letters, numbers, and underscores.');
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        alert('Please enter a valid email address.');
        return;
    }

    const formData = new FormData();
    formData.append('username', username);
    formData.append('email', email);

    if (pfpInput.files[0]) {
        formData.append('pfp', pfpInput.files[0]);
    }

    fetch('/api/profile/update', {
        method: 'POST',
        body: formData
    })
    .then(res => {
        if (res.status === 413) {
            throw new Error('Profile picture must be smaller than 2 MB.');
        }

        return res.json();
    })
    .then(data => {
        if (data.success) {
            document.getElementById('display-username').textContent = username;
            document.getElementById('display-email').textContent = email;
            document.getElementById('profile-username').textContent = username;
            document.getElementById('profile-email').textContent = email;

            const avatar = document.getElementById('profile-avatar');
            if (data.pfp_url) {
                avatar.innerHTML = `<img src="${data.pfp_url}?v=${Date.now()}" alt="Profile picture">`;
            } else {
                avatar.textContent = (username[0] || 'U').toUpperCase();
            }

            discardEdit();
        } else {
            alert(data.error || 'Failed to update profile');
        }
    })
    .catch(error => {
        alert(error.message || 'Network error. Please try again.');
    });
}

// document.getElementById('del').addEventListener('click', function() {
//     window.location.href = "{{ url_for('main.register') }}";
// });

//dark and light mode switch
const lightordark = document.getElementById('dark-toggle');
//change toggle based on previous selection or default
document.addEventListener('DOMContentLoaded', async () => {
    const response = await fetch('/api/profile/darkmode');
    const data = await response.json();
    const previousMode = data.darkmode;
    lightordark.checked = previousMode;
    document.documentElement.setAttribute('data-theme', previousMode ? 'dark' : 'light')
})

//change mode based on toggle
lightordark.addEventListener('change', () => {
    if (lightordark.checked) {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
    fetch('/api/profile/darkmode', {
        method:'POST',
        headers:{'Content-Type': 'application/json'},
        body: JSON.stringify({darkmode: lightordark.checked})
    })
});

// document.getElementById('del').addEventListener('click', function() {
//     window.location.href = this.dataset.url;
// });

document.getElementById('change_password').addEventListener('click', function() {
    window.location.href = this.dataset.url;
});

document.getElementById('change_password_edit').addEventListener('click', function() {
    window.location.href = this.dataset.url;
});

document.getElementById('del').addEventListener('click', function() {
    if (!confirm('Are you sure you want to delete your account? This cannot be undone.')) return;
    fetch('/api/delete_account', {
        method: 'DELETE'
    })
    .then(res => res.json())
    .then(data => {
        if (data.success) {
            window.location.href = this.dataset.url;
        } else {
            alert(data.error || 'Failed to delete account');
        }
    })
});

const pfpInput = document.getElementById('input-pfp');
const pfpButton = document.getElementById('btn-pfp');
const pfpFileName = document.getElementById('profile-file-name');

if (pfpInput && pfpButton && pfpFileName) {
    pfpButton.addEventListener('click', () => {
        pfpInput.click();
    });

    pfpInput.addEventListener('change', () => {
        pfpFileName.textContent = pfpInput.files[0]
            ? pfpInput.files[0].name
            : 'No image selected';
    });
}