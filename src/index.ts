import * as dotenv from 'dotenv';
import fs from 'fs/promises';
import { fileURLToPath } from 'url';
import path from 'path';
import { Client, GatewayIntentBits, CommandInteractionOption, CacheType, EmbedBuilder, ColorResolvable } from 'discord.js';
const dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config();
type CF = (obj:readonly CommandInteractionOption<CacheType>[])=>
    {status:true, title?:string, color?:ColorResolvable, value:[string, string][]} | {status:false, value:string};

const getDate = (date:string, flag = false) => {
    const day = ['일', '월', '화', '수', '목', '금', '토'];
    if(flag && !/\d{2}-\d{2}/.test(date)) {
        return {
            status:false,
            value:"일시는 'MM-DD'의 형태로 작성해주세요.",
        }
    } else if(!flag && !/\d{2}-\d{2}-\d{2}/.test(date)) {
        return {
            status:false,
            value:"일시는 'MM-DD-HH'의 형태로 작성해주세요.",
        }
    }
    let m = Number(date.slice(0, 2));
    let d = Number(date.slice(3, 5));
    let h = Number(date.slice(6));
    let realDate = new Date();
    if(realDate.getMonth() + 1 < m || (realDate.getMonth() + 1 === m && realDate.getDate() < d)){
        realDate.setFullYear(realDate.getFullYear() + 1);
    }
    realDate.setMonth(m - 1, d);
    realDate.setHours(h);
    if(!(realDate.getMonth() + 1 === m && realDate.getDate() === d && realDate.getHours() === h)) return {
        status:false,
        value:'잘못된 일시를 작성했습니다.'
    };
    if(flag){
        return {
            status:true,
            value:`${realDate.getMonth() + 1}/${realDate.getDate()}(${day[realDate.getDay()]})`
        };
    }
    let oh = '오후';
    if(h < 12){
        oh = '오전';
    } else if(h > 12){
        h -= 12;
    }
    return {
        status:true,
        value:`${realDate.getMonth() + 1}/${realDate.getDate()}(${day[realDate.getDay()]}) ${oh}${h}시`
    }
}

const 신규:CF = (obj) => {
    const name = obj.find(v => v.name === '이름').value as string;
    const date = obj.find(v => v.name === '일시').value as string;
    const sub = obj.find(v => v.name === '과목').value as string;
    const other = obj.find(v => v.name === '특이사항')?.value as string ?? '';
    let resultDate = getDate(date);
    if(!resultDate.status) return {
        status: false,
        value:resultDate.value,
    };
    return {
        status:true,
        title:'신규',
        color:'Gold',
        value:[[`이름`,  name], [`일시`, resultDate.value], [`과목`, sub], [`특이사항`, other ? other : '없음']],
    };
};

const 퇴원:CF = (obj) => {
    const name = obj.find(v => v.name === '이름').value as string;
    const date = obj.find(v => v.name === '일시').value as string;
    const sub = obj.find(v => v.name === '과목').value as string;
    const other = obj.find(v => v.name === '사유').value as string;
    let resultDate = getDate(date, true);
    if(!resultDate.status) return {
        status:false,
        value:resultDate.value,
    }
    return {
        status: true,
        title:'퇴원',
        color:'Grey',
        value:[['이름', name], ['일시', resultDate.value], ['과목', sub], ['사유', other]]
    };
};

const 보충:CF = (obj) => {
    const name = obj.find(v => v.name === '이름').value as string;
    const date = obj.find(v => v.name === '일시').value as string;
    const sub = obj.find(v => v.name === '과목').value as string;
    const other = obj.find(v => v.name === '특이사항')?.value as string ?? '';
    let resultDate = getDate(date);
    if(!resultDate.status) return {
        status: false,
        value:resultDate.value,
    };
    return {
        status:true,
        title:'보충',
        color:'Purple',
        value:[[`이름`,  name], [`일시`, resultDate.value], [`과목`, sub], [`특이사항`, other ? other : '없음']],
    };
};

