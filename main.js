var oReq = new XMLHttpRequest();
oReq.open("GET", "https://dl.dropbox.com/u/7009356/invaders.rom", true);
oReq.responseType = "arraybuffer";
var processor = new cpu.Intel8080();
var canvas = document.createElement("canvas");
canvas.width = 256;
canvas.height = 224;
var container = document.createElement("div");
container.id = 'container';
container.appendChild(canvas);
document.body.appendChild(container);
var context = canvas.getContext("2d");
var screen = new video.Screen(processor, context, 256, 224, false, 0);
var input = new io.Input(document, this, processor);
input.init();
processor.setInput(input);
oReq.onload = function (oEvent) {
    var arrayBuffer = oReq.response;
    if(arrayBuffer) {
        var source = new Uint8Array(arrayBuffer);
        if(source.length > 8192) {
            throw new Error("Bad rom size!");
        }
        var byteArray = new ArrayBuffer(16384);
        var view = new Uint8Array(byteArray);
        view.set(source);
        processor.memory = view;
        processor.init();
        var id = setInterval(run, 16);
        input.interval = id;
    }
};
function run() {
    input.update();
    processor.Run();
    screen.render();
}
oReq.send(null);
//@ sourceMappingURL=main.js.map
