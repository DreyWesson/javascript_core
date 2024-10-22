function memset(typedArray, value, start = 0, end = typedArray.length) {
  if (!(typedArray instanceof TypedArray)) {
    throw new TypeError("First argument must be a TypedArray");
  }

  const fillValue = Number(value) || 0;
  for (let i = start; i < end; i++) {
    typedArray[i] = fillValue;
  }

  return typedArray;
}
const buffer = new ArrayBuffer(8);
const uint8Array = new Uint8Array(buffer);
memset(uint8Array, 42);
console.log(uint8Array); // Uint8Array(8) [42, 42, 42, 42, 42, 42, 42, 42]

function memcpy(dest, src, length, destOffset = 0, srcOffset = 0) {
  if (!(dest instanceof TypedArray) || !(src instanceof TypedArray)) {
    throw new TypeError("Both arguments must be TypedArrays");
  }

  const srcView = new Uint8Array(
    src.buffer,
    src.byteOffset + srcOffset,
    length
  );
  const destView = new Uint8Array(
    dest.buffer,
    dest.byteOffset + destOffset,
    length
  );

  destView.set(srcView);

  return dest;
}

const src = new Uint8Array([1, 2, 3, 4, 5]);
const dest = new Uint8Array(10);
memcpy(dest, src, 5, 2);
console.log(dest); // Uint8Array(10) [0, 0, 1, 2, 3, 4, 5, 0, 0, 0]

function memmove(dest, src, length, destOffset = 0, srcOffset = 0) {
  if (!(dest instanceof TypedArray) || !(src instanceof TypedArray)) {
    throw new TypeError("Both arguments must be TypedArrays");
  }

  const srcView = new Uint8Array(
    src.buffer,
    src.byteOffset + srcOffset,
    length
  );
  const destView = new Uint8Array(
    dest.buffer,
    dest.byteOffset + destOffset,
    length
  );

  const tempBuffer = new Uint8Array(srcView);
  destView.set(tempBuffer);

  return dest;
}

const array = new Uint8Array([1, 2, 3, 4, 5]);
memmove(array, array, 3, 1, 0);
console.log(array); // Uint8Array(5) [1, 1, 2, 3, 5]
