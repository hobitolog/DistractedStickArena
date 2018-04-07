window.onload = function (){

// create a wrapper around native canvas element (with id="c")
var canvas = new fabric.Canvas('c');

fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

fabric.loadSVGFromURL('../svg/Circus.svg', function(objects, options) {
    var obj = fabric.util.groupSVGElements(objects, options);
    obj.scale(1.75);
    obj.set({left: 344, top: 100});
canvas.add(obj);
})

fabric.loadSVGFromURL('../svg/Inn.svg', function(objects, options) {
    var obj = fabric.util.groupSVGElements(objects, options);
    obj.scale(1.75);
    obj.set({left: 192, top: 224});
canvas.add(obj);
})

fabric.loadSVGFromURL('../svg/Blacksmith.svg', function(objects, options) {
    var obj = fabric.util.groupSVGElements(objects, options);
    obj.scale(1.75);
    obj.set({left: 128, top: 374});
canvas.add(obj);
})

fabric.loadSVGFromURL('../svg/Statue.svg', function(objects, options) {
    var obj = fabric.util.groupSVGElements(objects, options);
    obj.scale(3);
    obj.set({left: 512, top: 256});
canvas.add(obj);
})

}