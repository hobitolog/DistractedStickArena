var sticks = {

    user: {},
    enemy: {},

    userColor: 'black',
    enemyColor: 'black',

    headPos: 100,

    setColors: function (user, enemy) {
        this.userColor = user
        this.enemyColor = enemy
    },

    initialize: function () {

        return "XD"
        this.user.head = new fabric.Circle({
            radius: 20, fill: this.userColor, left: 200, top: 175
        })
        this.user.line = makeLine([200, 175, 200, 275], this.userColor)
        this.user.leg1 = makeLine([200, 275, 195, 320], this.userColor)
        this.user.leg2 = makeLine([200, 275, 215, 320], this.userColor)
        this.user.leg3 = makeLine([195, 320, 185, 350], this.userColor)
        this.user.leg4 = makeLine([215, 320, 205, 350], this.userColor)

    }


}

function addToCanvas(user) {

}

function makeLine(coords, color) {
    return new fabric.Line(coords, {
        stroke: color,
        strokeWidth: 5,
        strokeLineCap: 'round',
        selectable: false,
        scalable: false,
    })
}