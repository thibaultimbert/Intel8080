var io;
(function (io) {
    var Input = (function () {
        function Input(document, window, cpu) {
            this.OUT_PORT2 = 0;
            this.OUT_PORT3 = 0;
            this.OUT_PORT4LO = 0;
            this.OUT_PORT4HI = 0;
            this.OUT_PORT5 = 0;
            this.IN_PORT1 = 0;
            this.IN_PORT2 = 0;
            this.SINGLE = 0x53;
            this.MULTIPLAYER = 0xBA;
            this.COIN = 0x43;
            this.LEFT = 0x25;
            this.RIGHT = 0x27;
            this.SPACE = 0x20;
            this.P = 0x50;
            this.RESET = 0x52;
            this.document = document;
            this.window = window;
            this.cpu = cpu;
            this.mapper = [];
            this.paused = false;
            var ref = this;
            this.document.onkeydown = function (e) {
                ref.mapper[e.keyCode] = true;
                if(ref.mapper[ref.P]) {
                    if(!ref.paused) {
                        clearInterval(ref.id);
                    } else {
                        ref.id = setInterval(ref.window.run, 16);
                    }
                    ref.paused = !ref.paused;
                }
            };
            this.document.onkeyup = function (e) {
                ref.mapper[e.keyCode] = false;
            };
        }
        Input.prototype.init = function () {
            this.IN_PORT2 |= (0x1 | 0x2);
            this.IN_PORT2 |= (0x80);
        };
        Input.prototype.update = function () {
            this.IN_PORT1 = this.IN_PORT1 & (~(0x1 | 0x2 | 0x4 | 0x10 | 0x20 | 0x40));
            this.IN_PORT2 = this.IN_PORT2 & (~(0x4 | 0x10 | 0x20 | 0x40));
            if(this.mapper[this.COIN]) {
                this.IN_PORT1 |= 0x1;
            }
            if(this.mapper[this.MULTIPLAYER]) {
                this.IN_PORT1 |= 0x2;
            }
            if(this.mapper[this.SINGLE]) {
                this.IN_PORT1 |= 0x4;
            }
            if(this.mapper[this.LEFT]) {
                this.IN_PORT1 |= 0x20;
                this.IN_PORT2 |= 0x20;
            }
            if(this.mapper[this.RIGHT]) {
                this.IN_PORT1 |= 0x40;
                this.IN_PORT2 |= 0x40;
            }
            if(this.mapper[this.SPACE]) {
                this.IN_PORT1 |= 0x10;
                this.IN_PORT2 |= 0x10;
            }
            if(this.mapper[this.RESET]) {
                this.cpu.Reset();
            }
        };
        Input.prototype.OutPutPort = function (port, value) {
            switch(port) {
                case 2:
                    this.OUT_PORT2 = value;
                    break;
                case 3:
                    this.OUT_PORT3 = value;
                    break;
                case 4:
                    this.OUT_PORT4LO = this.OUT_PORT4HI;
                    this.OUT_PORT4HI = value;
                    break;
                case 5:
                    this.OUT_PORT5 = value;
                    break;
            }
        };
        Input.prototype.InputPort = function (port) {
            var result = 0;
            switch(port) {
                case 1:
                    result = this.IN_PORT1;
                    break;
                case 2:
                    result = this.IN_PORT2;
                    break;
                case 3:
                    result = ((((this.OUT_PORT4HI << 8) | this.OUT_PORT4LO) << this.OUT_PORT2) >> 8);
                    break;
            }
            return result;
        };
        Object.defineProperty(Input.prototype, "interval", {
            set: function (intervalID) {
                this.id = intervalID;
            },
            enumerable: true,
            configurable: true
        });
        return Input;
    })();
    io.Input = Input;    
})(io || (io = {}));
//@ sourceMappingURL=input.js.map
