import { 신규, 퇴원, 변경, 보충, 결석, 비대면, 상담, 예약 } from './func.js';
import type { CF } from './func.js';
import type {
    CacheType,
    Interaction,
} from 'discord.js';
import {
    EmbedBuilder,
} from 'discord.js';
import { addQueueSpread } from "./google.js";
import { channelsArr } from './setting.js';

export const command = new Map<string, [CF, string]>([
    ["신규", [신규, channelsArr[0]]],
    ["퇴원", [퇴원, channelsArr[0]]],
    ["변경", [변경, channelsArr[0]]],
    ["보충", [보충, channelsArr[0]]],
    ["결석", [결석, channelsArr[0]]],
    ["상담", [상담, channelsArr[0]]],
    ["비대면", [비대면, channelsArr[0]]],
    ["예약", [예약, channelsArr[2]]]
]);



export const studentAlert = async (inter: Interaction<CacheType>, spreadName:string) => {
    if (!inter.isChatInputCommand()) return false;
    if (!command.has(inter.commandName)) return false; //inter의 commandName이 command에서 정의한 타입에 포함되지 않으면 종료
    const CFArr = command.get(inter.commandName);
    if (inter.channelId !== CFArr[1]) return false;
    const embed = new EmbedBuilder();
    const result = CFArr[0](inter.options.data);
    if (result.status) {
        const type = result.title;
        const inputValue = result.value;

        // 메세지 등록
        embed
            .setColor(result.color)
            .setTitle(`[${result.title}]`)
            .setDescription(
                result.value
                    .map((v, i) => `**${i + 1}. ${v[0]} : **${v[1]}`)
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