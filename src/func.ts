import type {
    CommandInteractionOption,
    CacheType,
    ColorResolvable
} from 'discord.js';

export type CF = (obj: readonly CommandInteractionOption<CacheType>[]) =>
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
            value: `${realDate.getMonth() + 1}/${realDate.getDate()}(${day[realDate.getDay()]
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
        value: `${realDate.getMonth() + 1}/${realDate.getDate()}(${day[realDate.getDay()]
            }) ${oh}${h}시${m !== 0 ? ` ${m}분` : ""}`,
    };
};

export const 신규: CF = (obj) => {
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

export const 퇴원: CF = (obj) => {
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

export const 보충: CF = (obj) => {
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

export const 결석: CF = (obj) => {
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

export const 변경: CF = (obj) => {
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

export const 비대면: CF = (obj) => {
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


export const 테스트: CF = (obj) => {
    return {
        status: false,
        value: '테스트입니다.',
    }
}

export const 지시:CF = (obj) => {
    const name = obj.find((v) => v.name === "이름").value as string;
    const date = obj.find((v) => v.name === "일시").value as string;
    const sub = obj.find((v) => v.name === "과목").value as string;
    const other = obj.find((v) => v.name === "사유").value as string;
}