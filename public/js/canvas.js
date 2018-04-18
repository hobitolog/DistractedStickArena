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
    var Gstats = {
        httpSucc: false,
        stats: {
            free: 0,
            str: 0,
            att: 0,
            agi: 0,
            vit: 0,
            sta: 0
        },
    };



    // function reqStat(callback) {        
    //         var xmlhttp = new XMLHttpRequest();
    //         xmlhttp.open("GET", "/getCharacter", true);
    //         xmlhttp.setRequestHeader("Content-Type", "application/json");
    //         xmlhttp.responseType = "json";
    //         xmlhttp.onreadystatechange = function () {
    //             if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    //                 Gstats = xmlhttp.response;
    //                 Gstats.httpSucc = true;                   
    //             }
    //         };
    //         xmlhttp.send();
    //         callback();
    // }

    function reqStat() {
        return new Promise(function (resolve, reject) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "/getCharacter", true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.responseType = "json";
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    Gstats = xmlhttp.response;
                    Gstats.httpSucc = true;
                    resolve();
                }
            };
            xmlhttp.send();
        });
    }

    function updateStat(param, amount) {
        return new Promise(function (resolve, reject) {
        var stats = {
            "stat": param,
            "amount": amount
        }
        var json = JSON.stringify(stats)
        var xmlhttp = new XMLHttpRequest()
        xmlhttp.open("POST", "/spendPoints", true)
        xmlhttp.setRequestHeader("Content-Type", "application/json")
        xmlhttp.responseType = "json"
        xmlhttp.onreadystatechange = function () {
            if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                if (xmlhttp.response.error) {
                        alert(xmlhttp.response.error);//blad formatu parametrow                   
                }
                else
                {
                    console.log('wywolanie');

                    resolve();
                }
            }
        }
        xmlhttp.send(json)
    });
    }
    function refreshStat()
    {
        console.log("wywolanie 2");
        removeStats();
        reqStat().then(loadStats);
    }



    var canvas = new fabric.Canvas('c', {
        hoverCursor: 'context-menu',
        selection: false,
        perPixelTargetFind: true,
        targetFindTolerance: 5,
    });
    ///init
    //reqStat();
    loadBG('inArena');
    loadBG('inTavern');
    loadBG('inBlacksmith');
    loadBG('inStatue');
    loadBG('inStickman');

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
        if (e.target != null && e.target.scalable == true) {
            e.target.scale(1.75);
            canvas.renderAll();
        }
    });
    canvas.on('mouse:down', function (e) {
        switch (e.target.name) {
            case 'arena':
                loadInArena();
                canvas.getItemByName('inArena').opacity = 1;
                canvas.bringToFront(canvas.getItemByName('inArena'));
                canvas.bringToFront(canvas.getItemByName('findOpButton'));
                canvas.bringToFront(canvas.getItemByName('exit'));
                //open arena
                break;
            case 'tavern':
                canvas.getItemByName('inTavern').opacity = 1;
                canvas.bringToFront(canvas.getItemByName('inTavern'));
                canvas.bringToFront(canvas.getItemByName('exit'));

                //open tavern
                break;
            case 'blacksmith':
                canvas.getItemByName('inBlacksmith').opacity = 1;
                canvas.bringToFront(canvas.getItemByName('inBlacksmith'));
                canvas.bringToFront(canvas.getItemByName('exit'));

                //open blacksmith
                break;
            case 'statue':
                canvas.getItemByName('inStatue').opacity = 1;
                canvas.bringToFront(canvas.getItemByName('inStatue'));
                canvas.bringToFront(canvas.getItemByName('exit'));
                console.log(Gstats);

                //open statue
                break;
            case 'stickman':
                canvas.getItemByName('inStickman').opacity = 1;
                canvas.bringToFront(canvas.getItemByName('inStickman'));
                reqStat().then(loadStats);
                // reqStat(loadStats);
                console.log(Gstats);
                //open stickman
                break;
            case 'addStr':
                updateStat("str", 1).then(refreshStat);
                break;
            case 'addAtt':
                updateStat("att", 1).then(refreshStat);
                break;
            case 'addAgi':
                updateStat("agi", 1).then(refreshStat);
                break;
            case 'addSta':
                updateStat("sta", 1).then(refreshStat);
                break;
            case 'addVit':
                updateStat("vit", 1).then(refreshStat);
                break;
            case 'findOpButton':
                window.open("https://media1.tenor.com/images/0e5b20868a069ab6ee46a5552154d021/tenor.gif?itemid=6103287", "_self")
                break;
            case 'exit':
                closeButton();
                break;
            case 'bg':
                closeButton();
                break;

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






    fabric.loadSVGFromURL('../svg/exit.svg', function (objects, options) {
        var obj = fabric.util.groupSVGElements(objects, options);
        obj.scale(0.2);
        obj.set({ left: canvas.width / 2 + 220, top: canvas.height / 2 - 120 });
        obj.selectable = false;
        obj.scalable = false;
        obj.name = 'exit';
        canvas.add(obj);
        canvas.sendToBack(obj);
    })


    function loadBG(BGname) {
        if (!canvas.getItemByName(BGname)) {
            fabric.loadSVGFromURL('../svg/' + BGname + '.svg', function (objects, options) {
                var obj = fabric.util.groupSVGElements(objects, options);
                obj.scale(1);
                obj.set({ left: canvas.width / 2, top: canvas.height / 2 });
                obj.selectable = false;
                obj.scalable = false;
                obj.name = BGname;
                obj.opacity = 0;
                canvas.add(obj);
                canvas.sendToBack(obj);
            });
        }

    };
    function loadInArena() {
        if (!canvas.getItemByName('findOpButton')) {
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
                    opacity: 1,
                    selectable: false

                });
            canvas.add(findOpButton);
            canvas.sendToBack(findOpButton);
        }

    };


    function loadStats() {
        if (!canvas.getItemByName('statsText') && Gstats.httpSucc == true) {
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
                    left: canvas.width / 2 - 60,
                    top: 220,
                    opacity: 1,
                    selectable: false

                });
            canvas.add(statsPoints);
            if (Gstats.stats.free != 0) {
                fabric.loadSVGFromURL('../svg/plus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(0.35);
                    obj.set({ left: canvas.width / 2 - 38, top: 138 });
                    obj.selectable = false;
                    obj.scalable = false;
                    obj.name = 'addStr';
                    canvas.add(obj);
                });
                fabric.loadSVGFromURL('../svg/plus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(0.35);
                    obj.set({ left: canvas.width / 2 - 38, top: 168 });
                    obj.selectable = false;
                    obj.scalable = false;
                    obj.name = 'addAtt';
                    canvas.add(obj);
                });
                fabric.loadSVGFromURL('../svg/plus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(0.35);
                    obj.set({ left: canvas.width / 2 - 38, top: 198 });
                    obj.selectable = false;
                    obj.scalable = false;
                    obj.name = 'addAgi';
                    canvas.add(obj);
                });
                fabric.loadSVGFromURL('../svg/plus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(0.35);
                    obj.set({ left: canvas.width / 2 - 38, top: 228 });
                    obj.selectable = false;
                    obj.scalable = false;
                    obj.name = 'addSta';
                    canvas.add(obj);
                });
                fabric.loadSVGFromURL('../svg/plus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(0.35);
                    obj.set({ left: canvas.width / 2 - 38, top: 258 });
                    obj.selectable = false;
                    obj.scalable = false;
                    obj.name = 'addVit';
                    canvas.add(obj);
                });


            }
            Gstats.httpSucc = false;
        }
        else {
            //    setInterval(reqStat().then(loadStats()), 2000);
        }
        canvas.bringToFront(canvas.getItemByName('statsText'));
        canvas.bringToFront(canvas.getItemByName('statsPoints'));
        canvas.bringToFront(canvas.getItemByName('addStr'));
        canvas.bringToFront(canvas.getItemByName('addAtt'));
        canvas.bringToFront(canvas.getItemByName('addAgi'));
        canvas.bringToFront(canvas.getItemByName('addSta'));
        canvas.bringToFront(canvas.getItemByName('addVit'));
        canvas.bringToFront(canvas.getItemByName('exit'));

    }
    function closeButton() {
        canvas.sendToBack(canvas.getItemByName('inArena'));
        canvas.sendToBack(canvas.getItemByName('inTavern'));
        canvas.sendToBack(canvas.getItemByName('inBlacksmith'));
        canvas.sendToBack(canvas.getItemByName('inStatue'));
        canvas.sendToBack(canvas.getItemByName('inStickman'));
        canvas.sendToBack(canvas.getItemByName('findOpButton'));
        canvas.sendToBack(canvas.getItemByName('exit'));
        canvas.remove(canvas.getItemByName('findOpButton'));
        removeStats();

    }
    function removeStats() {
        canvas.remove(canvas.getItemByName('statsPoints'));
        canvas.remove(canvas.getItemByName('statsText'));
        canvas.remove(canvas.getItemByName('addStr'));
        canvas.remove(canvas.getItemByName('addAtt'));
        canvas.remove(canvas.getItemByName('addAgi'));
        canvas.remove(canvas.getItemByName('addSta'));
        canvas.remove(canvas.getItemByName('addVit'));

    }


}