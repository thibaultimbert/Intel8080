// Initial setup/plumbing (rom/memory/cpu/input/screen)

// rom loading
var oReq = new XMLHttpRequest();
oReq.open("GET", "https://dl.dropbox.com/u/7009356/invaders.rom", true);
// binary
oReq.responseType = "arraybuffer";

// cpu
var processor = new cpu.Intel8080();

// canvas and container
var canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 224;
var container = document.createElement("div");
container.id = 'container';
container.appendChild(canvas);
document.body.appendChild(container);

// get the 2d context
var context = canvas.getContext("2d");

// screen
var screen = new video.Screen(processor, context, 256, 224, false, 0);

// user input (keyboard)
var input = new io.Input(document, this, processor);
input.init();
processor.setInput(input);

oReq.onload = function (oEvent)
{
    // grab the rom bytes
    var arrayBuffer = oReq.response;

    if (arrayBuffer)
    {
        var source = new Uint8Array(arrayBuffer);
        if ( source.length > 8192 )
               throw new Error("Bad rom size!");

        // allocate twice memory for RAM
        var byteArray = new ArrayBuffer(16384);
        var view = new Uint8Array(byteArray);
        view.set(source);

        // pass the ROM/RAM to the CPU
        processor.memory = view;
        processor.init();

        // loop
        var id = setInterval(run, 16);
        input.interval = id;
    }
};

function run ()
{
    // input/cpu/screen update
    input.update();
    processor.Run();
    screen.render();
}

oReq.send(null);
