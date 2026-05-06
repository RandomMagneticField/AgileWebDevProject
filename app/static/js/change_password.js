const change = document.getElementById("change_pass")
const old = document.getElementById("old_pass")
const new_pass = document.getElementById("new_pass")
const conf = document.getElementById("conf_new_pass")
const profileUrl = document.getElementById('page-data').dataset.profileUrl;

function showError(msg) {
    const err = document.getElementById('error-msg');
    err.textContent = msg;
    err.style.display = 'block';
}

function clearError() {
    const err = document.getElementById('error-msg');
    err.style.display = 'none';
}

change.addEventListener("click", function(){
    clearError();
    if(old.value === "" || new_pass.value === "" || conf.value === ""){
        showError("Please fill all fields")
    } else {
        if(new_pass.value === conf.value){
            fetch('/api/change_password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ current_password: old.value, new_password: new_pass.value })
            })
            .then(res => res.json())
            .then(data => {
                if(data.success){
                    window.location.href = profileUrl
                } else {
                    showError(data.error || "Failed to change password")
                    old.value = ""
                    old.focus()
                }
            })
        } else {
            showError("Passwords don't match")
            conf.value = ""
            conf.focus()
        }
    }
})

document.getElementById("back").addEventListener('click', function(){
    window.location.href = profileUrl
})

const inputs = [old, new_pass, conf]
inputs.forEach(function(input, index){
    input.addEventListener('keydown', function(event){
        if(event.key === 'Enter'){
            if(index < inputs.length - 1){
                inputs[index + 1].focus()
            } else {
                change.click()
            }
        }
    })
})