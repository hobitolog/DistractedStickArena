function showArena() {
    canvas.clear();
    canvas.localization = 'arena';
    load();

    canvas.on('mouse:over', function (e) {
        if (e.target != null && canvas.localization == 'arena') {

        }
    });
    canvas.on('mouse:out', function (e) {
        if (e.target != null && e.target.scalable == true && canvas.localization == 'town') {
            e.target.scale(1.75);
            canvas.renderAll();
        }
    });
    canvas.on('mouse:down', function (e) {
        if (e.target != null && canvas.localization == 'arena') {
            switch (e.target.name) {
                case 'weapon1':
                    //atack1
                    break;
                case 'weapon2':
                    //atack2

                    break;
                case 'weapon3':
                    //atack3

                    break;
                case 'zzz':
                    //sleep
                    break;

            }
            canvas.renderAll();
        }
    });

    function load() {
        fabric.loadSVGFromURL('../svg/arena/arenaBG.svg', function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.scale(1.2);
            obj.set({ left: canvas.width / 2, top: 140 });
            obj.selectable = false;
            obj.scalable = false;
            obj.name = 'bg';
            obj.on('added', function () {
                canvas.bringToFront(canvas.getItemByName('menu'))
            });
            canvas.add(obj);

        });

        var menu = new fabric.Rect({
            top: 436,
            left: canvas.width / 2,
            width: canvas.width,
            height: 100,
            selectable: false,
            scalable: false,
            name: 'menu',
            fill: 'green',
        });
        menu.on('added', function () {
            canvas.bringToFront(canvas.getItemByName('weapon3'))
            canvas.bringToFront(canvas.getItemByName('weapon2'))
            canvas.bringToFront(canvas.getItemByName('weapon1'))
            canvas.bringToFront(canvas.getItemByName('stickman'))
            canvas.bringToFront(canvas.getItemByName('opponent'))
           

        });
        canvas.add(menu);

        fabric.loadSVGFromURL('../svg/weapon.svg', function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.scale(0.3);
            obj.set({ left: 40, top: 440 });
            obj.selectable = false;
            obj.scalable = false;
            obj.name = 'weapon1';
            obj.on('added', function () {
                timer(60)
                canvas.bringToFront(canvas.getItemByName('timer'))
            });
            canvas.add(obj);

        });
        fabric.loadSVGFromURL('../svg/weapon.svg', function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.scale(0.3);
            obj.set({ left: 120, top: 440 });
            obj.selectable = false;
            obj.scalable = false;
            obj.name = 'weapon2';
            obj.on('added', function () {
            });
            canvas.add(obj);

        });
        fabric.loadSVGFromURL('../svg/weapon.svg', function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.scale(0.3);
            obj.set({ left: 200, top: 440 });
            obj.selectable = false;
            obj.scalable = false;
            obj.name = 'weapon3';
            obj.on('added', function () {
            });
            canvas.add(obj);

        });
        fabric.loadSVGFromURL('../svg/arena/zzz.svg', function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.scale(0.3);
            obj.set({ left: 290, top: 460 });
            obj.selectable = false;
            obj.scalable = false;
            obj.name = 'zzz';
            obj.on('added', function () {
            });
            canvas.add(obj);

        });
        fabric.loadSVGFromURL('../svg/Stickman.svg', function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.scale(2);
            obj.set({ left: 330, top: 300 });
            obj.selectable = false;
            obj.scalable = true;
            obj.name = 'stickman';
            canvas.add(obj);
        });
        fabric.loadSVGFromURL('../svg/Stickman.svg', function (objects, options) {
            var obj = fabric.util.groupSVGElements(objects, options);
            obj.scale(1.7);
            obj.set({ left: 420, top: 280 });
            obj.selectable = false;
            obj.scalable = true;
            obj.name = 'opponent';
            canvas.add(obj);
        });




        canvas.renderAll();
    }

    function timer(time) {
        

        var x = setInterval(function() {
            time = time - 1;          

            canvas.remove(canvas.getItemByName('timer'))
            var timer = new fabric.Text(String(time), {
                left: canvas.width/2,
                top:  30,
                selectable: false,
                scalable: false,
                name: 'timer',
                fill: 'red',
                fontSize: 50,
                fontFamily: 'Comic Sans',
                textAlign: 'right',
                originX: 'right',
            });
            canvas.add(timer);
            canvas.renderAll();
            if (time <= 0) {
              clearInterval(x);
              //TODO  END ROUND
            }
          }, 1000);       

    }









}