window.onload = function () {

    fabric.Canvas.prototype.getItemByName = function (name) {
        var object = null,
            objects = this.getObjects();

        for (var i = 0, len = this.size(); i < len; i++) {
            if (objects[i].name && objects[i].name === name) {
                object = objects[i];
                break;
            }
        }

        return object;
    };



    var canvas = new fabric.Canvas('c', {
        hoverCursor: 'pointer',
        selection: false,
        perPixelTargetFind: true,
        targetFindTolerance: 5,
    });


    canvas.on('mouse:over', function (e) {
        if (e.target.scalable == true) {
            e.target.scale(2);
            canvas.renderAll();
        }
    });
    canvas.on('mouse:out', function (e) {
        if (e.target.scalable == true) {
            e.target.scale(1.75);
            canvas.renderAll();
        }
    });
    canvas.on('mouse:down', function (e) {
        switch (e.target.name) {
            case 'arena':
                canvas.bringToFront(canvas.getItemByName('inArena'));
                //open arena
                break;
            case 'tavern':
                canvas.bringToFront(canvas.getItemByName('inTavern'));
                //open tavern
                break;
            case 'blacksmith':
                canvas.bringToFront(canvas.getItemByName('inBlacksmith'));
                //open blacksmith
                break;
            case 'statue':
                canvas.bringToFront(canvas.getItemByName('inStatue'));  
                //open statue
                break;
            case 'stickman':
                canvas.bringToFront(canvas.getItemByName('inStickman'));  
                //open stickman
                break;
            default:
                canvas.sendToBack(canvas.getItemByName('inArena'));
                canvas.sendToBack(canvas.getItemByName('inTavern'));
                canvas.sendToBack(canvas.getItemByName('inBlacksmith'));
                canvas.sendToBack(canvas.getItemByName('inStatue'));
                canvas.sendToBack(canvas.getItemByName('inStickman'));
        }
        canvas.renderAll();

    });


    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';

    fabric.loadSVGFromURL('../svg/Background.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.set({ left: 360, top: 243 })
        obj.selectable = false;
        obj.scalable = false;
        obj.name = 'bg';
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/Circus.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1.75);
        obj.set({ left: 344, top: 100 });
        obj.selectable = false;
        obj.scalable = true;
        obj.name = 'arena';
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/Inn.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1.75);
        obj.set({ left: 192, top: 224 });
        obj.selectable = false;
        obj.scalable = true;
        obj.name = 'tavern';
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/Blacksmith.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1.75);
        obj.set({ left: 128, top: 374 });
        obj.selectable = false;
        obj.scalable = true;
        obj.name = 'blacksmith';
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/Statue.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1.75);
        obj.set({ left: 532, top: 276 });
        obj.selectable = false;
        obj.scalable = true;
        obj.name = 'statue';
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/Stickman.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1.75);
        obj.set({ left: 350, top: 400 });
        obj.selectable = false;
        obj.scalable = true;
        obj.name = 'stickman';
        canvas.add(obj);
    })

    fabric.loadSVGFromURL('../svg/inArena.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1);
        obj.set({ left: 360, top: 243 });
        obj.selectable = false;
        obj.scalable = false;
        obj.name = 'inArena';
        canvas.add(obj);
        canvas.sendToBack(obj);
    })

    fabric.loadSVGFromURL('../svg/inTavern.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1);
        obj.set({ left: 360, top: 243 });
        obj.selectable = false;
        obj.scalable = false;
        obj.name = 'inTavern';
        canvas.add(obj);
        canvas.sendToBack(obj);
    })

    fabric.loadSVGFromURL('../svg/inBlacksmith.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1);
        obj.set({ left: 360, top: 243 });
        obj.selectable = false;
        obj.scalable = false;
        obj.name = 'inBlacksmith';
        canvas.add(obj);
        canvas.sendToBack(obj);
    })

    fabric.loadSVGFromURL('../svg/inStatue.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1);
        obj.set({ left: 360, top: 243 });
        obj.selectable = false;
        obj.scalable = false;
        obj.name = 'inStatue';
        canvas.add(obj);
        canvas.sendToBack(obj);
    })

    fabric.loadSVGFromURL('../svg/inStickman.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(1);
        obj.set({ left: 360, top: 243 });
        obj.selectable = false;
        obj.scalable = false;
        obj.name = 'inStickman';
        canvas.add(obj);
        canvas.sendToBack(obj);
    })




}