const 결석:CF = (obj) => {
    const name = obj.find(v => v.name === '이름').value as string;
    const date = obj.find(v => v.name === '일시').value as string;
    const sub = obj.find(v => v.name === '과목').value as string;
    const other = obj.find(v => v.name === '사유').value as string;
    let resultDate = getDate(date);
    if(!resultDate.status) return {
        status: false,
        value:resultDate.value,
    };
    return {
        status:true,
        title:'결석',
        color:'Green',
        value:[[`이름`,  name], [`일시`, resultDate.value], [`과목`, sub], [`사유`, other]],
    };
};

const 변경:CF = (obj) => {
    const name = obj.find(v => v.name === '이름').value as string;
    const date1 = obj.find(v => v.name === '기존일시').value as string;
    const date2 = obj.find(v => v.name === '변경일시').value as string;
    const sub = obj.find(v => v.name === '과목').value as string;
    const other = obj.find(v => v.name === '사유').value as string;
    let resultDate1 = getDate(date1);
    let resultDate2 = getDate(date2);
    if(!resultDate1.status) return {
        status: false,
        value:resultDate1.value,
    };
    if(!resultDate2.status) return {
        status: false,
        value:resultDate2.value,
    };
    return {
        status:true,
        title:'수업시간변경',
        color:'Blue',
        value:[[`이름`,  name], [`일시`, `${resultDate1.value} → ${resultDate2.value}`], [`과목`, sub], [`사유`, other]],
    };
};

const 비대면:CF = (obj) => {
    const name = obj.find(v => v.name === '이름').value as string;
    const date = obj.find(v => v.name === '일시').value as string;
    const sub = obj.find(v => v.name === '과목').value as string;
    const other = obj.find(v => v.name === '사유').value as string;
    let resultDate = getDate(date);
    if(!resultDate.status) return {
        status: false,
        value:resultDate.value,
    };
    return {
        status:true,
        title:'비대면',
        color:'Orange',
        value:[[`이름`,  name], [`일시`, resultDate.value], [`과목`, sub], [`사유`, other]],
    };
};


const 테스트:CF = (obj) => {
    return {
        status:false,
        value:'테스트입니다.',
    }
}


const command = new Map<string,CF>([
    ['신규', 신규],
    ['퇴원', 퇴원],
    ['변경', 변경],
    ['보충', 보충],
    ['결석', 결석],
    ['비대면', 비대면],
])
const client = new Client({
    intents:[GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages]
});

client.on('ready', () => {
    console.log('테스트 시작!');
});

client.on('messageCreate', async msg => {
    try{
        if(msg.channelId !== process.env.CHANNEL) return;
        if(msg.author.id !== process.env.CLIENT_ID) {
            await msg.delete();
            const embed = new EmbedBuilder()
                .setColor('Red')
                .setTitle('이 채널에서는 일반 메세지를 작성할 수 없습니다.');
            const al = await msg.channel.send({
                embeds:[embed]
            });
            setTimeout(async () => await al.delete(), 3000);
        }
    } catch(err){
        await fs.writeFile(path.resolve(dirname, '../logs', new Date().toISOString()), String(err));
    }
})


client.on('interactionCreate', async inter => {
    try{
        if(!inter.isChatInputCommand()) return;
        if(!command.has(inter.commandName)) return;
        if(inter.channelId !== process.env.CHANNEL) return;
        const result = command.get(inter.commandName)(inter.options.data);
        const embed = new EmbedBuilder();
        if(result.status){
            embed.setColor(result.color)
                .setTitle(`[${result.title}]`)
                .setFields(result.value.map((v, i) => ({name:`${i + 1}. ${v[0]}`, value:v[1]})))
            await inter.reply({embeds:[embed]});
        } else {
            embed.setColor('Red')
                .setTitle(result.value as string)
            await inter.reply({embeds:[embed]});
            setTimeout(async () => await inter.deleteReply(), 3000);
        }
    } catch(err){
        await fs.writeFile(path.resolve(dirname, '../logs', new Date().toISOString()), String(err));
    }
})

client.login(process.env.TOKEN);