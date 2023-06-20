import path from 'path';
import { fileURLToPath } from 'url'
import http from 'http'
const dirname = path.dirname(fileURLToPath(import.meta.url));
console.log(dirname);

const server = http.createServer((req, res) =>{
    process.exit(1);
});


server.listen(3333);