var canvas;
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
                itemId: 0
            },
            armor: {
                itemId: 0
            },
            weapon: {
                itemId: 0
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
                    // Gchar.hp = xmlhttp.response.hp;
                    // Gchar.armor = xmlhttp.response.armor;
                    // Gchar.energy = xmlhttp.response.energy;
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
                    loadInArena();
                    refreshChar();
                    canvas.getItemByName('inArena').opacity = 1;
                    canvas.bringToFront(canvas.getItemByName('inArena'));
                    canvas.bringToFront(canvas.getItemByName('findOpButton'));
                    canvas.bringToFront(canvas.getItemByName('exit'));
                    //open arena
                    break;
                case 'tavern':
                    hideEqControls()
                    refreshChar();
                    canvas.getItemByName('inTavern').opacity = 1;
                    canvas.bringToFront(canvas.getItemByName('inTavern'));
                    canvas.bringToFront(canvas.getItemByName('exit'));
                    loadBuyItemList();
                    loadSellItemList();
                    loadInTavern();


                    //open tavern
                    break;
                case 'blacksmith':
                    hideEqControls()
                    hideShopControls()
                    refreshChar();
                    canvas.getItemByName('inBlacksmith').opacity = 1;
                    canvas.bringToFront(canvas.getItemByName('inBlacksmith'));
                    canvas.bringToFront(canvas.getItemByName('exit'));
                    //open blacksmith
                    break;
                case 'statue':
                    hideEqControls()
                    hideShopControls()
                    refreshChar();
                    canvas.getItemByName('inStatue').opacity = 1;
                    canvas.bringToFront(canvas.getItemByName('inStatue'));
                    canvas.bringToFront(canvas.getItemByName('exit'));
                    canvas.bringToFront(canvas.getItemByName('coinText'));

                    //open statue
                    break;
                case 'stickman':
                    hideShopControls()
                    canvas.getItemByName('inStickman').opacity = 1;
                    canvas.bringToFront(canvas.getItemByName('inStickman'));
                    reqStat().then(loadStats);
                    loadEq();
                    reqCharacter().then(loadCharStickman);
                    refreshChar();
                    //TODO
                    //reqEq().then
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
                    window.open("https://media1.tenor.com/images/0e5b20868a069ab6ee46a5552154d021/tenor.gif?itemid=6103287", "_self")
                    break;
                case 'tradeButton':
                    if(canvas.getItemByName('tradeButton').option == 'sell') {
                        var itemToSell = document.getElementById('sell').value
                        //TODO sell item
                    } else {
                        var itemToBuy = document.getElementById('buy').value
                        //TODO buy item
                    }
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
                                fabric.loadSVGFromURL('svg/heart.svg', function (objects, options) {
                                    var obj = fabric.util.groupSVGElements(objects, options);
                                    obj.scale(0.12);
                                    obj.set({ left: 25, top: 25 });
                                    obj.selectable = false;
                                    obj.scalable = false;
                                    obj.name = 'heart';
                                    obj.on('after:render', canvas.bringToFront(canvas.getItemByName('heartText')));
                                    canvas.add(obj);
                                });
                                fabric.loadSVGFromURL('svg/shield.svg', function (objects, options) {
                                    var obj = fabric.util.groupSVGElements(objects, options);
                                    obj.scale(2.9);
                                    obj.set({ left: 120, top: 25 });
                                    obj.selectable = false;
                                    obj.scalable = false;
                                    obj.name = 'shield';
                                    obj.on('after:render', canvas.bringToFront(canvas.getItemByName('shieldText')));
                                    canvas.add(obj);
                                });
                                fabric.loadSVGFromURL('svg/energy.svg', function (objects, options) {
                                    var obj = fabric.util.groupSVGElements(objects, options);
                                    obj.scale(2.1);
                                    obj.set({ left: 210, top: 25 });
                                    obj.selectable = false;
                                    obj.scalable = false;
                                    obj.name = 'energy';
                                    obj.on('after:render', canvas.bringToFront(canvas.getItemByName('energyText')));
                                    canvas.add(obj);
                                });
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
    function loadCharMain() {
        loadGold();
        loadHp();
        loadArmor();
        loadEnergy();
    };
    function loadCharStickman() {
        loadLvl();
        loadExp();
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
                fontFamily: 'Comic Sans',
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
                left: canvas.width / 2 - 165,
                top: 115,
                selectable: false,
                scalable: false,
                name: 'expText',
                fill: '#fff',
                fontSize: 18,
                fontFamily: 'Comic Sans',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(expText);
            canvas.bringToFront(expText);
        }
    };
    function loadLvl() {
        if (!canvas.getItemByName('lvlText')) {
            var lvlText = new fabric.Text('LvL: ' + String(Gchar.level), {
                left: canvas.width / 2 - 240,
                top: 115,
                selectable: false,
                scalable: false,
                name: 'lvlText',
                fill: '#fff',
                fontSize: 18,
                fontFamily: 'Comic Sans',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(lvlText);
            canvas.bringToFront(lvlText);
        }
    };
    function loadHp() {
        if (!canvas.getItemByName('heartText')) {
            var heartText = new fabric.Text(String(Gchar.hp), {
                left: 48,
                top: 25,
                selectable: false,
                scalable: false,
                name: 'heartText',
                fill: '#000',
                fontSize: 25,
                fontFamily: 'Comic Sans',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(heartText);
            canvas.bringToFront(heartText);
        }
    };
    function loadArmor() {
        if (!canvas.getItemByName('shieldText')) {
            var shieldText = new fabric.Text(String(Gchar.armor), {
                left: 140,
                top: 25,
                selectable: false,
                scalable: false,
                name: 'shieldText',
                fill: '#000',
                fontSize: 25,
                fontFamily: 'Comic Sans',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(shieldText);
            canvas.bringToFront(shieldText);
        }
    };
    function loadEnergy() {
        if (!canvas.getItemByName('energyText')) {
            var energyText = new fabric.Text(String(Gchar.energy), {
                left: 230,
                top: 25,
                selectable: false,
                scalable: false,
                name: 'energyText',
                fill: '#000',
                fontSize: 25,
                fontFamily: 'Comic Sans',
                textAlign: 'left',
                originX: 'left',
            });
            canvas.add(energyText);
            canvas.bringToFront(energyText);
        }
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
        canvas.bringToFront(canvas.getItemByName('statsText'));
        canvas.bringToFront(canvas.getItemByName('statsPoints'));
        canvas.bringToFront(canvas.getItemByName('addStr'));
        canvas.bringToFront(canvas.getItemByName('addAtt'));
        canvas.bringToFront(canvas.getItemByName('addAgi'));
        canvas.bringToFront(canvas.getItemByName('addSta'));
        canvas.bringToFront(canvas.getItemByName('addVit'));
        canvas.bringToFront(canvas.getItemByName('exit'));

    }

    function loadSellItemList() {
        return new Promise(function (resolve, reject) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "getBackpack", true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.responseType = "json";
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    clearSellList()
                    xmlhttp.response.backpack.forEach((element, index) => {
                        var option = document.createElement("option");
                        option.text = element.name;
                        option.addEventListener("click", getAndLoadShopItem(element.itemId, "SELL"))
                        sellDrop.add(option);
                })
                if(sellDrop.length == 0) {
                    var option = document.createElement("option");
                    option.text = "Pusto!";
                    sellDrop.add(option);
                    }
                    resolve();
                }
            }
            xmlhttp.send();
        })
    }

    function loadBuyItemList() {
        return new Promise(function (resolve, reject) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "getShopItemList", true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            // TODO set(Level/User)Param to get proper equipment
            xmlhttp.responseType = "json";
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    clearBuyList()
                    xmlhttp.response.backpack.forEach((element, index) => {
                        var option = document.createElement("option");
                        option.text = element.name;
                        switch(element.type) {
                            case 'weapon':
                            option.addEventListener("click", loadShopItemStats(element.name, "atk min 2", "atk max 24", element.type, "level " + element.level, "23", "KUP", element.image))
                            break

                            case 'armor':
                            option.addEventListener("click",loadShopItemStats(element.name, "atk min 2", "atk max 24", element.type, "level " + element.level, "23", "KUP", element.image))
                            break

                            case 'helmet':
                            option.addEventListener("click",loadShopItemStats(element.name, "atk min 2", "atk max 24", element.type, "level " + element.level, "23", "KUP", element.image))
                            break
                        }
                        buyDrop.add(option);
                })
                    resolve();
                }
            }
            xmlhttp.send();
        })
    }


    function clearSellList() {
        sellDrop.innerHTML = ""
    }

    function clearBuyList() {
        buyDrop.innerHTML = ""
    }

    function getAndLoadShopItem(itemId, operation) {
        return new Promise(function (resolve, reject) {
            var xmlhttp = new XMLHttpRequest();
            xmlhttp.open("GET", "getVariant", true);
            xmlhttp.setRequestHeader("Content-Type", "application/json");
            xmlhttp.responseType = "json";
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.readyState == 4 && xmlhttp.status == 200) {
                    var variant = xmlhttp.response.variant
                        switch(variant.type) {
                            case 'weapon':
                            loadShopItemStats(variant.name, "atk min " + variant.damageMin, "atk max " + variant.damageMax, variant.type, "level " + variant.level, variant.value * (option == "SELL" ? 0.75 : 1), (option == "SELL" ? "SPRZEDAJ" : "KUP"), variant.image)
                            break

                            case 'armor':
                            loadShopItemStats(variant.name, "def? ", "" + variant.damageMax, variant.type, "level " + variant.level, variant.value * (option == "SELL" ? 0.75 : 1), (option == "SELL" ? "SPRZEDAJ" : "KUP"), variant.image)
                            break

                            case 'helmet':
                            loadShopItemStats(variant.name, "def? ", "" + variant.damageMax, variant.type, "level " + variant.level, variant.value * (option == "SELL" ? 0.75 : 1), (option == "SELL" ? "SPRZEDAJ" : "KUP"), variant.image)
                            break
                        }
                    resolve();
                }
            }
            var json = JSON.stringify({'itemId': itemId})
            xmlhttp.send(json);
        })
    }

    function loadInTavern() {
        loadShopItemStats("Item name", "atk min 2", "atk max 24", "type weapon", " ", "23", "KUP", 'svg/weapon.svg')
        //TODO delete it, instead set iteam with 0 index from list
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
                fontFamily: 'Comic Sans',
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
                fontFamily: 'Comic Sans',
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
            fontFamily: 'Comic Sans',
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
            fontFamily: 'Comic Sans',
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
            fontFamily: 'Comic Sans',
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
            fontFamily: 'Comic Sans',
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
            fontFamily: 'Comic Sans',
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
        tradeButton.option = selectedButtonOption;
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

    function closeButton() {
        hideEqControls();
        hideShopControls();
        canvas.sendToBack(canvas.getItemByName('inArena'));
        canvas.sendToBack(canvas.getItemByName('inTavern'));
        canvas.sendToBack(canvas.getItemByName('inBlacksmith'));
        canvas.sendToBack(canvas.getItemByName('inStatue'));
        canvas.sendToBack(canvas.getItemByName('inStickman'));
        canvas.sendToBack(canvas.getItemByName('findOpButton'));
        canvas.sendToBack(canvas.getItemByName('exit'));
        if (canvas.getItemByName('findOpButton')) { canvas.remove(canvas.getItemByName('findOpButton')); }
        removeStats();
        removeEq();
        removeTavern();

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
        if (canvas.getItemByName('heartText')) { canvas.remove(canvas.getItemByName('heartText')); }
        if (canvas.getItemByName('shieldText')) { canvas.remove(canvas.getItemByName('shieldText')); }
        if (canvas.getItemByName('energyText')) { canvas.remove(canvas.getItemByName('energyText')); }
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
                obj.set({ left: canvas.width / 2 + 20, top: canvas.height / 2 + 100 })
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
        helmetDrop.style.top = ((canvas.height / 2) - 580) + 'px';
        helmetDrop.style.visibility = 'visible';

        armorDrop.style.left = ((canvas.width / 2) + -70) + 'px';//50
        armorDrop.style.top = ((canvas.height / 2) - 490) + 'px';
        armorDrop.style.visibility = 'visible';

        weaponDrop.style.left = ((canvas.width / 2) - 225) + 'px';
        weaponDrop.style.top = ((canvas.height / 2) - 390) + 'px';
        weaponDrop.style.visibility = 'visible';
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














}