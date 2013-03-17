module io
{
    export class Input
    {
        OUT_PORT2 = 0;
        OUT_PORT3 = 0;
        OUT_PORT4LO = 0;
        OUT_PORT4HI = 0;
        OUT_PORT5 = 0;
        IN_PORT1 = 0;
        IN_PORT2 = 0;
    
        SINGLE = 0x53;
        MULTIPLAYER = 0xBA;
        COIN = 0x43;

        LEFT = 0x25;
        RIGHT = 0x27;
        SPACE = 0x20;
        P = 0x50;
        RESET = 0x52;

        mapper;
        paused;
        document;
        id;
        window;
        cpu;

    constructor(document, window, cpu)
    {
        this.document = document;
        this.window = window;
        this.cpu = cpu;
        this.mapper = [];
        this.paused = false;
        var ref = this;
        this.document.onkeydown = function(e) {

            ref.mapper[e.keyCode] = true;

            if ( ref.mapper[ref.P] )
            {
                if ( !ref.paused )
                {
                    clearInterval(ref.id)
                } else
                {
                    ref.id = setInterval(ref.window.run, 16);
                }
                ref.paused = !ref.paused;
            }
        }
        this.document.onkeyup = function(e) {
            ref.mapper[e.keyCode] = false;
        }
    }

    init()
    {
        this.IN_PORT2 |= (0x1 | 0x2);
        this.IN_PORT2 |= (0x80);
    }

    update()
    {
        this.IN_PORT1 = this.IN_PORT1 & (~(0x1 | 0x2 | 0x4 | 0x10 | 0x20 | 0x40));
        this.IN_PORT2 = this.IN_PORT2 & (~(0x4 | 0x10 | 0x20 | 0x40));

        if ( this.mapper[this.COIN] ) this.IN_PORT1 |= 0x1;
        if ( this.mapper[this.MULTIPLAYER] ) this.IN_PORT1 |= 0x2;
        if ( this.mapper[this.SINGLE] ) this.IN_PORT1 |= 0x4;

        if ( this.mapper[this.LEFT] )
        {
            this.IN_PORT1 |= 0x20;
            this.IN_PORT2 |= 0x20;
        }

        if ( this.mapper[this.RIGHT] )
        {
            this.IN_PORT1 |= 0x40;
            this.IN_PORT2 |= 0x40;
        }

        if ( this.mapper[this.SPACE] )
        {
            this.IN_PORT1 |= 0x10;
            this.IN_PORT2 |= 0x10;
        }

        if ( this.mapper[this.RESET] )
        {
            this.cpu.Reset();
        }

    }

    OutPutPort(port, value)
    {
        switch  ( port )
        {
            case 2:
                this.OUT_PORT2 = value;
                break;
            case 3:
                this.OUT_PORT3 = value;
                break;
            case 4:
                this.OUT_PORT4LO = this.OUT_PORT4HI
                this.OUT_PORT4HI = value;
                break;
            case 5:
                this.OUT_PORT5 = value;
                break;
        }
    }

    InputPort(port)
    {
        var result = 0;
        switch ( port )
        {
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
        return result
    }

    set interval(intervalID)
    {
       this.id = intervalID;
    }
    }
}