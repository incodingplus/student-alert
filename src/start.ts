import { spawnSync } from 'child_process'

while(true){
    const index = Bun.spawnSync(['bun', 'run', 'index']);
    console.log(index.stdout.toString());
    console.log(index.stderr.toString());
    await new Promise(res => setTimeout(res, 5000));
}