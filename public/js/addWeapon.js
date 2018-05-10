var valueOk = false;
window.onload = function () {

    var name = document.getElementById('name');
    var type = document.getElementById('type');
    type.addEventListener('change', checkType)
    var armor = document.getElementById('armor');
    var damage = document.getElementById('damage');
    var level = document.getElementById('level');
    var value = document.getElementById('value');
    value.addEventListener('keyup', checkValue)
    value.addEventListener('paste', checkValue)
    var button = document.getElementById('addButton');
    button.disabled = true;
    damage.hidden = true

}

function checkType() {
    var type = document.getElementById('type');
    var armor = document.getElementById('armor');
    var damage = document.getElementById('damage');
    if (type.value == 'weapon') {
        damage.hidden = false
        armor.hidden = true       
    }
    else {
        damage.hidden = true
        armor.hidden = false
    }
}

function checkValue() {
    var value = document.getElementById('value');
    if (!isNaN(value.value) && value.value != "" && value.value != " ") {
        valueOk = true;
        document.getElementById('valueError').hidden = true
    }
    else {
        valueOk = false;
        document.getElementById('valueError').hidden = false

    }
    refreshButton()
}
function refreshButton() {
    var button = document.getElementById('addButton')

    if (valueOk) {
        button.disabled = false
    }
    else
        button.disabled = true
}
