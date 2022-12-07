import "./setting.js";
import { addToSpreadsheet, deleteSpreadsheet } from "./google.js";
import fs from "fs/promises";
import path from "path";
import { dirname } from "./setting.js";
import {
  Client,
  GatewayIntentBits,
  CommandInteractionOption,
  CacheType,
  EmbedBuilder,
  ColorResolvable,
  Partials,
} from "discord.js";
import { request } from "gaxios";
type CF = (obj: readonly CommandInteractionOption<CacheType>[]) =>
  | {
      status: true;
      title?: string;
      color?: ColorResolvable;
      value: [string, string][];
    }
  | { status: false; value: string };

const getDate = (date: string, flag = false) => {
  const day = ["일", "월", "화", "수", "목", "금", "토"];
  if (flag && !/^\d{2}-\d{2}$/.test(date)) {
    return {
      status: false,
      value: "일시는 'MM-DD' 이런 형식으로 작성해주세요.",
    };
  } else if (!flag && !/^\d{2}-\d{2}-\d{2}(:\d{2})?$/.test(date)) {
    return {
      status: false,
      value: "일시는 'MM-DD-HH' 또는 'MM-DD-HH:mm' 이런 형식으로 작성해주세요.",
    };
  }
  let M = Number(date.slice(0, 2));
  let d = Number(date.slice(3, 5));
  let h = Number(date.slice(6, 8));
  let m = Number(date.slice(9));
  let realDate = new Date();
  let compare = new Date(realDate);
  compare.setFullYear(compare.getFullYear() + 1);
  if (
    Math.abs(Number(compare) - Date.now()) <
    Math.abs(Number(realDate) - Date.now())
  ) {
    realDate.setFullYear(realDate.getFullYear() + 1);
  }
  realDate.setMonth(M - 1, d);
  realDate.setHours(h, m);
  if (
    !(
      realDate.getMonth() + 1 === M &&
      realDate.getDate() === d &&
      realDate.getHours() === h &&
      realDate.getMinutes() === m
    )
  )
    return {
      status: false,
      value: "잘못된 일시를 작성했습니다.",
    };
  if (flag) {
    return {
      status: true,
      value: `${realDate.getMonth() + 1}/${realDate.getDate()}(${
        day[realDate.getDay()]
      })`,
    };
  }
  let oh = "오후";
  if (h < 12) {
    oh = "오전";
  } else if (h > 12) {
    h -= 12;
  }
  return {
    status: true,
    value: `${realDate.getMonth() + 1}/${realDate.getDate()}(${
      day[realDate.getDay()]
    }) ${oh}${h}시${m !== 0 ? ` ${m}분` : ""}`,
  };
};

const 신규: CF = (obj) => {
  const name = obj.find((v) => v.name === "이름").value as string;
  const date = obj.find((v) => v.name === "일시").value as string;
  const sub = obj.find((v) => v.name === "과목").value as string;
  const other = (obj.find((v) => v.name === "특이사항")?.value as string) ?? "";
  let resultDate = getDate(date);
  if (!resultDate.status)
    return {
      status: false,
      value: resultDate.value,
    };
  return {
    status: true,
    title: "신규",
    color: "Gold",
    value: [
      [`이름`, name],
      [`일시`, resultDate.value],
      [`과목`, sub],
      [`특이사항`, other ? other : "없음"],
    ],
  };
};

const 퇴원: CF = (obj) => {
  const name = obj.find((v) => v.name === "이름").value as string;
  const date = obj.find((v) => v.name === "일시").value as string;
  const sub = obj.find((v) => v.name === "과목").value as string;
  const other = obj.find((v) => v.name === "사유").value as string;
  let resultDate = getDate(date, true);
  if (!resultDate.status)
    return {
      status: false,
      value: resultDate.value,
    };
  return {
    status: true,
    title: "퇴원",
    color: "Grey",
    value: [
      ["이름", name],
      ["일시", resultDate.value],
      ["과목", sub],
      ["사유", other],
    ],
  };
};

const 보충: CF = (obj) => {
  const name = obj.find((v) => v.name === "이름").value as string;
  const date = obj.find((v) => v.name === "일시").value as string;
  const sub = obj.find((v) => v.name === "과목").value as string;
  const other = (obj.find((v) => v.name === "특이사항")?.value as string) ?? "";
  let resultDate = getDate(date);
  if (!resultDate.status)
    return {
      status: false,
      value: resultDate.value,
    };
  return {
    status: true,
    title: "보충",
    color: "Purple",
    value: [
      [`이름`, name],
      [`일시`, resultDate.value],
      [`과목`, sub],
      [`특이사항`, other ? other : "없음"],
    ],
  };
};

