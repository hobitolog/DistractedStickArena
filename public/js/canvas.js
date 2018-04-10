window.onload = function () {

    // create a wrapper around native canvas element (with id="c")
    var canvas = new fabric.Canvas('c');

    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

    fabric.loadSVGFromURL('../svg/Background.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ left: 360, top: 243 })
        obj.selectable = false;
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/Circus.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1.75);
        obj.set({ left: 344, top: 100 });
        obj.selectable = false;
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/Inn.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1.75);
        obj.set({ left: 192, top: 224 });
        obj.selectable = false;
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/Blacksmith.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1.75);
        obj.set({ left: 128, top: 374 });
        obj.selectable = false;
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/Statue.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(2);
        obj.set({ left: 532, top: 276 });
        obj.selectable = false;
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/Stickman.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(2);
        obj.set({ left: 350, top: 400 });
        obj.selectable = false;
        canvas.add(obj);
    })

}