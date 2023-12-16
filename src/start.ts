const decode = new TextDecoder()
const start = async () => {
    const secret = crypto.randomUUID();
    const sub = Bun.spawn(['bun', 'run', 'src/index.ts', secret])
    const reader = sub.stdout.getReader()
    while(true){
        const { done, value } = await reader.read()
        if(done){
            console.log('프로그램 종료')
            break
        }
        const str = decode.decode(value)
        console.log(str)
        if(str.trim().includes(secret)){
            console.log('프로그램 killed')
            break
        }
    }
    sub.kill(9)
    const { stdout } = Bun.spawnSync(['git', 'pull'])
    console.log(decode.decode(stdout))
    console.log('git pull 완료')
}

start()