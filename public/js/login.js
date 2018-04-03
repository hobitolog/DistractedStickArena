var emailOk = false
var loginOk = false
var passwordsOk = false
var termsOk = false

window.onload = function(e){

    var registerButton = document.getElementById('registerButton')
    registerButton.addEventListener('click', function(){
        register()
    })    
    
    var registerEmail = document.getElementById('registerEmail')
    registerEmail.addEventListener('keyup', callCheckEmail)
    registerEmail.addEventListener('paste', callCheckEmail)
    
    var registerLogin = document.getElementById('registerLogin')
    registerLogin.addEventListener('keyup', callCheckLogin)
    registerLogin.addEventListener('paste', callCheckLogin)

    var registerPassword = document.getElementById('registerPassword')
    var repeatPassword = document.getElementById('repeatPassword')
    
    registerPassword.addEventListener('keyup', callCheckPasswords)
    registerPassword.addEventListener('paste', callCheckPasswords)

    repeatPassword.addEventListener('keyup', callCheckPasswords)
    repeatPassword.addEventListener('paste', callCheckPasswords)

    var registerTerms = document.getElementById('registerTerms')
    registerTerms.addEventListener('change', function(){
        checkTerms()
    })

    checkEmail()
    checkLogin()
    checkPasswords()
    checkTerms()
    
    console.log("Init completed")
}

function callCheckEmail() {
    setTimeout(checkEmail, 0)
}

function checkEmail()
{
    var registerEmail = document.getElementById('registerEmail')
    if(registerEmail.value)
        emailOk = true
    else
        emailOk = false
    refreshRegisterButton()
}

function callCheckLogin() {
    setTimeout(checkLogin, 0)
}

function checkLogin()
{
    var registerLogin = document.getElementById('registerLogin')
    if(registerLogin.value)
        loginOk = true
    else
        loginOk = false
    refreshRegisterButton()
}

function checkTerms()
{
    termsOk = registerTerms.checked

    var termsError = document.getElementById('termsError')
    if(termsOk)
        termsError.hidden = true
    else
        termsError.hidden = false
        
    refreshRegisterButton()
}

function callCheckPasswords() {
    setTimeout(checkPasswords, 0)
}

function checkPasswords()
{
    var passwordError = document.getElementById('passwordError')
    var repeatError = document.getElementById('repeatError')

    passwordError.hidden = true
    repeatError.hidden = true

    var registerPassword = document.getElementById('registerPassword')
    var repeatPassword = document.getElementById('repeatPassword')
 
    var registerButton = document.getElementById('registerButton')
    
    if(registerPassword.value.length < 8)
    {
        passwordError.hidden = false
        passwordsOk = false
        refreshRegisterButton()
        return
    }
    
    if(registerPassword.value != repeatPassword.value)
    {
        repeatError.hidden = false
        passwordsOk = false
        refreshRegisterButton()
        return
    }
    
    passwordsOk = true
    refreshRegisterButton()
}

function refreshRegisterButton()
{
    var registerButton = document.getElementById('registerButton')

    if(emailOk && loginOk && passwordsOk && termsOk) {
        registerButton.disabled = false
    }
    else
        registerButton.disabled = true
}

function register()
{
    document.getElementById('registerForm').submit()
}
