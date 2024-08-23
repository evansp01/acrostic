// eslint-disable-next-line @typescript-eslint/no-require-imports, no-undef
var fs = require("fs");
const files = fs.readdirSync('./src/assets/puzzles/')
fs.writeFileSync('./src/assets/puzzles/puzzles.json', JSON.stringify(files))