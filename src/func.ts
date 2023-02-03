import type {
    CommandInteractionOption,
    CacheType,
    ColorResolvable,
    GuildMember
} from 'discord.js';

import { DEFAULT_ID } from './setting.js';

export type CF = (obj: readonly CommandInteractionOption<CacheType>[]) =>
| {
    status: true;
    title?: string;
    color?: ColorResolvable;
    value: [string, string, string][];
  }
| { status: false; value: string };

export type SF = () =>
{
    title?: string;
    color?: ColorResolvable;
    value: {
        id:string;
        label:string;
        view:string;
        value?:()=>string;
        check?:(str:string)=>({status:boolean;value:string})
    }[];
}

const studentReg = /^([가-힣]+)\d{5}$/;

const getUser = (obj:readonly CommandInteractionOption<CacheType>[]) => {
    const id = obj.find((v) => v.name === "아이디").member as GuildMember;
    let name = obj.find((v) => v.name === "이름")?.value as string;
    if(studentReg.test(id.nickname)){
        return id.nickname;
    } else if(studentReg.test(id.user.username)){
        return id.user.username;
    } else if(id.user.username === DEFAULT_ID){
        return name;
    }
    return '';
};


const getMinDate = (m:number, d:number) => {
    let now = new Date();
    let nowYear = now.getFullYear();
    let minVal = Infinity;
    let min = nowYear + 1;
    for(let i = nowYear + 20; i >= nowYear - 20; i--){
        let date = new Date(i, m - 1, d);
        let dd = Math.abs(Number(date) - Number(now));
        if(dd < minVal && date.getMonth() === m - 1 && date.getDate() === d){
            minVal = dd;
            min = i;
        }
    }
    return min;
}

const getDate = (date: string, flag = false) => {
    const day = ["일", "월", "화", "수", "목", "금", "토"];
    if (flag && !/^\d{1,2}-\d{1,2}$/.test(date)) {
        return {
            status: false,
            value: "일시는 'MM-DD' 이런 형식으로 작성해주세요.",
        };
    } else if (!flag && !/^\d{1,2}-\d{1,2}-\d{1,2}(:\d{1,2})?$/.test(date)) {
        return {
            status: false,
            value: "일시는 'MM-DD-HH' 또는 'MM-DD-HH:mm' 이런 형식으로 작성해주세요.",
        };
    }
    let nums = date.match(/\d+/g);
    let M = Number(nums[0]);
    let d = Number(nums[1]);
    let h = Number(nums[2] ?? 0);
    let m = Number(nums[3] ?? 0);
    const y = getMinDate(M, d);
    let realDate = new Date(y, M - 1, d);
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
    const sub2 = obj.find((v) => v.name === "학년").value as string;
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
            [`이름`, name, "3"],
            [`일시`, resultDate.value, "4"],
            [`학년`, sub2, "7"],
            [`과목`, sub, "6"],
            [`특이사항`, other ? other : "없음", "8"],
        ],
    };
};

export const 예약: CF = (obj) => {
    const name = obj.find((v) => v.name === "이름").value as string;
    const sub = obj.find((v) => v.name === "학년").value as string;
    const date = obj.find((v) => v.name === "일시").value as string;
    const other = (obj.find((v) => v.name === "특이사항")?.value as string) ?? "";
    let resultDate = getDate(date);
    if (!resultDate.status)
        return {
            status: false,
            value: resultDate.value,
        };
    return {
        status: true,
        title: "상담 예약",
        color: "DarkGold",
        value: [
            [`이름`, name, "2"],
            [`일시`, resultDate.value, "3"],
            [`학년`, sub, "7"],
            [`특이사항`, other ? other : "없음", "8"],
        ],
    };
};