const 결석: CF = (obj) => {
  const name = obj.find((v) => v.name === "이름").value as string;
  const date = obj.find((v) => v.name === "일시").value as string;
  const sub = obj.find((v) => v.name === "과목").value as string;
  const other = obj.find((v) => v.name === "사유").value as string;
  let resultDate = getDate(date);
  if (!resultDate.status)
    return {
      status: false,
      value: resultDate.value,
    };
  return {
    status: true,
    title: "결석",
    color: "Green",
    value: [
      [`이름`, name],
      [`일시`, resultDate.value],
      [`과목`, sub],
      [`사유`, other],
    ],
  };
};

const 변경: CF = (obj) => {
  const name = obj.find((v) => v.name === "이름").value as string;
  const date1 = obj.find((v) => v.name === "기존일시").value as string;
  const date2 = obj.find((v) => v.name === "변경일시").value as string;
  const sub = obj.find((v) => v.name === "과목").value as string;
  const other = obj.find((v) => v.name === "사유").value as string;
  let resultDate1 = getDate(date1);
  let resultDate2 = getDate(date2);
  if (!resultDate1.status)
    return {
      status: false,
      value: resultDate1.value,
    };
  if (!resultDate2.status)
    return {
      status: false,
      value: resultDate2.value,
    };
  return {
    status: true,
    title: "수업시간변경",
    color: "Blue",
    value: [
      [`이름`, name],
      [`일시`, `${resultDate1.value} → ${resultDate2.value}`],
      [`과목`, sub],
      [`사유`, other],
    ],
  };
};

const 비대면: CF = (obj) => {
  const name = obj.find((v) => v.name === "이름").value as string;
  const date = obj.find((v) => v.name === "일시").value as string;
  const sub = obj.find((v) => v.name === "과목").value as string;
  const other = obj.find((v) => v.name === "사유").value as string;
  let resultDate = getDate(date);
  if (!resultDate.status)
    return {
      status: false,
      value: resultDate.value,
    };
  return {
    status: true,
    title: "비대면",
    color: "Orange",
    value: [
      [`이름`, name],
      [`일시`, resultDate.value],
      [`과목`, sub],
      [`사유`, other],
    ],
  };
};

const command = new Map<string, CF>([
  ["신규", 신규],
  ["퇴원", 퇴원],
  ["변경", 변경],
  ["보충", 보충],
  ["결석", 결석],
  ["비대면", 비대면],
]);
const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions,
  ],
  partials: [Partials.User, Partials.Reaction, Partials.Message],
});

client.on("ready", () => {
  console.log("테스트 시작!");
});

client.on("messageCreate", async (msg) => {
  try {
    if (msg.channelId !== process.env.CHANNEL) return;
    if (msg.author.id !== process.env.CLIENT_ID) {
      await msg.delete();
      const embed = new EmbedBuilder()
        .setColor("Red")
        .setTitle("이 채널에서는 일반 메세지를 작성할 수 없습니다.");
      const al = await msg.channel.send({
        embeds: [embed],
      });
      setTimeout(async () => await al.delete(), 3000);
    }
  } catch (err) {
    await fs.writeFile(
      path.resolve(dirname, "../logs", `${Date.now()}`),
      String(err),
      { encoding: "utf-8" }
    );
  }
});

client.on("messageReactionAdd", async (inter) => {
  if (inter.emoji.name !== "😱") return;
  if (inter.message.channelId !== process.env.CHANNEL) return;
  const user = await inter.users.fetch();
  const msg = await inter.message.fetch();
  if (msg.interaction && user.has(msg.interaction.user.id)) {
    // 메세지 삭제
    // msg.id는 해당 메시지의 id 값이 아님. 해당 메시지의 id 값은 msg.interaction.id에 있음.
    deleteSpreadsheet(msg.interaction.id);
    await msg.delete();
  }
});

client.on("interactionCreate", async (inter) => {
  try {
    if (!inter.isChatInputCommand()) return; //ChatInputCommand가 아니면 종료
    if (!command.has(inter.commandName)) return; //inter의 commandName이 command에서 정의한 타입에 포함되지 않으면 종료
    const embed = new EmbedBuilder();
    if (inter.channel.parentId !== process.env.CATEGORY) {
      embed
        .setColor("Red")
        .setTitle("이 채널에서는 학생 알리미를 사용할 수 없습니다.");
      await inter.reply({ embeds: [embed] });
      setTimeout(async () => await inter.deleteReply(), 3000);
    }
    if (inter.channelId !== process.env.CHANNEL) {
      return;
    }
    const result = command.get(inter.commandName)(inter.options.data);
    if (result.status) {
      const chatId = inter.id;
      const type = result.title;
      const inputValue = result.value;
      addToSpreadsheet(chatId, type, inputValue);

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
      return;
    }
    embed.setColor("Red").setTitle(result.value as string);
    await inter.reply({ embeds: [embed] });
    setTimeout(async () => await inter.deleteReply(), 3000);
  } catch (err) {
    await fs.writeFile(
      path.resolve(dirname, "../logs", `${Date.now()}`),
      String(err),
      { encoding: "utf-8" }
    );
  }
});

client.login(process.env.TOKEN);
