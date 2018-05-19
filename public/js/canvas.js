var canvas;
var inArenaButtonText = "Znajdź przeciwnika";
fabric.Object.prototype.originX = fabric.Object.prototype.originY = 'center';
fabric.Object.prototype.objectCaching = true;
fabric.Object.prototype.transparentCorners = false;


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


fabric.Canvas.prototype.getAbsoluteCoords = function (object) {
    return {
        left: object.left + this._offset.left,
        top: object.top + this._offset.top
    };
}

window.onload = function () {
    //TODO font change

    var Gstats = {
        stats: {
            free: 0,
            str: 0,
            att: 0,
            agi: 0,
            vit: 0,
            sta: 0
        },

    };

    var Geq = {
        equipment: {
            helmet: {
                itemId: 0,
                level: 1,
                type: "helmet",
                name: "BuzdyganArmorianu",
                image: "items/buzdygan.png",
                armor: 0,
                upgradePrice: 70,
                value: 50
            },
            armor: {
                itemId: 0,
                level: 1,
                type: "armor",
                name: "BuzdyganArmorianu",
                image: "items/buzdygan.png",
                armor: 0,
                upgradePrice: 70,
                value: 50
            },
            weapon: {
                itemId: 0,
                level: 1,
                type: "weapon",
                name: "Pięści",
                image: "",
                damageMin: 1,
                damageMax: 2,
                upgradePrice: 0,
                value: 0
            }
        }

    };

    var Gchar = {
        level: 1,
        exp: 0,
        gold: 0,
        ranking: 0,
        hp: 0,
        armor: 0,
        energy: 0
    };


    function reqStat() {
        return new Promise(function (resolve, reject) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "getStats", true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.responseType = "json";
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    Gstats.stats = xmlhttp.response;
                    Gchar.hp = 30 + 2 * Gstats.stats.vit;
                    Gchar.energy = Math.round(20 + 1.5 * Gstats.stats.sta);
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
            xmlhttp.open("POST", "spendPoints", true)
            xmlhttp.setRequestHeader("Content-Type", "application/json")
            xmlhttp.responseType = "json"
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    if (xmlhttp.response.error) {
                        alert(xmlhttp.response.error);
                    }
                    else {
                        resolve();
                    }
                }
            }
            xmlhttp.send(json)
        });
    }
    function refreshStat() {
        removeStats().then(reqStat).then(loadStats);
        //reqStat().then(loadStats);
    }


    function reqEq() {
        return new Promise(function (resolve, reject) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "getEquipment", true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.responseType = "json";
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    Geq.equipment = xmlhttp.response;
                    Gchar.armor = Geq.equipment.armor.armor + Geq.equipment.helmet.armor;
                    resolve();
                }
            };
            xmlhttp.send();
        });
    }
    // function updateEq(param, amount) {
    //     return new Promise(function (resolve, reject) {
    //         var equipent = {
    //          ??   "equipent": param,??
    //         ??    "amount": amount??
    //         }
    //         var json = JSON.stringify(stats)
    //         var xmlhttp = new XMLHttpRequest()
    //         xmlhttp.open("POST", ??"spendEquipment"??, true)
    //         xmlhttp.setRequestHeader("Content-Type", "application/json")
    //         xmlhttp.responseType = "json"
    //         xmlhttp.onreadystatechange = function () {
    //             if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
    //                 if (xmlhttp.response.error) {
    //                     alert(xmlhttp.response.error);
    //                 }
    //                 else {
    //                     resolve();
    //                 }
    //             }
    //         }
    //         xmlhttp.send(json)
    //     });
    // }
    // function refreshEq() {
    //     ??removeStats();??
    //     reqEq().then(??loadStats??);
    // }

    function reqCharacter() {
        return new Promise(function (resolve, reject) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "getCharacter", true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.responseType = "json";
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    Gchar.level = xmlhttp.response.level;
                    Gchar.exp = xmlhttp.response.exp;
                    Gchar.gold = xmlhttp.response.gold;
                    Gchar.ranking = xmlhttp.response.ranking;

                    resolve();
                }
            };
            xmlhttp.send();
        });
    }
    function refreshChar() {
        removeChar();
        reqCharacter().then(loadCharMain);
    }



    canvas = new fabric.Canvas('c', {
        hoverCursor: 'context-menu',
        selection: false,
        perPixelTargetFind: true,
        targetFindTolerance: 5,
        localization: 'town'
    });


    ///init
    var helmetDrop = document.getElementById('helmet');
    var armorDrop = document.getElementById('armor');
    var weaponDrop = document.getElementById('weapon');
    var buyDrop = document.getElementById('buy');
    var sellDrop = document.getElementById('sell');
    var arenaDrop = document.getElementById('arenaGold');


    loadBG('inArena');
    loadBG('inTavern');
    loadBG('inBlacksmith');
    loadBG('inStatue');
    loadBG('inStickman');
    reqCharacter().then(loadCharMain);
    loadElements();


    canvas.on('mouse:over', function (e) {
        if (e.target != null && canvas.localization == 'town') {
            if (e.target.scalable == true) {
                e.target.scale(2);
                canvas.renderAll();
            }
        }
    });
    canvas.on('mouse:out', function (e) {
        if (e.target != null && e.target.scalable == true && canvas.localization == 'town') {
            e.target.scale(1.75);
            canvas.renderAll();
        }
    });
    canvas.on('mouse:down', function (e) {
        if (e.target != null && canvas.localization == 'town') {
            switch (e.target.name) {
                case 'arena':
                    hideEqControls()
                    hideShopControls()
                    reqStat()
                    canvas.getItemByName('inArena').opacity = 1;
                    canvas.bringToFront(canvas.getItemByName('inArena'));
                    canvas.bringToFront(canvas.getItemByName('exit'));
                    refreshChar();
                    loadInArena();
                    //open arena
                    break;
                case 'tavern':
                    hideEqControls()
                    hideArenaControls()
                    refreshChar();
                    canvas.getItemByName('inTavern').opacity = 1;
                    canvas.bringToFront(canvas.getItemByName('inTavern'));
                    canvas.bringToFront(canvas.getItemByName('exit'));
                    loadInTavern();


                    //open tavern
                    break;
                case 'blacksmith':
                    hideEqControls()
                    hideShopControls()
                    hideArenaControls()
                    refreshChar();
                    canvas.getItemByName('inBlacksmith').opacity = 1;
                    canvas.bringToFront(canvas.getItemByName('inBlacksmith'));
                    canvas.bringToFront(canvas.getItemByName('exit'));
                    //open blacksmith
                    break;
                case 'statue':
                    hideEqControls()
                    hideShopControls()
                    hideArenaControls()
                    refreshChar();
                    canvas.getItemByName('inStatue').opacity = 1;
                    canvas.bringToFront(canvas.getItemByName('inStatue'));
                    canvas.bringToFront(canvas.getItemByName('exit'));
                    canvas.bringToFront(canvas.getItemByName('coinText'));

                    //open statue
                    break;
                case 'stickman':
                    hideShopControls()
                    hideArenaControls()
                    canvas.getItemByName('inStickman').opacity = 1;
                    canvas.bringToFront(canvas.getItemByName('inStickman'));
                    reqStat().then(loadStats);
                    loadEq();
                    reqCharacter().then(loadCharStickman);
                    refreshChar();
                    //TODO
                    reqEq()//.then
                    //reqBp().then
                    //open stickman
                    break;
                case 'addStr':
                    updateStat("str", 1).then(refreshStat);
                    refreshChar();
                    break;
                case 'addAtt':
                    updateStat("att", 1).then(refreshStat);
                    refreshChar();
                    break;
                case 'addAgi':
                    updateStat("agi", 1).then(refreshStat);
                    refreshChar();
                    break;
                case 'addSta':
                    updateStat("sta", 1).then(refreshStat);
                    refreshChar();
                    break;
                case 'addVit':
                    updateStat("vit", 1).then(refreshStat);
                    refreshChar();
                    break;
                case 'findOpButton':
                    socket.emit('findGame')
                    //TODO change button label
                    break;
                case 'tradeButton':
                    //TODO Finalize transaction by Pan Minta
                    break;
                case 'exit':
                    closeButton();
                    refreshChar();
                    break;
                case 'bg':
                    closeButton();
                    break;

            }
            canvas.renderAll();
        }
    });
    function loadElements() {
        fabric.loadSVGFromURL('svg/Background.svg', function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.set({ left: 360, top: 243 })
            obj.selectable = false;
            obj.scalable = false;
            obj.name = 'bg';
            obj.on('added', function () {
                fabric.loadSVGFromURL('svg/Circus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(1.75);
                    obj.set({ left: 344, top: 100 });
                    obj.selectable = false;
                    obj.scalable = true;
                    obj.name = 'arena';
                    obj.on('added', function () {
                        fabric.loadSVGFromURL('svg/Inn.svg', function (objects, options) {
                            var obj = fabric.util.groupSVGElements(objects, options);
                            obj.scale(1.75);
                            obj.set({ left: 192, top: 224 });
                            obj.selectable = false;
                            obj.scalable = true;
                            obj.name = 'tavern';
                            obj.on('added', function () {
                                fabric.loadSVGFromURL('svg/Blacksmith.svg', function (objects, options) {
                                    var obj = fabric.util.groupSVGElements(objects, options);
                                    obj.scale(1.75);
                                    obj.set({ left: 128, top: 374 });
                                    obj.selectable = false;
                                    obj.scalable = true;
                                    obj.name = 'blacksmith';
                                    canvas.add(obj);
                                });
                                fabric.loadSVGFromURL('svg/Statue.svg', function (objects, options) {
                                    var obj = fabric.util.groupSVGElements(objects, options);
                                    obj.scale(1.75);
                                    obj.set({ left: 532, top: 276 });
                                    obj.selectable = false;
                                    obj.scalable = true;
                                    obj.name = 'statue';
                                    canvas.add(obj);
                                });
                                fabric.loadSVGFromURL('svg/Stickman.svg', function (objects, options) {
                                    var obj = fabric.util.groupSVGElements(objects, options);
                                    obj.scale(1.75);
                                    obj.set({ left: 350, top: 400 });
                                    obj.selectable = false;
                                    obj.scalable = true;
                                    obj.name = 'stickman';
                                    canvas.add(obj);
                                });
                                fabric.loadSVGFromURL('svg/coin.svg', function (objects, options) {
                                    var obj = fabric.util.groupSVGElements(objects, options);
                                    obj.scale(0.08);
                                    obj.set({ left: canvas.width - 150, top: canvas.height - 30 })
                                    obj.selectable = false;
                                    obj.scalable = false;
                                    obj.name = 'coin';
                                    obj.on('after:render', canvas.bringToFront(canvas.getItemByName('coinText')));
                                    canvas.add(obj);
                                });
                                // fabric.loadSVGFromURL('svg/heart.svg', function (objects, options) {
                                //     var obj = fabric.util.groupSVGElements(objects, options);
                                //     obj.scale(0.12);
                                //     obj.set({ left: 25, top: 25 });
                                //     obj.selectable = false;
                                //     obj.scalable = false;
                                //     obj.name = 'heart';
                                //     obj.on('after:render', canvas.bringToFront(canvas.getItemByName('heartText')));
                                //     canvas.add(obj);
                                // });
                                // fabric.loadSVGFromURL('svg/shield.svg', function (objects, options) {
                                //     var obj = fabric.util.groupSVGElements(objects, options);
                                //     obj.scale(2.9);
                                //     obj.set({ left: 120, top: 25 });
                                //     obj.selectable = false;
                                //     obj.scalable = false;
                                //     obj.name = 'shield';
                                //     obj.on('after:render', canvas.bringToFront(canvas.getItemByName('shieldText')));
                                //     canvas.add(obj);
                                // });
                                // fabric.loadSVGFromURL('svg/energy.svg', function (objects, options) {
                                //     var obj = fabric.util.groupSVGElements(objects, options);
                                //     obj.scale(2.1);
                                //     obj.set({ left: 210, top: 25 });
                                //     obj.selectable = false;
                                //     obj.scalable = false;
                                //     obj.name = 'energy';
                                //     obj.on('after:render', canvas.bringToFront(canvas.getItemByName('energyText')));
                                //     canvas.add(obj);
                                // });
                                fabric.loadSVGFromURL('svg/exit.svg', function (objects, options) {
                                    var obj = fabric.util.groupSVGElements(objects, options);
                                    obj.scale(0.2);
                                    obj.set({ left: canvas.width / 2 + 220, top: canvas.height / 2 - 120 });
                                    obj.selectable = false;
                                    obj.scalable = false;
                                    obj.name = 'exit';
                                    canvas.add(obj);
                                    canvas.sendToBack(obj);
                                });

                            });
                            canvas.add(obj);
                        })

                    });
                    canvas.add(obj);
                })

            });
            canvas.add(obj);
        })

    }
    function loadBG(BGname) {
        if (!canvas.getItemByName(BGname)) {
            fabric.loadSVGFromURL('svg/' + BGname + '.svg', function (objects, options) {
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

        arenaDrop.style.left = ((canvas.width / 2) - 300) + 'px';
        arenaDrop.style.top = ((canvas.height / 2) - 624) + 'px';
        arenaDrop.style.visibility = 'visible';
        if (!canvas.getItemByName('findOpButton')) {
            var findOpButton = new fabric.Group([new fabric.Rect({
                width: 200,
                height: 40,
                fill: '#ccc',
                name: 'inArenaButtonBG',
                selectable: false
            }),
            new fabric.Text(String(inArenaButtonText), {
                // left: 200,
                // top: 100,
                fill: '#000',
                name: 'inArenaButtonText',
                fontSize: 18
            })], {
                    name: 'findOpButton',
                    left: canvas.width / 2,
                    top: 360,
                    opacity: 1,
                    selectable: false

                });
            canvas.add(findOpButton);
            canvas.bringToFront(findOpButton);

            var arenaCoinText = new fabric.Text(String("Stawka: "), {
                left: canvas.width / 2 - 80,
                top: canvas.height / 2 + 80,
                selectable: false,
                scalable: false,
                name: 'arenaCoinText',
                fill: '#fff',
                fontSize: 20,
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(arenaCoinText);
            canvas.bringToFront(arenaCoinText);



            var arenaStatsText = new fabric.Group([
                new fabric.Text('Nick', {
                    // left: 200,
                    top: 0,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'center',
                    originX: 'right'
                }),
                new fabric.Text('Poziom:', {
                    // left: 200,
                    top: 40,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Siła:', {
                    // left: 200,
                    top: 70,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Celność:', {
                    // left: 200,
                    top: 90,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Zręczność:', {
                    // left: 200,
                    top: 110,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Wytrzymałość:', {
                    // left: 200,
                    top: 130,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Witalność:', {
                    // left: 200,
                    top: 150,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                })], {
                    name: 'arenaStatsText',
                    left: canvas.width / 2 - 165,
                    top: 200,
                    opacity: 1,
                    selectable: false

                });
            canvas.add(arenaStatsText);
            canvas.bringToFront(arenaStatsText);


            var arenaStatsPoints = new fabric.Group([
                new fabric.Text(String(Gchar.level), {
                    // left: 200,
                    top: 0,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String(Gstats.stats.str), {
                    // left: 200,
                    top: 30,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String(Gstats.stats.att), {
                    // left: 200,
                    top: 50,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String(Gstats.stats.agi), {
                    // left: 200,
                    top: 70,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String(Gstats.stats.sta), {
                    // left: 200,
                    top: 90,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String(Gstats.stats.vit), {
                    // left: 200,
                    top: 110,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                })
                ], {
                    name: 'arenaStatsPoints',
                    left: canvas.width / 2 - 65,
                    top: 222,
                    opacity: 1,
                    selectable: false

                });
            canvas.add(arenaStatsPoints);
            canvas.bringToFront(arenaStatsPoints);


            var arenaStatsTextOp = new fabric.Group([
                new fabric.Text('Godny przeciwnik', {
                     left: 20,
                    top: 0,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'center',
                    originX: 'right'
                }),
                new fabric.Text('Poziom:', {
                    // left: 200,
                    top: 40,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Siła:', {
                    // left: 200,
                    top: 70,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Celność:', {
                    // left: 200,
                    top: 90,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Zręczność:', {
                    // left: 200,
                    top: 110,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Wytrzymałość:', {
                    // left: 200,
                    top: 130,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Witalność:', {
                    // left: 200,
                    top: 150,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                })], {
                    name: 'arenaStatsTextOp',
                    left: canvas.width / 2 + 100,
                    top: 200,
                    opacity: 1,
                    selectable: false

                });
            canvas.add(arenaStatsTextOp);
            canvas.bringToFront(arenaStatsTextOp);


            var arenaStatsPointsOp = new fabric.Group([
                new fabric.Text(String("?"), {
                    // left: 200,
                    top: 0,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String("?"), {
                    // left: 200,
                    top: 30,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String("?"), {
                    // left: 200,
                    top: 50,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String("?"), {
                    // left: 200,
                    top: 70,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String("?"), {
                    // left: 200,
                    top: 90,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String("?"), {
                    // left: 200,
                    top: 110,
                    fill: '#fff',
                    fontSize: 15,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                })
                ], {
                    name: 'arenaStatsPointsOp',
                    left: canvas.width / 2+ 180,
                    top: 222,
                    opacity: 1,
                    selectable: false

                });
            canvas.add(arenaStatsPointsOp);
            canvas.bringToFront(arenaStatsPointsOp);

        }

    };
    function loadCharMain() {
        loadGold();
    };
    function loadCharStickman() {
        loadLvl();
        loadExp();
        loadHp();
        loadArmor();
        loadEnergy();
    };
    function loadGold() {
        if (!canvas.getItemByName('coinText')) {
            var coinText = new fabric.Text(String(Gchar.gold), {
                left: canvas.width - 120,
                top: canvas.height - 30,
                selectable: false,
                scalable: false,
                name: 'coinText',
                fill: '#000',
                fontSize: 20,
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(coinText);
            canvas.bringToFront(coinText);
        }
    };
    function loadExp() {//required exp mechanism may be changed by Pan Kosakowski
        if (!canvas.getItemByName('expText')) {
            var expText = new fabric.Text('Exp: ' + String(Gchar.exp) + '/' + String(Gchar.level * 100 * 2), {
                left: canvas.width / 2 - 150,
                top: 350,
                selectable: false,
                scalable: false,
                name: 'expText',
                fill: '#fff',
                fontSize: 15,
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(expText);
        }
        canvas.bringToFront(expText);

    };
    function loadLvl() {
        if (!canvas.getItemByName('lvlText')) {
            var lvlText = new fabric.Text('LvL: ' + String(Gchar.level), {
                left: canvas.width / 2 - 240,
                top: 350,
                selectable: false,
                scalable: false,
                name: 'lvlText',
                fill: '#fff',
                fontSize: 20,
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(lvlText);
        }
        canvas.bringToFront(lvlText);

    };
    function loadHp() {
        if (!canvas.getItemByName('heartText')) {
            var heartText = new fabric.Text("Health: " + String(Gchar.hp), {
                left: canvas.width / 2 - 240,
                top: 110,
                selectable: false,
                scalable: false,
                name: 'heartText',
                fill: '#fff',
                fontSize: 15,
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(heartText);
        }
        canvas.bringToFront(heartText);

    };
    function loadArmor() {
        if (!canvas.getItemByName('shieldText')) {
            var shieldText = new fabric.Text("Armor: " + String(Gchar.armor), {
                left: canvas.width / 2 - 85,
                top: 110,
                selectable: false,
                scalable: false,
                name: 'shieldText',
                fill: '#fff',
                fontSize: 15,
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(shieldText);
        }
        canvas.bringToFront(shieldText);

    };
    function loadEnergy() {
        if (!canvas.getItemByName('energyText')) {
            var energyText = new fabric.Text("Energy: " + String(Gchar.energy), {
                left: canvas.width / 2 + 65,
                top: 110,
                selectable: false,
                scalable: false,
                name: 'energyText',
                fill: '#fff',
                fontSize: 15,
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(energyText);
        }
        canvas.bringToFront(energyText);

    };
    function loadRanking() {
        //TODO
    };
    function loadStats() {
        if (!canvas.getItemByName('statsText')) {
            var statsText = new fabric.Group([
                new fabric.Text('Siła:', {
                    // left: 200,
                    top: 0,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Celność:', {
                    // left: 200,
                    top: 30,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Zręczność:', {
                    // left: 200,
                    top: 60,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Wytrzymałość:', {
                    // left: 200,
                    top: 90,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Witalność:', {
                    // left: 200,
                    top: 120,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text('Punkty rozwoju:', {
                    left: 20,
                    top: 160,
                    fill: '#fff',
                    fontSize: 22,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                })], {
                    name: 'statsText',
                    left: canvas.width / 2 - 165,
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
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String(Gstats.stats.att), {
                    // left: 200,
                    top: 30,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String(Gstats.stats.agi), {
                    // left: 200,
                    top: 60,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String(Gstats.stats.sta), {
                    // left: 200,
                    top: 90,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String(Gstats.stats.vit), {
                    // left: 200,
                    top: 120,
                    fill: '#fff',
                    fontSize: 18,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                }),
                new fabric.Text(String(Gstats.stats.free), {
                    left: 20,
                    top: 160,
                    fill: '#fff',
                    fontSize: 22,
                    fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                    textAlign: 'right',
                    originX: 'right'
                })], {
                    name: 'statsPoints',
                    left: canvas.width / 2 - 65,
                    top: 220,
                    opacity: 1,
                    selectable: false

                });
            canvas.add(statsPoints);
            if (Gstats.stats.free != 0) {
                fabric.loadSVGFromURL('svg/plus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(0.35);
                    obj.set({ left: canvas.width / 2 - 38, top: 138 });
                    obj.selectable = false;
                    obj.scalable = false;
                    obj.name = 'addStr';
                    canvas.add(obj);
                });
                fabric.loadSVGFromURL('svg/plus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(0.35);
                    obj.set({ left: canvas.width / 2 - 38, top: 168 });
                    obj.selectable = false;
                    obj.scalable = false;
                    obj.name = 'addAtt';
                    canvas.add(obj);
                });
                fabric.loadSVGFromURL('svg/plus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(0.35);
                    obj.set({ left: canvas.width / 2 - 38, top: 198 });
                    obj.selectable = false;
                    obj.scalable = false;
                    obj.name = 'addAgi';
                    canvas.add(obj);
                });
                fabric.loadSVGFromURL('svg/plus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(0.35);
                    obj.set({ left: canvas.width / 2 - 38, top: 228 });
                    obj.selectable = false;
                    obj.scalable = false;
                    obj.name = 'addSta';
                    canvas.add(obj);
                });
                fabric.loadSVGFromURL('svg/plus.svg', function (objects, options) {
                    var obj = fabric.util.groupSVGElements(objects, options);
                    obj.scale(0.35);
                    obj.set({ left: canvas.width / 2 - 38, top: 258 });
                    obj.selectable = false;
                    obj.scalable = false;
                    obj.name = 'addVit';
                    canvas.add(obj);
                });


            }
        }
        loadExp();
        loadLvl();
        loadHp();
        loadArmor();
        loadEnergy();
        canvas.bringToFront(canvas.getItemByName('statsText'));
        canvas.bringToFront(canvas.getItemByName('statsPoints'));
        canvas.bringToFront(canvas.getItemByName('expText'));
        canvas.bringToFront(canvas.getItemByName('lvlText'));
        canvas.bringToFront(canvas.getItemByName('heartText'));
        canvas.bringToFront(canvas.getItemByName('shieldText'));
        canvas.bringToFront(canvas.getItemByName('energyText'));
        canvas.bringToFront(canvas.getItemByName('addStr'));
        canvas.bringToFront(canvas.getItemByName('addAtt'));
        canvas.bringToFront(canvas.getItemByName('addAgi'));
        canvas.bringToFront(canvas.getItemByName('addSta'));
        canvas.bringToFront(canvas.getItemByName('addVit'));
        canvas.bringToFront(canvas.getItemByName('exit'));

    }
    function loadInTavern() {
        loadShopItemStats("Item name", "atk min 2", "atk max 24", "type weapon", " ", "23", "KUP", 'svg/weapon.svg')

        if (!canvas.getItemByName('tradeBuy')) {

            sellDrop.style.left = 130 + 'px';
            sellDrop.style.top = -290 + 'px';
            sellDrop.style.visibility = 'visible';

            buyDrop.style.left = -333 + 'px';
            buyDrop.style.top = -350 + 'px';
            buyDrop.style.visibility = 'visible';



            var tradeBuy = new fabric.Text(String("Kup"), {
                left: canvas.width / 2 - 155,
                top: canvas.height / 2 - 120,
                selectable: false,
                scalable: false,
                name: 'tradeBuy',
                fill: 'red',
                fontSize: 20,
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                textAlign: 'center',
            });
            canvas.add(tradeBuy);
            var tradeSell = new fabric.Text(String("Sprzedaj"), {
                left: canvas.width / 2 - 155,
                top: canvas.height / 2 + 30,
                selectable: false,
                scalable: false,
                name: 'tradeSell',
                fill: 'red',
                fontSize: 20,
                fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
                textAlign: 'center',
            });
            canvas.add(tradeSell);


            canvas.bringToFront(canvas.getItemByName('tradeBuy'))
            canvas.bringToFront(canvas.getItemByName('tradeSell'))


        }

    }
    function loadShopItemStats(selectedName, selectedStat1, selectedStat2, selectedStat3, selectedStat4, selectedValue, selectedButtonOption, itemPath) {
        // loadShopItemStats("Item name", "atk min 2", "atk max 24", "type weapon", " ", "23", "KUP",'svg/weapon.svg' )

        fabric.loadSVGFromURL(itemPath, function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.scale(0.4);
            obj.set({ left: canvas.width / 2, top: canvas.height / 2 });
            obj.selectable = false;
            obj.scalable = false;
            obj.name = 'shopImg';
            obj.on('added', function () {
            });
            canvas.add(obj);

        });


        var itemName = new fabric.Text(String(selectedName), {
            left: canvas.width / 2 + 150,
            top: canvas.height / 2 - 90,
            selectable: false,
            scalable: false,
            name: 'itemName',
            fill: 'red',
            fontSize: 30,
            fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
            textAlign: 'center',
        });
        canvas.add(itemName);
        var stat1 = new fabric.Text(String(selectedStat1), {
            left: canvas.width / 2 + 150,
            top: canvas.height / 2 - 60,
            selectable: false,
            scalable: false,
            name: 'stat1',
            fill: 'red',
            fontSize: 20,
            fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
            textAlign: 'center',
        });
        canvas.add(stat1);
        var stat2 = new fabric.Text(String(selectedStat2), {
            left: canvas.width / 2 + 150,
            top: canvas.height / 2 - 40,
            selectable: false,
            scalable: false,
            name: 'stat2',
            fill: 'red',
            fontSize: 20,
            fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
            textAlign: 'center',
        });
        canvas.add(stat2);
        var stat3 = new fabric.Text(String(selectedStat3), {
            left: canvas.width / 2 + 150,
            top: canvas.height / 2 - 20,
            selectable: false,
            scalable: false,
            name: 'stat3',
            fill: 'red',
            fontSize: 20,
            fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
            textAlign: 'center',
        });
        canvas.add(stat3);
        var stat4 = new fabric.Text(String(selectedStat4), {
            left: canvas.width / 2 + 150,
            top: canvas.height / 2,
            selectable: false,
            scalable: false,
            name: 'stat4',
            fill: 'red',
            fontSize: 20,
            fontFamily: '"Comic Sans MS", "Comic Sans", cursive',
            textAlign: 'center',
        });
        canvas.add(stat4);



        var tradeButton = new fabric.Group([new fabric.Rect({
            width: 120,
            height: 35,
            fill: '#ccc',
            name: 'inTavernButtonBG',
            selectable: false
        }),
        new fabric.Text(String(selectedButtonOption), {
            // left: 200,
            // top: 100,
            fill: '#000',
            name: 'inTavernButtonText',
            fontSize: 15
        })], {
                name: 'tradeButton',
                left: canvas.width / 2 + 150,
                top: 330,
                opacity: 1,
                selectable: false

            });
        canvas.add(tradeButton);
        canvas.sendToBack(tradeButton);



        fabric.loadSVGFromURL('svg/coin.svg', function (objects, options) {
            var coinShop = fabric.util.groupSVGElements(objects, options);
            coinShop.scale(0.04);
            // coinShop.set({ left: 0 , top: 30 })
            coinShop.selectable = false;
            coinShop.scalable = false;
            coinShop.name = 'coinShop';


            var itemValue = new fabric.Group([

                new fabric.Text(String(selectedValue), {
                    left: 40,
                    // top: 100,
                    fill: '#000',
                    name: 'inTavernValueText',
                    textAlign: 'left',
                    fontSize: 25
                }), coinShop], {
                    name: 'itemValue',
                    left: canvas.width / 2 + 150,
                    top: 290,
                    opacity: 1,
                    selectable: false

                });
            canvas.add(itemValue);
        })
        canvas.bringToFront(canvas.getItemByName('shopImg'))
        canvas.bringToFront(canvas.getItemByName('tradeButton'))
        canvas.bringToFront(canvas.getItemByName('itemName'))
        canvas.bringToFront(canvas.getItemByName('stat1'))
        canvas.bringToFront(canvas.getItemByName('stat2'))
        canvas.bringToFront(canvas.getItemByName('stat3'))
        canvas.bringToFront(canvas.getItemByName('stat4'))
        canvas.bringToFront(canvas.getItemByName('itemValue'))


    }
    function loadEq() {
        if (!canvas.getItemByName('EQhelmet') && !canvas.getItemByName('EQarmor') && !canvas.getItemByName('EQweapon')) {
            fabric.loadSVGFromURL('svg/Helmet.svg', function (objects, options) {
                var obj = fabric.util.groupSVGElements(objects, options);
                obj.scale(0.2);
                obj.set({ left: canvas.width / 2 + 20, top: canvas.height / 2 - 90 })
                obj.selectable = false;
                obj.scalable = false;
                obj.name = 'EQhelmet';
                canvas.add(obj);
            });
            fabric.loadSVGFromURL('svg/armor.svg', function (objects, options) {
                var obj = fabric.util.groupSVGElements(objects, options);
                obj.scale(0.2);
                obj.set({ left: canvas.width / 2 + 20, top: canvas.height / 2 + 10 })
                obj.selectable = false;
                obj.scalable = false;
                obj.name = 'EQarmmor';
                canvas.add(obj);
            });
            fabric.loadSVGFromURL('svg/weapon.svg', function (objects, options) {
                var obj = fabric.util.groupSVGElements(objects, options);
                obj.scale(0.3);
                obj.set({ left: canvas.width / 2 + 20, top: canvas.height / 2 + 110 })
                obj.selectable = false;
                obj.scalable = false;
                obj.name = 'EQweapon';
                canvas.add(obj);
            });
        }
        canvas.bringToFront(canvas.getItemByName('EQhelmet'));
        canvas.bringToFront(canvas.getItemByName('EQarmmor'));
        canvas.bringToFront(canvas.getItemByName('EQweapon'));

        helmetDrop.style.left = ((canvas.width / 2) + 85) + 'px';//200
        helmetDrop.style.top = ((canvas.height / 2) - 650) + 'px';//580
        helmetDrop.style.visibility = 'visible';

        armorDrop.style.left = ((canvas.width / 2) + -70) + 'px';//50
        armorDrop.style.top = ((canvas.height / 2) - 550) + 'px';
        armorDrop.style.visibility = 'visible';

        weaponDrop.style.left = ((canvas.width / 2) - 225) + 'px';
        weaponDrop.style.top = ((canvas.height / 2) - 450) + 'px';
        weaponDrop.style.visibility = 'visible';
    }
    function closeButton() {
        hideEqControls();
        hideShopControls();
        hideArenaControls()
        canvas.sendToBack(canvas.getItemByName('inArena'));
        canvas.sendToBack(canvas.getItemByName('inTavern'));
        canvas.sendToBack(canvas.getItemByName('inBlacksmith'));
        canvas.sendToBack(canvas.getItemByName('inStatue'));
        canvas.sendToBack(canvas.getItemByName('inStickman'));
        canvas.sendToBack(canvas.getItemByName('findOpButton'));
        canvas.sendToBack(canvas.getItemByName('exit'));
        removeStats();
        removeEq();
        removeTavern();
        removeArena();

    }
    function removeStats() {
        return new Promise(function (resolve, reject) {
            if (canvas.getItemByName('statsPoints')) { canvas.remove(canvas.getItemByName('statsPoints')); }
            if (canvas.getItemByName('statsText')) { canvas.remove(canvas.getItemByName('statsText')); }
            if (canvas.getItemByName('addStr')) { canvas.remove(canvas.getItemByName('addStr')); }
            if (canvas.getItemByName('addAtt')) { canvas.remove(canvas.getItemByName('addAtt')); }
            if (canvas.getItemByName('addAgi')) { canvas.remove(canvas.getItemByName('addAgi')); }
            if (canvas.getItemByName('addSta')) { canvas.remove(canvas.getItemByName('addSta')); }
            if (canvas.getItemByName('addVit')) { canvas.remove(canvas.getItemByName('addVit')); }
            if (canvas.getItemByName('expText')) { canvas.remove(canvas.getItemByName('expText')); }
            if (canvas.getItemByName('lvlText')) { canvas.remove(canvas.getItemByName('lvlText')); }
            if (canvas.getItemByName('heartText')) { canvas.remove(canvas.getItemByName('heartText')); }
            if (canvas.getItemByName('shieldText')) { canvas.remove(canvas.getItemByName('shieldText')); }
            if (canvas.getItemByName('energyText')) { canvas.remove(canvas.getItemByName('energyText')); }

            resolve();
        });
    }
    function removeEq() {
        if (canvas.getItemByName('EQhelmet')) { canvas.remove(canvas.getItemByName('EQhelmet')); }
        if (canvas.getItemByName('EQarmmor')) { canvas.remove(canvas.getItemByName('EQarmmor')); }
        if (canvas.getItemByName('EQweapon')) { canvas.remove(canvas.getItemByName('EQweapon')); }
    }
    function removeChar() {
        if (canvas.getItemByName('coinText')) { canvas.remove(canvas.getItemByName('coinText')); }
    }
    function removeTavern() {
        if (canvas.getItemByName('itemName')) { canvas.remove(canvas.getItemByName('itemName')); }
        if (canvas.getItemByName('stat1')) { canvas.remove(canvas.getItemByName('stat1')); }
        if (canvas.getItemByName('stat2')) { canvas.remove(canvas.getItemByName('stat2')); }
        if (canvas.getItemByName('stat3')) { canvas.remove(canvas.getItemByName('stat3')); }
        if (canvas.getItemByName('stat4')) { canvas.remove(canvas.getItemByName('stat4')); }
        if (canvas.getItemByName('tradeButton')) { canvas.remove(canvas.getItemByName('tradeButton')); }
        if (canvas.getItemByName('itemValue')) { canvas.remove(canvas.getItemByName('itemValue')); }
        if (canvas.getItemByName('tradeSell')) { canvas.remove(canvas.getItemByName('tradeSell')); }
        if (canvas.getItemByName('tradeBuy')) { canvas.remove(canvas.getItemByName('tradeBuy')); }
        if (canvas.getItemByName('shopImg')) { canvas.remove(canvas.getItemByName('shopImg')); }

    }
    function removeArena() {
        if (canvas.getItemByName('findOpButton')) { canvas.remove(canvas.getItemByName('findOpButton')); }
        if (canvas.getItemByName('arenaCoinText')) { canvas.remove(canvas.getItemByName('arenaCoinText')); }
        if (canvas.getItemByName('arenaStatsText')) { canvas.remove(canvas.getItemByName('arenaStatsText')); }
        if (canvas.getItemByName('arenaStatsPoints')) { canvas.remove(canvas.getItemByName('arenaStatsPoints')); }
        if (canvas.getItemByName('arenaStatsTextOp')) { canvas.remove(canvas.getItemByName('arenaStatsTextOp')); }
        if (canvas.getItemByName('arenaStatsPointsOp')) { canvas.remove(canvas.getItemByName('arenaStatsPointsOp')); }

    }

    function hideEqControls() {
        helmetDrop.style.visibility = 'hidden';
        armorDrop.style.visibility = 'hidden';
        weaponDrop.style.visibility = 'hidden';
    }
    function hideShopControls() {
        buyDrop.style.visibility = 'hidden';
        sellDrop.style.visibility = 'hidden';
    }
    function hideArenaControls() {
        arenaDrop.style.visibility = 'hidden';
    }


}

function refInArenaButtonText(input){
    inArenaButtonText = input;
    if (canvas.getItemByName('findOpButton')) { canvas.remove(canvas.getItemByName('findOpButton')); }

    var findOpButton = new fabric.Group([new fabric.Rect({
        width: 200,
        height: 40,
        fill: '#ccc',
        name: 'inArenaButtonBG',
        selectable: false
    }),
    new fabric.Text(String(inArenaButtonText), {
        // left: 200,
        // top: 100,
        fill: '#000',
        name: 'inArenaButtonText',
        fontSize: 18
    })], {
            name: 'findOpButton',
            left: canvas.width / 2,
            top: 360,
            opacity: 1,
            selectable: false

        });
    canvas.add(findOpButton);
    canvas.bringToFront(findOpButton);

}