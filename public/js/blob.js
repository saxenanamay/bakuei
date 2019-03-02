var canvas = document.getElementById('myCanvas');
var context = canvas.getContext('2d');
context.rect(0, 0, 800, 800);
// add linear gradient
var grd = context.createLinearGradient(0, 0, 900, 900);
// light blue
grd.addColorStop(0, 'rgba(85, 197, 122, 0.8)');   
// dark blue
grd.addColorStop(1, 'rgba(40, 180, 133, 0.8)');
context.fillStyle = grd;
context.fill();


var app = new PIXI.Application(800, 800, { antialias: true, backgroundColor: 0xffffff});
document.body.appendChild(app.view);

// app.stage.interactive = true;

var can2 = document.getElementById('myCanvas');
var sprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(can2))
 

var graphics = new PIXI.Graphics();

app.stage.addChild(graphics);

// let's create a moving shape
var thing = new PIXI.Graphics();
app.stage.addChild(thing);
thing.x = 800/2;
thing.y = 800/2;
thing.pivot.set(400, 400);

sprite.height = 800;
sprite.width = 800;
sprite.mask = thing;
app.stage.addChild(sprite);

var count = 0;

app.ticker.add(function() {

    count += 0.075;
  
    thing.clear();

    // thing.lineStyle(10, 0xff0000, 1);
  
    thing.moveTo(400, 25);
    thing.beginFill(0xff0000) 
    thing.quadraticCurveTo(25 + Math.sin(count) * 20, 25,25 + Math.cos(count) * 10, 400);
    thing.quadraticCurveTo(25, 775 + Math.cos(count) * 20, 400, 775);
    thing.quadraticCurveTo(775 + Math.sin(count) * 20, 775, 775, 400);
    thing.quadraticCurveTo(775, 25 + Math.cos(count) * 20, 400, 25);

    thing.rotation = count * 0.075;
 
});