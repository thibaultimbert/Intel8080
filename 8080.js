var cpu;
(function (cpu) {
    var Intel8080 = (function () {
        function Intel8080() {
            this.PC = 0;
            this.SP = 0;
            this.A = 0;
            this.B = 0;
            this.C = 0;
            this.D = 0;
            this.E = 0;
            this.H = 0;
            this.L = 0;
            this.BC = 0;
            this.DE = 0;
            this.HL = 0;
            this.SIGN = 0;
            this.ZERO = 0;
            this.HALFCARRY = 0;
            this.PARITY = 0;
            this.CARRY = 0;
            this.INTERRUPT = 0;
            this.current_inst = 0;
            this.interrupt_alternate = 0;
            this.count_instructions = 0;
            this.disassembly_pc = 0;
            this.mappingTable = new Array(0x100);
            this.instruction_per_frame = 4000;
            this.half_instruction_per_frame = 4000 >> 1;
        }
        Intel8080.prototype.Instruction_NOP = function () {
        };
        Intel8080.prototype.Instruction_JMP = function () {
            var condition = true;
            var data16 = this.FetchRomShort();
            switch(this.current_inst) {
                case 0xC3:
                    break;
                case 0xC2:
                    condition = !this.ZERO;
                    break;
                case 0XCA:
                    condition = Boolean(this.ZERO);
                    break;
                case 0xD2:
                    condition = !this.CARRY;
                    break;
                case 0xDA:
                    condition = Boolean(this.CARRY);
                    break;
                case 0xF2:
                    condition = !this.SIGN;
                    break;
                case 0xFA:
                    condition = Boolean(this.SIGN);
                    break;
            }
            if(condition) {
                this.PC = data16;
            }
        };
        Intel8080.prototype.Instruction_LXI_BC = function () {
            var data16 = this.FetchRomShort();
            this.SetBC(data16);
        };
        Intel8080.prototype.Instruction_LXI_DE = function () {
            var data16 = this.FetchRomShort();
            this.SetDE(data16);
        };
        Intel8080.prototype.Instruction_LXI_HL = function () {
            var data16 = this.FetchRomShort();
            this.SetHL(data16);
        };
        Intel8080.prototype.Instruction_LXI_SP = function () {
            var data16 = this.FetchRomShort();
            this.SetSP(data16);
        };
        Intel8080.prototype.Instruction_MVI_A = function () {
            var data8 = this.FetchRomByte();
            this.SetA(data8);
        };
        Intel8080.prototype.Instruction_MVI_B = function () {
            var data8 = this.FetchRomByte();
            this.SetB(data8);
        };
        Intel8080.prototype.Instruction_MVI_C = function () {
            var data8 = this.FetchRomByte();
            this.SetC(data8);
        };
        Intel8080.prototype.Instruction_MVI_D = function () {
            var data8 = this.FetchRomByte();
            this.SetD(data8);
        };
        Intel8080.prototype.Instruction_MVI_E = function () {
            var data8 = this.FetchRomByte();
            this.SetE(data8);
        };
        Intel8080.prototype.Instruction_MVI_H = function () {
            var data8 = this.FetchRomByte();
            this.SetH(data8);
        };
        Intel8080.prototype.Instruction_MVI_L = function () {
            var data8 = this.FetchRomByte();
            this.SetL(data8);
        };
        Intel8080.prototype.Instruction_MVI_HL = function () {
            var data8 = this.FetchRomByte();
            this.WriteByte(this.HL, data8);
        };
        Intel8080.prototype.Instruction_CALL = function () {
            var condition = true;
            var data16 = this.FetchRomShort();
            switch(this.current_inst) {
                case 0xCD:
                    break;
                case 0xC4:
                    condition = !this.ZERO;
                    break;
                case 0xCC:
                    condition = Boolean(this.ZERO);
                    break;
                case 0xD4:
                    condition = !this.CARRY;
                    break;
                case 0xDC:
                    condition = Boolean(this.CARRY);
                    break;
            }
            if(condition) {
                this.StackPush(this.PC);
                this.PC = data16;
            }
        };
        Intel8080.prototype.Instruction_RET = function () {
            var condition = true;
            switch(this.current_inst) {
                case 0xC9:
                    break;
                case 0xC0:
                    condition = !this.ZERO;
                    break;
                case 0xC8:
                    condition = Boolean(this.ZERO);
                    break;
                case 0xD0:
                    condition = !this.CARRY;
                    break;
                case 0xD8:
                    condition = Boolean(this.CARRY);
                    break;
            }
            if(condition) {
                this.PC = this.StackPop();
            }
        };
        Intel8080.prototype.Instruction_LDA = function () {
            var source;
            switch(this.current_inst) {
                case 0x0A:
                    source = this.BC;
                    break;
                case 0x1A:
                    source = this.DE;
                    break;
                case 0x3A:
                    source = this.FetchRomShort();
                    break;
            }
            this.SetA(this.ReadByte(source));
        };
        Intel8080.prototype.Instruction_PUSH = function () {
            var value;
            switch(this.current_inst) {
                case 0xC5:
                    value = this.BC;
                    break;
                case 0xD5:
                    value = this.DE;
                    break;
                case 0xE5:
                    value = this.HL;
                    break;
                case 0xF5:
                    value = (this.A << 8);
                    if(this.SIGN) {
                        value |= 0x80;
                    }
                    if(this.ZERO) {
                        value |= 0x40;
                    }
                    if(this.INTERRUPT) {
                        value |= 0x20;
                    }
                    if(this.HALFCARRY) {
                        value |= 0x10;
                    }
                    if(this.CARRY) {
                        value |= 0x1;
                    }
                    break;
            }
            this.StackPush(value);
        };
        Intel8080.prototype.Instruction_POP_BC = function () {
            var value = this.StackPop();
            this.SetBC(value);
        };
        Intel8080.prototype.Instruction_POP_DE = function () {
            var value = this.StackPop();
            this.SetDE(value);
        };
        Intel8080.prototype.Instruction_POP_HL = function () {
            var value = this.StackPop();
            this.SetHL(value);
        };
        Intel8080.prototype.Instruction_POP_FLAGS = function () {
            var value = this.StackPop();
            this.A = (value >> 8);
            this.SIGN = (value & 0x80);
            this.ZERO = (value & 0x40);
            this.INTERRUPT = (value & 0x20);
            this.HALFCARRY = (value & 0x10);
            this.CARRY = (value & 0x1);
        };
        Intel8080.prototype.Instruction_MOVHL = function () {
            switch(this.current_inst) {
                case 0x77:
                    this.WriteByte(this.HL, this.A);
                    break;
                case 0x70:
                    this.WriteByte(this.HL, this.B);
                    break;
                case 0x71:
                    this.WriteByte(this.HL, this.C);
                    break;
                case 0x72:
                    this.WriteByte(this.HL, this.D);
                    break;
                case 0x73:
                    this.WriteByte(this.HL, this.E);
                    break;
                case 0x74:
                    this.WriteByte(this.HL, this.H);
                    break;
                case 0x75:
                    this.WriteByte(this.HL, this.L);
                    break;
            }
        };
        Intel8080.prototype.Instruction_MOV = function () {
            switch(this.current_inst) {
                case 0x7F:
                    this.SetA(this.A);
                    break;
                case 0x78:
                    this.SetA(this.B);
                    break;
                case 0x79:
                    this.SetA(this.C);
                    break;
                case 0x7A:
                    this.SetA(this.D);
                    break;
                case 0x7B:
                    this.SetA(this.E);
                    break;
                case 0x7C:
                    this.SetA(this.H);
                    break;
                case 0x7D:
                    this.SetA(this.L);
                    break;
                case 0x7E:
                    this.SetA(this.ReadByte(this.HL));
                    break;
                case 0x47:
                    this.SetB(this.A);
                    break;
                case 0x40:
                    this.SetB(this.B);
                    break;
                case 0x41:
                    this.SetB(this.C);
                    break;
                case 0x42:
                    this.SetB(this.D);
                    break;
                case 0x43:
                    this.SetB(this.E);
                    break;
                case 0x44:
                    this.SetB(this.H);
                    break;
                case 0x45:
                    this.SetB(this.L);
                    break;
                case 0x46:
                    this.SetB(this.ReadByte(this.HL));
                    break;
                case 0x4F:
                    this.SetC(this.A);
                    break;
                case 0x48:
                    this.SetC(this.B);
                    break;
                case 0x49:
                    this.SetC(this.C);
                    break;
                case 0x4A:
                    this.SetC(this.D);
                    break;
                case 0x4B:
                    this.SetC(this.E);
                    break;
                case 0x4C:
                    this.SetC(this.H);
                    break;
                case 0x4D:
                    this.SetC(this.L);
                    break;
                case 0x4E:
                    this.SetC(this.ReadByte(this.HL));
                    break;
                case 0x57:
                    this.SetD(this.A);
                    break;
                case 0x50:
                    this.SetD(this.B);
                    break;
                case 0x51:
                    this.SetD(this.C);
                    break;
                case 0x52:
                    this.SetD(this.D);
                    break;
                case 0x53:
                    this.SetD(this.E);
                    break;
                case 0x54:
                    this.SetD(this.H);
                    break;
                case 0x55:
                    this.SetD(this.L);
                    break;
                case 0x56:
                    this.SetD(this.ReadByte(this.HL));
                    break;
                case 0x5F:
                    this.SetE(this.A);
                    break;
                case 0x58:
                    this.SetE(this.B);
                    break;
                case 0x59:
                    this.SetE(this.C);
                    break;
                case 0x5A:
                    this.SetE(this.D);
                    break;
                case 0x5B:
                    this.SetE(this.E);
                    break;
                case 0x5C:
                    this.SetE(this.H);
                    break;
                case 0x5D:
                    this.SetE(this.L);
                    break;
                case 0x5E:
                    this.SetE(this.ReadByte(this.HL));
                    break;
                case 0x67:
                    this.SetH(this.A);
                    break;
                case 0x60:
                    this.SetH(this.B);
                    break;
                case 0x61:
                    this.SetH(this.C);
                    break;
                case 0x62:
                    this.SetH(this.D);
                    break;
                case 0x63:
                    this.SetH(this.E);
                    break;
                case 0x64:
                    this.SetH(this.H);
                    break;
                case 0x65:
                    this.SetH(this.L);
                    break;
                case 0x66:
                    this.SetH(this.ReadByte(this.HL));
                    break;
                case 0x6F:
                    this.SetL(this.A);
                    break;
                case 0x68:
                    this.SetL(this.B);
                    break;
                case 0x69:
                    this.SetL(this.C);
                    break;
                case 0x6A:
                    this.SetL(this.D);
                    break;
                case 0x6B:
                    this.SetL(this.E);
                    break;
                case 0x6C:
                    this.SetL(this.H);
                    break;
                case 0x6D:
                    this.SetL(this.L);
                    break;
                case 0x6E:
                    this.SetL(this.ReadByte(this.HL));
                    break;
            }
        };
        Intel8080.prototype.Instruction_INX = function () {
            switch(this.current_inst) {
                case 0x03:
                    this.SetBC(this.BC + 1);
                    break;
                case 0x13:
                    this.SetDE(this.DE + 1);
                    break;
                case 0x23:
                    this.SetHL(this.HL + 1);
                    break;
                case 0x33:
                    this.SetSP(this.SP + 1);
                    break;
            }
        };
        Intel8080.prototype.Instruction_DAD_BC = function () {
            this.AddHL(this.BC);
        };
        Intel8080.prototype.Instruction_DAD_DE = function () {
            this.AddHL(this.DE);
        };
        Intel8080.prototype.Instruction_DAD_HL = function () {
            this.AddHL(this.HL);
        };
        Intel8080.prototype.Instruction_DAD_SP = function () {
            this.AddHL(this.SP);
        };
        Intel8080.prototype.AddHL = function (inValue) {
            var value = (this.HL + inValue);
            this.SetHL(value);
            this.CARRY = Number(value > 0xFFFF);
        };
        Intel8080.prototype.Instruction_DCX = function () {
            switch(this.current_inst) {
                case 0x0B:
                    this.SetBC(this.BC - 1);
                    break;
                case 0x1B:
                    this.SetDE(this.DE - 1);
                    break;
                case 0x2B:
                    this.SetHL(this.HL - 1);
                    break;
                case 0x3B:
                    this.SetSP(this.SP - 1);
                    break;
            }
        };
        Intel8080.prototype.Instruction_DEC = function () {
            switch(this.current_inst) {
                case 0x3D:
                    this.SetA(this.PerformDec(this.A));
                    break;
                case 0x05:
                    this.SetB(this.PerformDec(this.B));
                    break;
                case 0x0D:
                    this.SetC(this.PerformDec(this.C));
                    break;
                case 0x15:
                    this.SetD(this.PerformDec(this.D));
                    break;
                case 0x1D:
                    this.SetE(this.PerformDec(this.E));
                    break;
                case 0x25:
                    this.SetH(this.PerformDec(this.H));
                    break;
                case 0x2D:
                    this.SetL(this.PerformDec(this.L));
                    break;
                case 0x35:
                    var data8 = this.ReadByte(this.HL);
                    this.WriteByte(this.HL, this.PerformDec(data8));
                    break;
            }
        };
        Intel8080.prototype.Instruction_INC = function () {
            switch(this.current_inst) {
                case 0x3C:
                    this.SetA(this.PerformInc(this.A));
                    break;
                case 0x04:
                    this.SetB(this.PerformInc(this.B));
                    break;
                case 0x0C:
                    this.SetC(this.PerformInc(this.C));
                    break;
                case 0x14:
                    this.SetD(this.PerformInc(this.D));
                    break;
                case 0x1C:
                    this.SetE(this.PerformInc(this.E));
                    break;
                case 0x24:
                    this.SetH(this.PerformInc(this.H));
                    break;
                case 0x2C:
                    this.SetL(this.PerformInc(this.L));
                    break;
                case 0x34:
                    var data8 = this.ReadByte(this.HL);
                    this.WriteByte(this.HL, this.PerformInc(data8));
                    break;
            }
        };
        Intel8080.prototype.Instruction_AND = function () {
            switch(this.current_inst) {
                case 0xA7:
                    this.PerformAnd(this.A);
                    break;
                case 0xA0:
                    this.PerformAnd(this.B);
                    break;
                case 0xA1:
                    this.PerformAnd(this.C);
                    break;
                case 0xA2:
                    this.PerformAnd(this.D);
                    break;
                case 0xA3:
                    this.PerformAnd(this.E);
                    break;
                case 0xA4:
                    this.PerformAnd(this.H);
                    break;
                case 0xA5:
                    this.PerformAnd(this.L);
                    break;
                case 0xA6:
                    this.PerformAnd(this.ReadByte(this.HL));
                    break;
                case 0xE6:
                    var immediate = this.FetchRomByte();
                    this.PerformAnd(immediate);
                    break;
            }
        };
        Intel8080.prototype.Instruction_XOR = function () {
            switch(this.current_inst) {
                case 0xAF:
                    this.PerformXor(this.A);
                    break;
                case 0xA8:
                    this.PerformXor(this.B);
                    break;
                case 0xA9:
                    this.PerformXor(this.C);
                    break;
                case 0xAA:
                    this.PerformXor(this.D);
                    break;
                case 0xAB:
                    this.PerformXor(this.E);
                    break;
                case 0xAC:
                    this.PerformXor(this.H);
                    break;
                case 0xAD:
                    this.PerformXor(this.L);
                    break;
                case 0xAE:
                    this.PerformXor(this.ReadByte(this.HL));
                    break;
                case 0xEE:
                    var immediate = this.FetchRomByte();
                    this.PerformXor(immediate);
                    break;
            }
        };
        Intel8080.prototype.Instruction_OR = function () {
            switch(this.current_inst) {
                case 0xB7:
                    this.PerformOr(this.A);
                    break;
                case 0xB0:
                    this.PerformOr(this.B);
                    break;
                case 0xB1:
                    this.PerformOr(this.C);
                    break;
                case 0xB2:
                    this.PerformOr(this.D);
                    break;
                case 0xB3:
                    this.PerformOr(this.E);
                    break;
                case 0xB4:
                    this.PerformOr(this.H);
                    break;
                case 0xB5:
                    this.PerformOr(this.L);
                    break;
                case 0xB6:
                    this.PerformOr(this.ReadByte(this.HL));
                    break;
                case 0xF6:
                    var immediate = this.FetchRomByte();
                    this.PerformOr(immediate);
                    break;
            }
        };
        Intel8080.prototype.Instruction_ADD = function () {
            switch(this.current_inst) {
                case 0x87:
                    this.PerformByteAdd(this.A);
                    break;
                case 0x80:
                    this.PerformByteAdd(this.B);
                    break;
                case 0x81:
                    this.PerformByteAdd(this.C);
                    break;
                case 0x82:
                    this.PerformByteAdd(this.D);
                    break;
                case 0x83:
                    this.PerformByteAdd(this.E);
                    break;
                case 0x84:
                    this.PerformByteAdd(this.H);
                    break;
                case 0x85:
                    this.PerformByteAdd(this.L);
                    break;
                case 0x86:
                    this.PerformByteAdd(this.ReadByte(this.HL));
                    break;
                case 0xC6:
                    var immediate = this.FetchRomByte();
                    this.PerformByteAdd(immediate);
                    break;
            }
        };
        Intel8080.prototype.Instruction_ADC = function () {
            var carryvalue = 0;
            if(this.CARRY) {
                carryvalue = 1;
            }
            switch(this.current_inst) {
                case 0x8F:
                    this.PerformByteAdd(this.A, carryvalue);
                    break;
                case 0x88:
                    this.PerformByteAdd(this.B, carryvalue);
                    break;
                case 0x89:
                    this.PerformByteAdd(this.C, carryvalue);
                    break;
                case 0x8A:
                    this.PerformByteAdd(this.D, carryvalue);
                    break;
                case 0x8B:
                    this.PerformByteAdd(this.E, carryvalue);
                    break;
                case 0x8C:
                    this.PerformByteAdd(this.H, carryvalue);
                    break;
                case 0x8D:
                    this.PerformByteAdd(this.L, carryvalue);
                    break;
                case 0x8E:
                    this.PerformByteAdd(this.ReadByte(this.HL), carryvalue);
                    break;
                case 0xCE:
                    var immediate = this.FetchRomByte();
                    this.PerformByteAdd(immediate, carryvalue);
                    break;
            }
        };
        Intel8080.prototype.Instruction_SUB = function () {
            switch(this.current_inst) {
                case 0x97:
                    this.PerformByteSub(this.A);
                    break;
                case 0x90:
                    this.PerformByteSub(this.B);
                    break;
                case 0x91:
                    this.PerformByteSub(this.C);
                    break;
                case 0x92:
                    this.PerformByteSub(this.D);
                    break;
                case 0x93:
                    this.PerformByteSub(this.E);
                    break;
                case 0x94:
                    this.PerformByteSub(this.H);
                    break;
                case 0x95:
                    this.PerformByteSub(this.L);
                    break;
                case 0x96:
                    this.PerformByteSub(this.ReadByte(this.HL));
                    break;
                case 0xD6:
                    var immediate = this.FetchRomByte();
                    this.PerformByteSub(immediate);
                    break;
            }
        };
        Intel8080.prototype.Instruction_SBBI = function () {
            var immediate = this.FetchRomByte();
            var carryvalue = 0;
            if(this.CARRY) {
                carryvalue = 1;
            }
            this.PerformByteSub(immediate, carryvalue);
        };
        Intel8080.prototype.Instruction_CMP = function () {
            var value = 0;
            switch(this.current_inst) {
                case 0xBF:
                    value = this.A;
                    break;
                case 0xB8:
                    value = this.B;
                    break;
                case 0xB9:
                    value = this.C;
                    break;
                case 0xBA:
                    value = this.D;
                    break;
                case 0xBB:
                    value = this.E;
                    break;
                case 0xBC:
                    value = this.H;
                    break;
                case 0xBD:
                    value = this.L;
                    break;
                case 0xBE:
                    value = this.ReadByte(this.HL);
                    break;
                case 0xFE:
                    value = this.FetchRomByte();
                    break;
            }
            this.PerformCompSub(value);
        };
        Intel8080.prototype.Instruction_XCHG = function () {
            var temp = this.DE;
            this.SetDE(this.HL);
            this.SetHL(temp);
        };
        Intel8080.prototype.Instruction_XTHL = function () {
            var temp = this.H;
            this.SetH(this.ReadByte(this.SP + 1));
            this.WriteByte(this.SP + 1, temp);
            var temp = this.L;
            this.SetL(this.ReadByte(this.SP));
            this.WriteByte(this.SP, temp);
        };
        Intel8080.prototype.Instruction_OUTP = function () {
            var port = this.FetchRomByte();
            this.io.OutPutPort(port, this.A);
        };
        Intel8080.prototype.Instruction_INP = function () {
            var port = this.FetchRomByte();
            this.SetA(this.io.InputPort(port));
        };
        Intel8080.prototype.Instruction_PCHL = function () {
            this.PC = this.HL;
        };
        Intel8080.prototype.Instruction_RST = function () {
            var address;
            switch(this.current_inst) {
                case 0xC7:
                    address = 0x0;
                    break;
                case 0xCF:
                    address = 0x8;
                    break;
                case 0xD7:
                    address = 0x10;
                    break;
                case 0xDF:
                    address = 0x18;
                    break;
                case 0xE7:
                    address = 0x20;
                    break;
                case 0xEF:
                    address = 0x28;
                    break;
                case 0xF7:
                    address = 0x30;
                    break;
                case 0xFF:
                    address = 0x38;
                    break;
            }
            this.StackPush(this.PC);
            this.PC = address;
        };
        Intel8080.prototype.Instruction_RLC = function () {
            this.SetA((this.A << 1) | (this.A >> 7));
            this.CARRY = (this.A & 1);
        };
        Intel8080.prototype.Instruction_RAL = function () {
            var temp = this.A;
            this.SetA(this.A << 1);
            if(this.CARRY) {
                this.SetA(this.A | 1);
            }
            this.CARRY = (temp & 0x80);
        };
        Intel8080.prototype.Instruction_RRC = function () {
            this.SetA((this.A >> 1) | (this.A << 7));
            this.CARRY = (this.A & 0x80);
        };
        Intel8080.prototype.Instruction_RAR = function () {
            var temp = this.A & 0xFF;
            this.SetA(this.A >> 1);
            if(this.CARRY) {
                this.SetA(this.A | 0x80);
            }
            this.CARRY = (temp & 1);
        };
        Intel8080.prototype.Instruction_RIM = function () {
        };
        Intel8080.prototype.Instruction_STA = function () {
            switch(this.current_inst) {
                case 0x02:
                    this.WriteByte(this.BC, this.A);
                    break;
                case 0x12:
                    this.WriteByte(this.DE, this.A);
                    break;
                case 0x32:
                    var immediate = this.FetchRomShort();
                    this.WriteByte(immediate, this.A);
                    break;
            }
        };
        Intel8080.prototype.Instruction_DI = function () {
            this.INTERRUPT = 0;
        };
        Intel8080.prototype.Instruction_EI = function () {
            this.INTERRUPT = 1;
        };
        Intel8080.prototype.Instruction_STC = function () {
            this.CARRY = 1;
        };
        Intel8080.prototype.Instruction_CMC = function () {
            this.CARRY = Number(!this.CARRY);
        };
        Intel8080.prototype.Instruction_LHLD = function () {
            var immediate = this.FetchRomShort();
            this.SetHL(this.ReadShort(immediate));
        };
        Intel8080.prototype.Instruction_SHLD = function () {
            var immediate = this.FetchRomShort();
            this.WriteShort(immediate, this.HL);
        };
        Intel8080.prototype.Instruction_DAA = function () {
            if(((this.A & 0x0F) > 9) || (this.HALFCARRY)) {
                this.A += 0x06;
                this.HALFCARRY = 1;
            } else {
                this.HALFCARRY = 0;
            }
            if((this.A > 0x9F) || (this.CARRY)) {
                this.A += 0x60;
                this.CARRY = 1;
            } else {
                this.CARRY = 0;
            }
            this.SetFlagZeroSign();
        };
        Intel8080.prototype.Instruction_CMA = function () {
            this.SetA(this.A ^ 0xFF);
        };
        Intel8080.prototype.SetFlagZeroSign = function () {
            this.ZERO = Number(this.A == 0);
            this.SIGN = (this.A & 0x80);
        };
        Intel8080.prototype.PerformAnd = function (inValue) {
            this.SetA(this.A & inValue);
            this.CARRY = 0;
            this.HALFCARRY = 0;
            this.SetFlagZeroSign();
        };
        Intel8080.prototype.PerformXor = function (inValue) {
            this.SetA(this.A ^ inValue);
            this.CARRY = 0;
            this.HALFCARRY = 0;
            this.SetFlagZeroSign();
        };
        Intel8080.prototype.PerformOr = function (inValue) {
            this.SetA(this.A | inValue);
            this.CARRY = 0;
            this.HALFCARRY = 0;
            this.SetFlagZeroSign();
        };
        Intel8080.prototype.PerformByteAdd = function (inValue, inCarryValue) {
            if (typeof inCarryValue === "undefined") { inCarryValue = 0; }
            var value = (this.A + inValue + inCarryValue) & 0xFF;
            this.HALFCARRY = ((this.A ^ inValue ^ value) & 0x10);
            this.SetA(value);
            this.CARRY = Number(value > 255);
            this.SetFlagZeroSign();
        };
        Intel8080.prototype.PerformInc = function (inSource) {
            var value = (inSource + 1) & 0xFF;
            this.HALFCARRY = Number((value & 0xF) != 0);
            this.ZERO = Number((value & 255) == 0);
            this.SIGN = (value & 128) & 0xFF;
            return value;
        };
        Intel8080.prototype.PerformDec = function (inSource) {
            var value = (inSource - 1) & 0xFF;
            this.HALFCARRY = Number((value & 0xF) == 0);
            this.ZERO = Number((value & 255) == 0);
            this.SIGN = (value & 128);
            return value;
        };
        Intel8080.prototype.PerformByteSub = function (inValue, inCarryValue) {
            if (typeof inCarryValue === "undefined") { inCarryValue = 0; }
            var value = (this.A - inValue - inCarryValue) & 0xFF;
            this.CARRY = Number((value >= this.A) && (inValue | inCarryValue));
            this.HALFCARRY = ((this.A ^ inValue ^ value) & 0x10);
            this.SetA(value);
            this.SetFlagZeroSign();
        };
        Intel8080.prototype.PerformCompSub = function (inValue) {
            var value = (this.A - inValue) & 0xFF;
            this.CARRY = Number(((value >= this.A) && (inValue)));
            this.HALFCARRY = ((this.A ^ inValue ^ value) & 0x10);
            this.ZERO = Number((value == 0));
            this.SIGN = (value & 128);
        };
        Intel8080.prototype.init = function () {
            this._memory.length = 16384;
            this.Reset();
            this.InitTables();
        };
        Intel8080.prototype.setInput = function (input) {
            this.io = input;
        };
        Intel8080.prototype.InitTables = function () {
            var lng = this._memory.length;
            var code;
            for(var i = 0; i < lng; i++) {
                code = this._memory[i];
                switch(code) {
                    case 0x00:
                        this.mappingTable[code] = this.Instruction_NOP;
                        break;
                    case 0x01:
                        this.mappingTable[code] = this.Instruction_LXI_BC;
                        break;
                    case 0x02:
                        this.mappingTable[code] = this.Instruction_STA;
                        break;
                    case 0x03:
                        this.mappingTable[code] = this.Instruction_INX;
                        break;
                    case 0x04:
                        this.mappingTable[code] = this.Instruction_INC;
                        break;
                    case 0x05:
                        this.mappingTable[code] = this.Instruction_DEC;
                        break;
                    case 0x06:
                        this.mappingTable[code] = this.Instruction_MVI_B;
                        break;
                    case 0x07:
                        this.mappingTable[code] = this.Instruction_RLC;
                        break;
                    case 0x09:
                        this.mappingTable[code] = this.Instruction_DAD_BC;
                        break;
                    case 0x0A:
                        this.mappingTable[code] = this.Instruction_LDA;
                        break;
                    case 0x0B:
                        this.mappingTable[code] = this.Instruction_DCX;
                        break;
                    case 0x0C:
                        this.mappingTable[code] = this.Instruction_INC;
                        break;
                    case 0x0D:
                        this.mappingTable[code] = this.Instruction_DEC;
                        break;
                    case 0x0E:
                        this.mappingTable[code] = this.Instruction_MVI_C;
                        break;
                    case 0x0F:
                        this.mappingTable[code] = this.Instruction_RRC;
                        break;
                    case 0x11:
                        this.mappingTable[code] = this.Instruction_LXI_DE;
                        break;
                    case 0x12:
                        this.mappingTable[code] = this.Instruction_STA;
                        break;
                    case 0x13:
                        this.mappingTable[code] = this.Instruction_INX;
                        break;
                    case 0x14:
                        this.mappingTable[code] = this.Instruction_INC;
                        break;
                    case 0x15:
                        this.mappingTable[code] = this.Instruction_DEC;
                        break;
                    case 0x16:
                        this.mappingTable[code] = this.Instruction_MVI_D;
                        break;
                    case 0x17:
                        this.mappingTable[code] = this.Instruction_RAL;
                        break;
                    case 0x19:
                        this.mappingTable[code] = this.Instruction_DAD_DE;
                        break;
                    case 0x1A:
                        this.mappingTable[code] = this.Instruction_LDA;
                        break;
                    case 0x1B:
                        this.mappingTable[code] = this.Instruction_DCX;
                        break;
                    case 0x1C:
                        this.mappingTable[code] = this.Instruction_INC;
                        break;
                    case 0x1D:
                        this.mappingTable[code] = this.Instruction_DEC;
                        break;
                    case 0x1E:
                        this.mappingTable[code] = this.Instruction_MVI_E;
                        break;
                    case 0x1F:
                        this.mappingTable[code] = this.Instruction_RAR;
                        break;
                    case 0x20:
                        this.mappingTable[code] = this.Instruction_RIM;
                        break;
                    case 0x21:
                        this.mappingTable[code] = this.Instruction_LXI_HL;
                        break;
                    case 0x22:
                        this.mappingTable[code] = this.Instruction_SHLD;
                        break;
                    case 0x23:
                        this.mappingTable[code] = this.Instruction_INX;
                        break;
                    case 0x24:
                        this.mappingTable[code] = this.Instruction_INC;
                        break;
                    case 0x25:
                        this.mappingTable[code] = this.Instruction_DEC;
                        break;
                    case 0x26:
                        this.mappingTable[code] = this.Instruction_MVI_H;
                        break;
                    case 0x27:
                        this.mappingTable[code] = this.Instruction_DAA;
                        break;
                    case 0x29:
                        this.mappingTable[code] = this.Instruction_DAD_HL;
                        break;
                    case 0x2A:
                        this.mappingTable[code] = this.Instruction_LHLD;
                        break;
                    case 0x2B:
                        this.mappingTable[code] = this.Instruction_DCX;
                        break;
                    case 0x2C:
                        this.mappingTable[code] = this.Instruction_INC;
                        break;
                    case 0x2D:
                        this.mappingTable[code] = this.Instruction_DEC;
                        break;
                    case 0x2E:
                        this.mappingTable[code] = this.Instruction_MVI_L;
                        break;
                    case 0x2F:
                        this.mappingTable[code] = this.Instruction_CMA;
                        break;
                    case 0x31:
                        this.mappingTable[code] = this.Instruction_LXI_SP;
                        break;
                    case 0x32:
                        this.mappingTable[code] = this.Instruction_STA;
                        break;
                    case 0x33:
                        this.mappingTable[code] = this.Instruction_INX;
                        break;
                    case 0x34:
                        this.mappingTable[code] = this.Instruction_INC;
                        break;
                    case 0x35:
                        this.mappingTable[code] = this.Instruction_DEC;
                        break;
                    case 0x36:
                        this.mappingTable[code] = this.Instruction_MVI_HL;
                        break;
                    case 0x37:
                        this.mappingTable[code] = this.Instruction_STC;
                        break;
                    case 0x39:
                        this.mappingTable[code] = this.Instruction_DAD_SP;
                        break;
                    case 0x3A:
                        this.mappingTable[code] = this.Instruction_LDA;
                        break;
                    case 0x3B:
                        this.mappingTable[code] = this.Instruction_DCX;
                        break;
                    case 0x3C:
                        this.mappingTable[code] = this.Instruction_INC;
                        break;
                    case 0x3D:
                        this.mappingTable[code] = this.Instruction_DEC;
                        break;
                    case 0x3E:
                        this.mappingTable[code] = this.Instruction_MVI_A;
                        break;
                    case 0x3F:
                        this.mappingTable[code] = this.Instruction_CMC;
                        break;
                    case 0x40:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x41:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x42:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x43:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x44:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x45:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x46:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x47:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x48:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x49:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x4A:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x4B:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x4C:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x4D:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x4E:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x4F:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x50:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x51:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x52:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x53:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x54:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x55:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x56:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x57:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x58:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x59:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x5A:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x5B:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x5C:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x5D:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x5E:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x5F:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x60:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x61:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x62:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x63:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x64:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x65:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x66:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x67:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x68:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x69:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x6A:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x6B:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x6C:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x6D:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x6E:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x6F:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x70:
                        this.mappingTable[code] = this.Instruction_MOVHL;
                        break;
                    case 0x71:
                        this.mappingTable[code] = this.Instruction_MOVHL;
                        break;
                    case 0x72:
                        this.mappingTable[code] = this.Instruction_MOVHL;
                        break;
                    case 0x73:
                        this.mappingTable[code] = this.Instruction_MOVHL;
                        break;
                    case 0x74:
                        this.mappingTable[code] = this.Instruction_MOVHL;
                        break;
                    case 0x75:
                        this.mappingTable[code] = this.Instruction_MOVHL;
                        break;
                    case 0x77:
                        this.mappingTable[code] = this.Instruction_MOVHL;
                        break;
                    case 0x78:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x79:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x7A:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x7B:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x7C:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x7D:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x7E:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x7F:
                        this.mappingTable[code] = this.Instruction_MOV;
                        break;
                    case 0x80:
                        this.mappingTable[code] = this.Instruction_ADD;
                        break;
                    case 0x81:
                        this.mappingTable[code] = this.Instruction_ADD;
                        break;
                    case 0x82:
                        this.mappingTable[code] = this.Instruction_ADD;
                        break;
                    case 0x83:
                        this.mappingTable[code] = this.Instruction_ADD;
                        break;
                    case 0x84:
                        this.mappingTable[code] = this.Instruction_ADD;
                        break;
                    case 0x85:
                        this.mappingTable[code] = this.Instruction_ADD;
                        break;
                    case 0x86:
                        this.mappingTable[code] = this.Instruction_ADD;
                        break;
                    case 0x87:
                        this.mappingTable[code] = this.Instruction_ADD;
                        break;
                    case 0x88:
                        this.mappingTable[code] = this.Instruction_ADC;
                        break;
                    case 0x89:
                        this.mappingTable[code] = this.Instruction_ADC;
                        break;
                    case 0x8A:
                        this.mappingTable[code] = this.Instruction_ADC;
                        break;
                    case 0x8B:
                        this.mappingTable[code] = this.Instruction_ADC;
                        break;
                    case 0x8C:
                        this.mappingTable[code] = this.Instruction_ADC;
                        break;
                    case 0x8D:
                        this.mappingTable[code] = this.Instruction_ADC;
                        break;
                    case 0x8E:
                        this.mappingTable[code] = this.Instruction_ADC;
                        break;
                    case 0x8F:
                        this.mappingTable[code] = this.Instruction_ADC;
                        break;
                    case 0x90:
                        this.mappingTable[code] = this.Instruction_SUB;
                        break;
                    case 0x91:
                        this.mappingTable[code] = this.Instruction_SUB;
                        break;
                    case 0x92:
                        this.mappingTable[code] = this.Instruction_SUB;
                        break;
                    case 0x93:
                        this.mappingTable[code] = this.Instruction_SUB;
                        break;
                    case 0x94:
                        this.mappingTable[code] = this.Instruction_SUB;
                        break;
                    case 0x95:
                        this.mappingTable[code] = this.Instruction_SUB;
                        break;
                    case 0x96:
                        this.mappingTable[code] = this.Instruction_SUB;
                        break;
                    case 0x97:
                        this.mappingTable[code] = this.Instruction_SUB;
                        break;
                    case 0xA0:
                        this.mappingTable[code] = this.Instruction_AND;
                        break;
                    case 0xA1:
                        this.mappingTable[code] = this.Instruction_AND;
                        break;
                    case 0xA2:
                        this.mappingTable[code] = this.Instruction_AND;
                        break;
                    case 0xA3:
                        this.mappingTable[code] = this.Instruction_AND;
                        break;
                    case 0xA4:
                        this.mappingTable[code] = this.Instruction_AND;
                        break;
                    case 0xA5:
                        this.mappingTable[code] = this.Instruction_AND;
                        break;
                    case 0xA6:
                        this.mappingTable[code] = this.Instruction_AND;
                        break;
                    case 0xA7:
                        this.mappingTable[code] = this.Instruction_AND;
                        break;
                    case 0xA8:
                        this.mappingTable[code] = this.Instruction_XOR;
                        break;
                    case 0xA9:
                        this.mappingTable[code] = this.Instruction_XOR;
                        break;
                    case 0xAA:
                        this.mappingTable[code] = this.Instruction_XOR;
                        break;
                    case 0xAB:
                        this.mappingTable[code] = this.Instruction_XOR;
                        break;
                    case 0xAC:
                        this.mappingTable[code] = this.Instruction_XOR;
                        break;
                    case 0xAD:
                        this.mappingTable[code] = this.Instruction_XOR;
                        break;
                    case 0xAE:
                        this.mappingTable[code] = this.Instruction_XOR;
                        break;
                    case 0xAF:
                        this.mappingTable[code] = this.Instruction_XOR;
                        break;
                    case 0xB0:
                        this.mappingTable[code] = this.Instruction_OR;
                        break;
                    case 0xB1:
                        this.mappingTable[code] = this.Instruction_OR;
                        break;
                    case 0xB2:
                        this.mappingTable[code] = this.Instruction_OR;
                        break;
                    case 0xB3:
                        this.mappingTable[code] = this.Instruction_OR;
                        break;
                    case 0xB4:
                        this.mappingTable[code] = this.Instruction_OR;
                        break;
                    case 0xB5:
                        this.mappingTable[code] = this.Instruction_OR;
                        break;
                    case 0xB6:
                        this.mappingTable[code] = this.Instruction_OR;
                        break;
                    case 0xB7:
                        this.mappingTable[code] = this.Instruction_OR;
                        break;
                    case 0xB8:
                        this.mappingTable[code] = this.Instruction_CMP;
                        break;
                    case 0xB9:
                        this.mappingTable[code] = this.Instruction_CMP;
                        break;
                    case 0xBA:
                        this.mappingTable[code] = this.Instruction_CMP;
                        break;
                    case 0xBB:
                        this.mappingTable[code] = this.Instruction_CMP;
                        break;
                    case 0xBC:
                        this.mappingTable[code] = this.Instruction_CMP;
                        break;
                    case 0xBD:
                        this.mappingTable[code] = this.Instruction_CMP;
                        break;
                    case 0xBE:
                        this.mappingTable[code] = this.Instruction_CMP;
                        break;
                    case 0xBF:
                        this.mappingTable[code] = this.Instruction_CMP;
                        break;
                    case 0xC0:
                        this.mappingTable[code] = this.Instruction_RET;
                        break;
                    case 0xC1:
                        this.mappingTable[code] = this.Instruction_POP_BC;
                        break;
                    case 0xC2:
                        this.mappingTable[code] = this.Instruction_JMP;
                        break;
                    case 0xC3:
                        this.mappingTable[code] = this.Instruction_JMP;
                        break;
                    case 0xC4:
                        this.mappingTable[code] = this.Instruction_CALL;
                        break;
                    case 0xC5:
                        this.mappingTable[code] = this.Instruction_PUSH;
                        break;
                    case 0xC6:
                        this.mappingTable[code] = this.Instruction_ADD;
                        break;
                    case 0xC7:
                        this.mappingTable[code] = this.Instruction_RST;
                        break;
                    case 0xC8:
                        this.mappingTable[code] = this.Instruction_RET;
                        break;
                    case 0xC9:
                        this.mappingTable[code] = this.Instruction_RET;
                        break;
                    case 0xCA:
                        this.mappingTable[code] = this.Instruction_JMP;
                        break;
                    case 0xCC:
                        this.mappingTable[code] = this.Instruction_CALL;
                        break;
                    case 0xCD:
                        this.mappingTable[code] = this.Instruction_CALL;
                        break;
                    case 0xCE:
                        this.mappingTable[code] = this.Instruction_ADC;
                        break;
                    case 0xCF:
                        this.mappingTable[code] = this.Instruction_RST;
                        break;
                    case 0xD0:
                        this.mappingTable[code] = this.Instruction_RET;
                        break;
                    case 0xD1:
                        this.mappingTable[code] = this.Instruction_POP_DE;
                        break;
                    case 0xD2:
                        this.mappingTable[code] = this.Instruction_JMP;
                        break;
                    case 0xD3:
                        this.mappingTable[code] = this.Instruction_OUTP;
                        break;
                    case 0xD4:
                        this.mappingTable[code] = this.Instruction_CALL;
                        break;
                    case 0xD5:
                        this.mappingTable[code] = this.Instruction_PUSH;
                        break;
                    case 0xD6:
                        this.mappingTable[code] = this.Instruction_SUB;
                        break;
                    case 0xD7:
                        this.mappingTable[code] = this.Instruction_RST;
                        break;
                    case 0xD8:
                        this.mappingTable[code] = this.Instruction_RET;
                        break;
                    case 0xDA:
                        this.mappingTable[code] = this.Instruction_JMP;
                        break;
                    case 0xDB:
                        this.mappingTable[code] = this.Instruction_INP;
                        break;
                    case 0xDC:
                        this.mappingTable[code] = this.Instruction_CALL;
                        break;
                    case 0xDE:
                        this.mappingTable[code] = this.Instruction_SBBI;
                        break;
                    case 0xDF:
                        this.mappingTable[code] = this.Instruction_RST;
                        break;
                    case 0xE1:
                        this.mappingTable[code] = this.Instruction_POP_HL;
                        break;
                    case 0xE3:
                        this.mappingTable[code] = this.Instruction_XTHL;
                        break;
                    case 0xE5:
                        this.mappingTable[code] = this.Instruction_PUSH;
                        break;
                    case 0xE6:
                        this.mappingTable[code] = this.Instruction_AND;
                        break;
                    case 0xE7:
                        this.mappingTable[code] = this.Instruction_RST;
                        break;
                    case 0xE9:
                        this.mappingTable[code] = this.Instruction_PCHL;
                        break;
                    case 0xEB:
                        this.mappingTable[code] = this.Instruction_XCHG;
                        break;
                    case 0xEE:
                        this.mappingTable[code] = this.Instruction_XOR;
                        break;
                    case 0xEF:
                        this.mappingTable[code] = this.Instruction_RST;
                        break;
                    case 0xF1:
                        this.mappingTable[code] = this.Instruction_POP_FLAGS;
                        break;
                    case 0xF2:
                        this.mappingTable[code] = this.Instruction_JMP;
                        break;
                    case 0xF3:
                        this.mappingTable[code] = this.Instruction_DI;
                        break;
                    case 0xF5:
                        this.mappingTable[code] = this.Instruction_PUSH;
                        break;
                    case 0xF6:
                        this.mappingTable[code] = this.Instruction_OR;
                        break;
                    case 0xF7:
                        this.mappingTable[code] = this.Instruction_RST;
                        break;
                    case 0xFA:
                        this.mappingTable[code] = this.Instruction_JMP;
                        break;
                    case 0xFB:
                        this.mappingTable[code] = this.Instruction_EI;
                        break;
                    case 0xFE:
                        this.mappingTable[code] = this.Instruction_CMP;
                        break;
                    case 0xFF:
                        this.mappingTable[code] = this.Instruction_RST;
                        break;
                }
            }
        };
        Intel8080.prototype.Reset = function () {
            this.PC = 0;
            this.A = 0;
            this.BC = 0;
            this.DE = 0;
            this.HL = 0;
            this.SIGN = 0;
            this.ZERO = 0;
            this.HALFCARRY = 0;
            this.PARITY = 0;
            this.CARRY = 0;
            this.INTERRUPT = 0;
        };
        Intel8080.prototype.Run = function () {
            for(var i = 0; i < this.instruction_per_frame; ++i) {
                this.ExecuteInstruction();
            }
        };
        Intel8080.prototype.ExecuteInstruction = function () {
            this.disassembly_pc = this.PC;
            this.current_inst = this.FetchRomByte();
            if(this.mappingTable[this.current_inst] != null) {
                this.mappingTable[this.current_inst].call(this);
            } else {
                throw new Error("OPCODE Unhandled");
            }
            this.count_instructions += 1;
            if(this.count_instructions >= this.half_instruction_per_frame) {
                if(this.INTERRUPT) {
                    if(this.interrupt_alternate == 0) {
                        this.CallInterrupt(0x08);
                    } else {
                        this.CallInterrupt(0x10);
                    }
                }
                this.interrupt_alternate = 1 - this.interrupt_alternate;
                this.count_instructions = 0;
            }
        };
        Intel8080.prototype.CallInterrupt = function (inAddress) {
            this.INTERRUPT = 0;
            this.StackPush(this.PC);
            this.PC = inAddress;
        };
        Intel8080.prototype.SetA = function (inByte) {
            this.A = inByte & 0xFF;
        };
        Intel8080.prototype.SetB = function (inByte) {
            this.B = inByte & 0xFF;
            this.BC = (this.B << 8) | this.C;
        };
        Intel8080.prototype.SetC = function (inByte) {
            this.C = inByte & 0xFF;
            this.BC = (this.B << 8) | this.C;
        };
        Intel8080.prototype.SetD = function (inByte) {
            this.D = inByte & 0xFF;
            this.DE = (this.D << 8) | this.E;
        };
        Intel8080.prototype.SetE = function (inByte) {
            this.E = inByte & 0xFF;
            this.DE = (this.D << 8) | this.E;
        };
        Intel8080.prototype.SetH = function (inByte) {
            this.H = inByte & 0xFF;
            this.HL = (this.H << 8) | this.L;
        };
        Intel8080.prototype.SetL = function (inByte) {
            this.L = inByte & 0xFF;
            this.HL = (this.H << 8) | this.L;
        };
        Intel8080.prototype.SetBC = function (inShort) {
            this.BC = inShort & 0xFFFF;
            this.B = (this.BC >> 8);
            this.C = this.BC & 0xFF;
        };
        Intel8080.prototype.SetDE = function (inShort) {
            this.DE = inShort & 0xFFFF;
            this.D = (this.DE >> 8);
            this.E = this.DE & 0xFF;
        };
        Intel8080.prototype.SetHL = function (inShort) {
            this.HL = inShort & 0xFFFF;
            this.H = (this.HL >> 8);
            this.L = this.HL & 0xFF;
        };
        Intel8080.prototype.SetSP = function (inShort) {
            this.SP = inShort & 0xFFFF;
        };
        Intel8080.prototype.FetchRomByte = function () {
            var b = this._memory[this.PC];
            this.PC += 1;
            return b;
        };
        Intel8080.prototype.FetchRomShort = function () {
            var out = this._memory[this.PC + 1] << 8 | this._memory[this.PC];
            this.PC += 2;
            return out;
        };
        Intel8080.prototype.ReadByte = function (inAddress) {
            return this._memory[inAddress];
        };
        Intel8080.prototype.ReadShort = function (inAddress) {
            return this._memory[inAddress + 1] << 8 | this._memory[inAddress];
        };
        Intel8080.prototype.WriteByte = function (inAddress, inByte) {
            this._memory[inAddress] = inByte;
        };
        Intel8080.prototype.WriteShort = function (inAddress, inWord) {
            this._memory[inAddress + 1] = inWord >> 8;
            this._memory[inAddress] = inWord;
        };
        Intel8080.prototype.StackPush = function (inValue) {
            this.SP -= 2;
            this.WriteShort(this.SP, inValue);
        };
        Intel8080.prototype.StackPop = function () {
            var out = this.ReadShort(this.SP);
            this.SP += 2;
            return out;
        };
        Object.defineProperty(Intel8080.prototype, "memory", {
            get: function () {
                return this._memory;
            },
            set: function (buffer) {
                this._memory = buffer;
            },
            enumerable: true,
            configurable: true
        });
        return Intel8080;
    })();
    cpu.Intel8080 = Intel8080;    
})(cpu || (cpu = {}));
//@ sourceMappingURL=8080.js.map
