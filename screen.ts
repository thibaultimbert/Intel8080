// Class for emulation of the Space Invaders arcade video system
//
// This file is a port from ActionScript - http://www.bytearray.org/?p=622
// Original class (BlitzMax) - http://rveilleux.googlepages.com/blitzmaxarcadeemulatortutorial

module video
{
    export class Screen
    {
        cpu;
        canvas;
        width;
        height;
        transparent;
        fillColor;
        imageData;

        constructor(cpu, canvas, width, height, transparent, fillColor)
        {
            this.width = width;
            this.height = height;
            this.transparent = transparent;
            this.fillColor = fillColor;
            this.canvas = canvas;
            this.cpu = cpu;
            this.canvas.fillRect(0, 0, width, height);
            this.imageData = this.canvas.createImageData(width, height);
        }

        render()
        {
            var a = 0;
            this.canvas.fillRect(0, 0, this.width, this.height);
            this.copyScreen();
        }

        copyScreen()
        {
            var color = 0;
            var k = 0;
            var src;
            var vram;

            for (var j = 0; j< this.height; j++)
            {
                src = 0x2400 + (j << 5);
                k = 0;
                for (var i = 0; i< 32; i++)
                {
                    vram = this.cpu.memory[src];
                    src += 1;
                    for (var b = 0; b<8; b++)
                    {
                        color = 0xFF000000;
                        if ( vram&1 ) color = 0xFFFFFFFF;
                        this.setPixel(this.imageData, k, j, color);
                        k++;
                        vram = vram >> 1;
                    }
                }
            }
            this.canvas.putImageData(this.imageData, 0, 0);
        }

        setPixel(imagedata, x, y, color)
        {
            var i = (y * (imagedata.width | 0) + x) * 4;
            imagedata.data[i++] = (color >> 16) & 0xFF;
            imagedata.data[i++] = (color >> 8) & 0xFF;
            imagedata.data[i++] = color & 0xFF;
            imagedata.data[i] = (color >> 24) & 0xFF;
        }
    }
}