// utility log functions
module.exports = {

    info: function (...messages) {
        messages.unshift('\x1b[37m[INFO]')
        messages.push('\x1b[0m')
        console.log(...messages)
    },

    warning: function (...messages) {
        messages.unshift('\x1b[1;33m[WARN]')
        messages.push('\x1b[0m')
        console.log(...messages)
    },

    error: function (...messages) {
        messages.unshift('\x1b[1;31m[ERROR]')
        messages.push('\x1b[0m')
        console.log(...messages)
    }
}

