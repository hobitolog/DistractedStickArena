window.onload = function () {
    fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
    fabric.Object.prototype.objectCaching = true;

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
    fabric.Canvas.prototype.setObjOpacity = function (name, value) {
        var objects = this.getObjects();
        for (var i = 0, len = this.size(); i < len; i++) {
            if (objects[i].name && objects[i].name === name) {
                objects[i].opacity = value;
                break;
            }
        }
    };
    var Gstats= {
        stats: {
            free: 0,
            str: 0,
            att: 0,
            agi: 0,
            vit: 0,
            sta: 0
        },
    };
    function reqStat(){
        var xmlhttp = new XMLHttpRequest()
        xmlhttp.open("GET", "/getCharacter", true)
        xmlhttp.setRequestHeader("Content-Type", "application/json")
        xmlhttp.responseType = "json"
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                var odpowiedz = xmlhttp.response;
                console.log(odpowiedz.stats.free);
                Gstats = odpowiedz;                      
            }
        }
        xmlhttp.send()      

    }
    reqStat();

    var canvas = new fabric.Canvas('c', {
        hoverCursor: 'context-menu',
        selection: false,
        perPixelTargetFind: true,
        targetFindTolerance: 5,
    });


    canvas.on('mouse:over', function (e) {
        if (e.target != null) {
            console.log(e.target.name + " left: " + e.target.left + " top: " + e.target.top);
            if (e.target.scalable == true) {
                e.target.scale(2);
                canvas.renderAll();

            }
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
                canvas.bringToFront(canvas.getItemByName('findOpButton'));
                canvas.setObjOpacity('findOpButton', 1);
                canvas.bringToFront(canvas.getItemByName('exit'));
                //open arena
                break;
            case 'tavern':
                canvas.bringToFront(canvas.getItemByName('inTavern'));
                canvas.bringToFront(canvas.getItemByName('exit'));
                
                //open tavern
                break;
            case 'blacksmith':
                canvas.bringToFront(canvas.getItemByName('inBlacksmith'));
                canvas.bringToFront(canvas.getItemByName('exit'));

                //open blacksmith
                break;
            case 'statue':
                canvas.bringToFront(canvas.getItemByName('inStatue'));
                canvas.bringToFront(canvas.getItemByName('exit'));

                //open statue
                break;
            case 'stickman':
                canvas.bringToFront(canvas.getItemByName('inStickman'));
                loadStats();               
                canvas.bringToFront(canvas.getItemByName('statsText'));
                canvas.bringToFront(canvas.getItemByName('statsPoints'));
                canvas.bringToFront(canvas.getItemByName('exit'));

                //open stickman
                break;
            case 'exit':
                canvas.sendToBack(canvas.getItemByName('inArena'));
                canvas.sendToBack(canvas.getItemByName('inTavern'));
                canvas.sendToBack(canvas.getItemByName('inBlacksmith'));
                canvas.sendToBack(canvas.getItemByName('inStatue'));
                canvas.sendToBack(canvas.getItemByName('inStickman'));
                canvas.sendToBack(canvas.getItemByName('findOpButton'));
                canvas.sendToBack(canvas.getItemByName('exit'));
                canvas.setObjOpacity('findOpButton', 0);
                canvas.remove(canvas.getItemByName('statsPoints'));
                canvas.remove(canvas.getItemByName('statsText'));

                break;
            case 'findOpButton':
                window.open("https://media1.tenor.com/images/0e5b20868a069ab6ee46a5552154d021/tenor.gif?itemid=6103287", "_self")
                break;
            case 'bg':
                canvas.sendToBack(canvas.getItemByName('inArena'));
                canvas.sendToBack(canvas.getItemByName('inTavern'));
                canvas.sendToBack(canvas.getItemByName('inBlacksmith'));
                canvas.sendToBack(canvas.getItemByName('inStatue'));
                canvas.sendToBack(canvas.getItemByName('inStickman'));
                canvas.sendToBack(canvas.getItemByName('findOpButton'));
                canvas.sendToBack(canvas.getItemByName('exit'));
                canvas.setObjOpacity('findOpButton', 0);
                canvas.remove(canvas.getItemByName('statsPoints'));
                canvas.remove(canvas.getItemByName('statsText'));


        }
        canvas.renderAll();

    });



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
        obj.set({ left: canvas.width / 2, top: canvas.height / 2 });
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
    fabric.loadSVGFromURL('../svg/exit.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(0.2);
        obj.set({ left: canvas.width/2 +220, top: canvas.height/2 -120 });
        obj.selectable = false;
        obj.scalable = false;
        obj.name = 'exit';
        canvas.add(obj);
        canvas.sendToBack(obj);
    })

    var findOpButton = new fabric.Group([new fabric.Rect({
        width: 200,
        height: 80,
        fill: '#ccc',
        name: 'inArenaButtonBG',
        selectable: false
    }),
    new fabric.Text('Znajdź przeciwnika', {
        // left: 200,
        // top: 100,
        fill: '#000',
        name: 'inArenaButtonText',
        fontSize: 18
    })], {
            name: 'findOpButton',
            left: canvas.width / 2,
            top: 320,
            opacity: 0,
            selectable: false

        });
    canvas.add(findOpButton);
    canvas.sendToBack(findOpButton);

