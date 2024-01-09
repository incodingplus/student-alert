import { 신규, 퇴원, 변경, 보충, 결석, 비대면, 상담, 예약, 기록 } from './func';
import type { CF } from './func';
import type {
    CacheType,
    Interaction,
} from 'discord.js';
import {
    EmbedBuilder,
} from 'discord.js';
import { addQueueSpread } from "./google";
import { CHANNELS } from './setting';

export const command = new Map<string, [CF, string]>([
    ["신규", [신규, CHANNELS.ALERT]],
    ["퇴원", [퇴원, CHANNELS.ALERT]],
    ["변경", [변경, CHANNELS.ALERT]],
    ["보충", [보충, CHANNELS.ALERT]],
    ["결석", [결석, CHANNELS.ALERT]],
    ["상담", [상담, CHANNELS.ALERT]],
    ["비대면", [비대면, CHANNELS.ALERT]],
    ["예약", [예약, CHANNELS.COUNT]],
    ["기록", [기록, CHANNELS.COUNT]],
]);



export const studentAlert = async (inter: Interaction<CacheType>, spreadName:string) => {
    if (!inter.isChatInputCommand()) return false;
    if (!command.has(inter.commandName)) return false; //inter의 commandName이 command에서 정의한 타입에 포함되지 않으면 종료
    const CFArr = command.get(inter.commandName);
    if (!CFArr || inter.channelId !== CFArr[1]) return false;
    const embed = new EmbedBuilder();
    const result = CFArr[0](inter.options.data);
    if (result.status) {
        const type = result.title;
        const inputValue = result.value;

        // 메세지 등록
        embed
            .setColor(result.color ?? 'Random')
            .setTitle(`[${result.title}]`)
            .setDescription(
                result.value
                    .map((v, i) => `**${i + 1}.** **${v[0]}** : ${v[1]}`)
                    .join("\n\n")
            );
        await inter.reply({ embeds: [embed] });
        const message = await inter.fetchReply();
        await addQueueSpread('add', {
            id: message.id, type, inputValue, spreadName
        });
        return true;
    }
    embed.setColor("Red").setTitle(result.value as string);
    await inter.reply({ embeds: [embed], ephemeral:true });
    return true;
}