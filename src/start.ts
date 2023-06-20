import { spawnSync } from 'child_process'

const shell = process.platform === 'win32' 
  ? 'C:\\Program Files\\PowerShell\\7\\pwsh.exe' 
  : undefined

while(true){
    const index = spawnSync('npm', ['start'], {
        stdio:'inherit',
        shell
    });
    if(index.output){
        for(let i of index.output){
            console.log(i.toString());
        }
    }
    await new Promise(res => setTimeout(res, 5000));
}