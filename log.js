// utility log functions
module.exports = {

    info: function(message) {
        console.log('\x1b[37m[INFO] \x1b[0m', message)
    },

    warning: function(message) {
        console.log('\x1b[1;33m[WARN] \x1b[0m', message)
    },

    error: function(message) {
        console.log('\x1b[1;31m[ERROR] \x1b[0m', message) 
    }
}