function loadStats()
{
    if(!canvas.getItemByName('statsText'))
    {
    reqStat();
    var statsText = new fabric.Group([
    new fabric.Text('Siła:', {
        // left: 200,
        top: 0,
        fill: '#fff',
        fontSize: 20,
        fontFamily: 'Comic Sans',
        textAlign: 'right',
        originX: 'right'
    }),
    new fabric.Text('Celność:', {
        // left: 200,
         top: 30,
        fill: '#fff',
        fontSize: 20,
        fontFamily: 'Comic Sans',
        textAlign: 'right',
        originX: 'right'
    }),
    new fabric.Text('Zręczność:', {
        // left: 200,
        top: 60,
        fill: '#fff',
        fontSize: 20,
        fontFamily: 'Comic Sans',
        textAlign: 'right',
        originX: 'right'
    }),
    new fabric.Text('Wytrzymałość:', {
        // left: 200,
        top: 90,
        fill: '#fff',
        fontSize: 20,
        fontFamily: 'Comic Sans',
        textAlign: 'right',
        originX: 'right'
    }),
    new fabric.Text('Witalność:', {
        // left: 200,
        top: 120,
        fill: '#fff',
        fontSize: 20,
        fontFamily: 'Comic Sans',
        textAlign: 'right',
        originX: 'right'
    }),
    new fabric.Text('Punkty rozwoju:', {
        // left: 200,
        top: 160,
        fill: '#fff',
        fontSize: 24,
        fontFamily: 'Comic Sans',
        textAlign: 'right',
        originX: 'right'
    })], {
            name: 'statsText',
            left: canvas.width / 2 - 160,
            top: 220,
            opacity: 1,
            selectable: false

        });
    canvas.add(statsText);
    canvas.sendToBack(statsText);

    var statsPoints = new fabric.Group([
        new fabric.Text(String(Gstats.stats.str), {
            // left: 200,
            top: 0,
            fill: '#fff',
            fontSize: 20,
            fontFamily: 'Comic Sans',
            textAlign: 'right',
            originX: 'right'
        }),
        new fabric.Text(String(Gstats.stats.att), {
            // left: 200,
             top: 30,
            fill: '#fff',
            fontSize: 20,
            fontFamily: 'Comic Sans',
            textAlign: 'right',
            originX: 'right'
        }),
        new fabric.Text(String(Gstats.stats.agi), {
            // left: 200,
            top: 60,
            fill: '#fff',
            fontSize: 20,
            fontFamily: 'Comic Sans',
            textAlign: 'right',
            originX: 'right'
        }),
        new fabric.Text(String(Gstats.stats.sta), {
            // left: 200,
            top: 90,
            fill: '#fff',
            fontSize: 20,
            fontFamily: 'Comic Sans',
            textAlign: 'right',
            originX: 'right'
        }),
        new fabric.Text(String(Gstats.stats.vit), {
            // left: 200,
            top: 120,
            fill: '#fff',
            fontSize: 20,
            fontFamily: 'Comic Sans',
            textAlign: 'right',
            originX: 'right'
        }),
        new fabric.Text(String(Gstats.stats.free), {
            // left: 200,
            top: 160,
            fill: '#fff',
            fontSize: 24,
            fontFamily: 'Comic Sans',
            textAlign: 'right',
            originX: 'right'
        })], {
                name: 'statsPoints',
                left: canvas.width / 2 - 70,
                top: 220,
                opacity: 1,
                selectable: false
    
            });
        canvas.add(statsPoints);
        canvas.sendToBack(statsPoints);
        }
        }

}