export const 기록: CF = (obj) => {
    const name = obj.find((v) => v.name === "이름").value as string;
    const sub = obj.find((v) => v.name === "학년").value as string;
    const date = obj.find((v) => v.name === "일시").value as string;
    const other = (obj.find((v) => v.name === "내용").value as string) ?? "";
    let resultDate = getDate(date);
    if (!resultDate.status)
        return {
            status: false,
            value: resultDate.value,
        };
    return {
        status: true,
        title: "상담 기록",
        color: "Yellow",
        value: [
            [`이름`, name, "3"],
            [`일시`, resultDate.value, "4"],
            [`학년`, sub, "7"],
            [`내용`, other, "8"],
        ],
    };
};

export const 퇴원: CF = (obj) => {
    const name = getUser(obj);
    if(!name) return {
        status: false,
        value: '학생 아이디를 써주세요.'
    }
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
            (studentReg.test(name) ? ["아이디", name,"2,3"] : ["이름", name, "3"]),
            ["일시", resultDate.value, "4"],
            ["과목", sub, "6"],
            ["사유", other, "8"],
        ],
    };
};

export const 상담: CF = (obj) => {
    const name = getUser(obj);
    if(!name) return {
        status: false,
        value: '학생 아이디를 써주세요.'
    }
    const date = obj.find((v) => v.name === "일시").value as string;
    const sub = obj.find((v) => v.name === "내용").value as string;
    let resultDate = getDate(date, true);
    if (!resultDate.status)
        return {
            status: false,
            value: resultDate.value,
        };
    return {
        status: true,
        title: "상담 내용",
        color: "Blurple",
        value: [
            (studentReg.test(name) ? ["아이디", name,"2,3"] : ["이름", name, "3"]),
            ["일시", resultDate.value, "4"],
            ["내용", sub, "8"],
        ],
    };
};

export const 보충: CF = (obj) => {
    const name = getUser(obj);
    if(!name) return {
        status: false,
        value: '학생 아이디를 써주세요.'
    }
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
            (studentReg.test(name) ? ["아이디", name,"2,3"] : ["이름", name, "3"]),
            [`일시`, resultDate.value, "4"],
            [`과목`, sub, "6"],
            [`특이사항`, other ? other : "없음", "8"],
        ],
    };
};

export const 결석: CF = (obj) => {
    const name = getUser(obj);
    if(!name) return {
        status: false,
        value: '학생 아이디를 써주세요.'
    }
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
            (studentReg.test(name) ? ["아이디", name,"2,3"] : ["이름", name, "3"]),
            [`일시`, resultDate.value, "4"],
            [`과목`, sub, "6"],
            [`사유`, other, "8"],
        ],
    };
};

export const 변경: CF = (obj) => {
    const name = getUser(obj);
    if(!name) return {
        status: false,
        value: '학생 아이디를 써주세요.'
    }
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
            (studentReg.test(name) ? ["아이디", name,"2,3"] : ["이름", name, "3"]),
            [`일시`, `${resultDate1.value} → ${resultDate2.value}`, "4,5"],
            [`과목`, sub, "6"],
            [`사유`, other, "8"],
        ],
    };
};

export const 비대면: CF = (obj) => {
    const name = getUser(obj);
    if(!name) return {
        status: false,
        value: '학생 아이디를 써주세요.'
    }
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
            (studentReg.test(name) ? ["아이디", name,"2,3"] : ["이름", name, "3"]),
            [`일시`, resultDate.value, "4"],
            [`과목`, sub, "6"],
            [`사유`, other, "8"],
        ],
    };
};


export const 테스트: CF = (obj) => {
    return {
        status: false,
        value: '테스트입니다.',
    }
}

export const 지시:SF = () => {
    return {
        title:'지시사항',
        color:'Aqua',
        value:[
            {
                id:'date',
                label:'수업 날짜를 작성해주세요. (MM-DD 형식)',
                view:'일시',
                value(){
                    const date = new Date();
                    const str = `${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`;
                    return str;
                },
                check(str) {
                    const data = getDate(str, true);
                    return data;
                }
            },
            {
                id:'jisi',
                label:'지시사항을 작성해주세요.',
                view:'지시'
            }
        ]
    }
}

export const 삭제:CF = (obj) => {
    return {
        status:false,
        value:'테스트',
    }
}