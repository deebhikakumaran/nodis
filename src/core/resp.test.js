// testing wire protocol (resp)
// test it with: node --test src/core/resp.test.js

const test = require("node:test");
const assert = require("node:assert");
const { decode } = require("./resp");

test("simple string", () => {
    assert.strictEqual(decode(Buffer.from("+OK\r\n"))[0], "OK");
});

test("error", () => {
    assert.strictEqual(decode(Buffer.from("-Error message\r\n"))[0], "Error message");
});

test("integers", () => {
    assert.strictEqual(decode(Buffer.from(":0\r\n"))[0], 0);
    assert.strictEqual(decode(Buffer.from(":1000\r\n"))[0], 1000);
});

test("bulk strings", () => {
    assert.strictEqual(decode(Buffer.from("$5\r\nhello\r\n"))[0], "hello");
    assert.strictEqual(decode(Buffer.from("$0\r\n\r\n"))[0], "");
});

test("arrays incl. nested", () => {
    assert.deepStrictEqual(decode(Buffer.from("*0\r\n"))[0], []);
    assert.deepStrictEqual(
        decode(Buffer.from("*2\r\n$5\r\nhello\r\n$5\r\nworld\r\n"))[0],
        ["hello", "world"]
    );
    assert.deepStrictEqual(
        decode(Buffer.from("*3\r\n:1\r\n:2\r\n:3\r\n"))[0],
        [1, 2, 3]
    );
    // nested: outer array of two arrays
    assert.deepStrictEqual(
        // in second inner array, its simple string and error string.
        decode(Buffer.from("*2\r\n*3\r\n:1\r\n:2\r\n:3\r\n*2\r\n+Hello\r\n-World\r\n"))[0],
        [[1, 2, 3], ["Hello", "World"]]
    );
});