// resp decoder

const CR = 0x0d; // '\r'
const ZERO = 0x30; 
const NINE = 0x39; 

function readLength(data) {
    let length = 0;
    let pos = 0;
    for (pos = 0; pos < data.length; pos++) {
        const b = data[pos];
        if (!(b >= ZERO && b <= NINE)) {
        return [length, pos + 2];
        }
        length = length * 10 + (b - ZERO);
    }
    return [0, 0];
}

function readSimpleString(data) {
    let pos = 1; 
    for (; data[pos] !== CR; pos++) {}
    return [data.slice(1, pos).toString(), pos + 2, null];
}

function readError(data) {
    return readSimpleString(data);
}

function readInt64(data) {
    let pos = 1;
    let value = 0;
    for (; data[pos] !== CR; pos++) {
        value = value * 10 + (data[pos] - ZERO);
    }
    return [value, pos + 2, null];
}

function readBulkString(data) {
    let pos = 1; 
    const [len, delta] = readLength(data.slice(pos));
    pos += delta;
    return [data.slice(pos, pos + len).toString(), pos + len + 2, null];
}

function readArray(data) {
    let pos = 1; 
    const [count, delta] = readLength(data.slice(pos));
    pos += delta;

    const elems = new Array(count);
    for (let i = 0; i < count; i++) {
        // recursion via decodeOne

        const [elem, d, err] = decodeOne(data.slice(pos));
        if (err) return [null, 0, err];
        elems[i] = elem;
        pos += d;
    }
    return [elems, pos, null];
}

function decodeOne(data) {
    if (data.length === 0) return [null, 0, new Error("no data")];
    switch (String.fromCharCode(data[0])) {
        case "+":
            return readSimpleString(data);
        case "-":
            return readError(data);
        case ":":
            return readInt64(data);
        case "$":
            return readBulkString(data);
        case "*":
            return readArray(data);
        default:
            return [null, 0, null];
    }
}

function decode(data) {
    if (data.length === 0) return [null, new Error("no data")];
    const [value, , err] = decodeOne(data);
    return [value, err];
}

module.exports = { decode, decodeOne, readLength };
