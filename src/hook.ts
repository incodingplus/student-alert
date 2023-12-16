const encoder = new TextEncoder();

const secret = Bun.env.HAN_HOOK_SECRET
const KILL = Bun.argv[2] ?? 'kill'
export async function verifySignature(req:Request) {
    const header = req.headers.get('X-Hub-Signature-256')
    const payload = await req.text()
    if(!header){
        return new Response('wrong header', {
            status:500
        })
    }
    const parts = header.split("=");
    const sigHex = parts[1];

    const algorithm = { name: "HMAC", hash: { name: 'SHA-256' } };

    const keyBytes = encoder.encode(secret);
    const extractable = false;
    const key = await crypto.subtle.importKey(
        "raw",
        keyBytes,
        algorithm,
        extractable,
        [ "sign", "verify" ],
    );

    const sigBytes = hexToBytes(sigHex);
    const dataBytes = encoder.encode(payload);
    const equal = await crypto.subtle.verify(
        algorithm.name,
        key,
        sigBytes,
        dataBytes,
    );
    if(equal){
        console.log(KILL)
        return new Response('killed')
    }
    return new Response('wrong pass', {
        status:500
    })
}

function hexToBytes(hex:string) {
    const len = hex.length / 2;
    const bytes = new Uint8Array(len);
    for (let i = 0; i < hex.length; i += 2) {
        let c = hex.slice(i, i + 2);
        let b = parseInt(c, 16);
        bytes[i / 2] = b;
    }
    return bytes;
}