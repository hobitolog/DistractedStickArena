var valueOk = false;
window.onload = function () {

    var name = document.getElementById('name');
    var type = document.getElementById('type');
    type.addEventListener('change', callCheckType)
    var armor = document.getElementById('armor');
    var damageMin = document.getElementById('damageMin');
    var damageMax = document.getElementById('damageMax');
    var level = document.getElementById('level');
    var value = document.getElementById('value');
    value.addEventListener('keyup', callCheckValue)
    value.addEventListener('paste', callCheckValue)
    var button = document.getElementById('addButton');
    button.disabled = true;
    damageMin.disabled = true;
    damageMax.disabled = true;

    button.onclick = function () {
        var item = {
            baseId: 100,//TODO getMaxId() + 1
            name: name.value,
            type: type.value,
            variants: {
                variantId: 0,
                armor: armor.value,
                damageMin: damageMin.value,
                damageMax: damageMax.value,
                level: level.value,
                value: value.value
            }
        }


        console.log(item)
        addItem(item);
    }



}
function addItem(input) { //TODO


}

function getMaxId()//TODO
{




    return 12
}

function callCheckType() {
    var type = document.getElementById('type');
    var armor = document.getElementById('armor');
    var damageMin = document.getElementById('damageMin');
    var damageMax = document.getElementById('damageMax');
    if (type.value == 'helmet') {
        damageMin.disabled = true;
        damageMax.disabled = true;
        armor.disabled = false;
    }
    else if (type.value == 'armor') {
        damageMin.disabled = true;
        damageMax.disabled = true;
        armor.disabled = false;
    }
    else if (type.value == 'weapon') {
        damageMin.disabled = false;
        damageMax.disabled = false;
        armor.disabled = true;
    }

}


function callCheckValue() {
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
