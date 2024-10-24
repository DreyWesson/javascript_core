const fs = require("node:fs/promises");

(async function name() {
    console.time("large");
    const file = await fs.open("large_file.txt", "w");
    for (let i = 0; i < 2_000_000; i++) {
        await file.writeFile(`${i}`);
    }
    console.timeEnd("large");
})();
