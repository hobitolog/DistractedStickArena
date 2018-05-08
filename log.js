// utility log functions
module.exports = {

    info: function (...messages) {
        let msg = '\x1b[37m[INFO] '
        messages.forEach(element => {
            msg += element
            msg += " "
        })
        msg += '\x1b[0m'
        console.log(msg)
    },

    warning: function (...messages) {
        let msg = '\x1b[1;33m[WARN] '
        messages.forEach(element => {
            msg += element
            msg += " "
        })
        msg += '\x1b[0m'
        console.log(msg)
    },

    error: function (...messages) {
        let msg = '\x1b[1;31m[ERROR] '
        messages.forEach(element => {
            msg += element
            msg += " "
        })
        msg += '\x1b[0m'
        console.log(msg)
    }
}

