const node_kakao = require("node-kakao");
const email = "wldnd07229@gmail.com";
const pw = "qwaszx4488";
const deviceUUID = "TsaqqFMi1Pb8F5ImCO21MRjMK+nLiQuUKuNNj2CiCAUDfU63BUGioiTSV1ypsMrhCcNURDK1plrUm5MIxln5Hg==";
const deviceName = "RAT_BOT";
const client = new node_kakao.TalkClient(deviceName, deviceUUID, { version: "3.2.6", appVersion: "3.2.6.2748", xvcSeedList: ["KEPHA", "HALEY"] });
client.configProvider.configuration.version = '3.2.7';
client.configProvider.configuration.appVersion = '3.2.7.2777';
var iskeyIssued = false;
var key;
var admin = [];
var readMessage = {};
var Detect = {};
var Hider = {};
var record = {};
var messages = {};
var request = require('request');
const fs = require("fs");
client.login(email, pw, true).then(function () {
    console.log("READY");
}).catch(function (error) {
    if (error.status === -100) {
        const readLine = require("readline");
        const rl = readLine.createInterface({
            input: process.stdin,
            output: process.stdout
        });
        client.Auth.requestPasscode(email, pw);
        rl.question("PASSCODE: ", function (answer) {
            client.Auth.registerDevice(answer, email, pw, true).then(function (res) {
                console.log(res);
                console.log("스크립트를 재 시작 해주세요.");
                process.exit();
            });
        });
    } else {
        console.log(JSON.stringify(error, null, 2));
    }
});
sendimti = function (chat, num) {
    chat.Channel.sendTemplate(new node_kakao.AttachmentTemplate(new node_kakao.EmoticonAniAttachment('(이모티콘)', num + '.emot_001.webp', undefined, undefined, undefined, '120', '120', '카카오 이모티콘')));
}

client.on("message", function (chat) {
    let userInfo = chat.Channel.getUserInfo(chat.Sender);
    let mentionList = chat.getMentionContentList();
    if (!userInfo) return;
    let id = String(chat.sender.id);
    let roomId = String(chat.channel.dataStruct.channelId);
    if (!Hider[roomId]) Hider[roomId] = [];
    if (!messages[roomId]) messages[roomId] = [];
    messages[roomId].push(String(chat.logId));
    if (Hider[roomId].includes(id)) {
        setTimeout(() => { client.OpenLinkManager.hideChat(chat.channel, chat.logId) }, 250);
    }
    if (chat.Text == "_id") console.log(id);
    if (chat.Text == "_Roomid" && isAdmin(chat)) console.log(roomId);
    if (chat.Text == ".인증") {
        key = Math.floor(Math.random() * 26);
        iskeyIssued = true;
        console.log(key);
    }
    if (chat.Type == 26 && chat.Text == "/봇" && admin.includes(id)) {
        client.OpenLinkManager.setOpenMemberType(chat.channel, chat.attachmentList[0].SourceUserId, 8);
        chat.replyText("complete");
    }
    if (chat.Type == 26 && chat.Text == "/제거" && admin.includes(id)) {
        client.OpenLinkManager.setOpenMemberType(chat.channel, chat.attachmentList[0].SourceUserId, 2);
        chat.replyText("complete");
    }
    if (chat.Type == 26 && chat.Text == "/부방" && admin.includes(id)) {
        client.OpenLinkManager.setOpenMemberType(chat.channel, chat.attachmentList[0].SourceUserId, 4);
        chat.replyText("complete");
    }
    if (chat.Text == key && iskeyIssued) {
        key = null;
        iskeyIssued = false;
        admin.push(id);
        console.log((id) + "\n관리자에 등록되었습니다.");
    }
    if (chat.Text.startsWith("/감지 ") && admin.includes(id)) {
        var _Mention = getMention(chat);
        if (!_Mention) {
            CaroSel(chat, [{ text: "/감지 @멘션 의 형태로 써주세요." }]);
        } else {
            if (!Detect[roomId]) Detect[roomId] = [];
            if (Detect[roomId].includes(String(_Mention))) {
                chat.replyText("해당 유저는 이미 감지중입니다.");
            } else {
                chat.replyText(chat.channel.getUserInfoId(String(_Mention)).memberStruct.nickname + "님을 감지합니다.");
                Detect[roomId].push(String(_Mention));
            }
        }
    }
    if (chat.Text.startsWith("/채팅금지 ") && admin.includes(id)) {
        var v = getMention(chat);
        if (String(v)) {
            if (!Hider[roomId].includes(String(v))) {
                Hider[roomId].push(String(v));
                chat.replyText("해당 유저의 모든 메시지를 가리기 시작합니다.");
            } else {
                chat.replyText("해당 유저는 이미 리스트에 등재되있습니다.");
            }
        } else {
            CaroSel(chat, [{ text: ".채팅금지 @멘션 의 형태로 써주세요." }]);
        }
    }
    if (chat.Text.startsWith("/채금해제 ") && admin.includes(id)) {
        var v = getMention(chat);
        if (String(v)) {
            var v1 = Hider[roomId].indexOf(String(v));
            if (v1 > -1) {
                Hider[roomId].splice(v1, 1);
                chat.replyText("해당 유저를 리스트에서 삭제했습니다.");
            } else {
                chat.replyText("리스트에 없는 유저입니다.");
            }
        } else {
            CaroSel(chat, [{ text: ".채금해제 @멘션 의 형태로 써주세요." }]);
        }
    }
    if (chat.Text == "/읽은사람" && chat.Type == 26 && admin.includes(id)) {
        if (!readMessage[roomId]) {
            chat.replyText("99명이 넘는 방에서는 해당 기능을 사용하실 수 없습니다.");
        } else {
            var r = readMessage[roomId][chat.attachmentList[0].SourceLogId];
            if (!r || r.length == 0) {
                chat.replyText("기록된 읽은 사람이 없습니다.");
            } else {
                chat.replyText("읽은사람 리스트입니다...." + "\u200b".repeat(1000) + "\n\n", "" + r.join("\n"));
            }
        }
    }
    if (chat.Text == "/모두강퇴" && admin.includes(id)) {
        var list = chat.channel.dataStruct.displayMemberList.map(x => x.userId);
        var value = 0;
        var max = list.length;
        tt = setInterval(() => {
            if (value >= max) {
                clearInterval(tt);
            } else {
                client.OpenLinkManager.kickMember(chat.channel, list[value]);
                value++;
            }
        }, 110);
    }
    if (chat.Text == "/방폭" && admin.includes(id)) {
        CaroSel(chat, [{ text: "봄수정", images: [{ image: "https://s3.ap-northeast-2.amazonaws.com/elasticbeanstalk-ap-northeast-2-176213403491/media/magazine_img/magazine_283/5-2-%EC%8D%B8%EB%84%A4%EC%9D%BC.jpg", isLive: true }] }]);
    }
    if (chat.Text.startsWith("/강퇴 ") && admin.includes(id)) {
        var _Mention = getMention(chat);
        var v = getMention(chat);
        if (!_Mention) {
            chat.replyText("/강퇴 @멘션 의 형태로 써주세요.");
        } else {
            if (String(v)) {
                client.OpenLinkManager.kickMember(chat.channel, v);
                chat.replyText("강퇴 완료.");
            }
        }
    }
    if (chat.Text.startsWith("/글쓰기 ") && admin.includes(id)) {
        var a = chat.Text.substr(4).trim();
        client.chatManager.sendRaw(chat.channel, 98, '', {
            "os": [
                {
                    "t": 1,
                    "ct": a,
                    "jct": a
                },
                {
                    "t": 2,
                    "st": 1,
                    "url": ""
                }
            ]
        })
    }
    if (chat.Text == '눈팅' && admin.includes(id)) {
        if (chat.Type == 26) {
            var chlog = '';
            client.ChatManager.getChatListFrom(chat.channel.id, chat.attachmentList[0].SourceLogId).then((r) => {
                if (r.result) {
                    r.result.forEach((v, i) => {
                        chlog += '보낸사람: ' + v.channel.getUserInfo(v.sender).Nickname + '\n' + '보낸사람 ID: ' + v.sender.id + '\n' + '보낸시간:; ' + new Date(v.sendTime * 1000) + '\n' + '메세지 타입: ' + node_kakao.ChatType[v.Type] + '\n' + 'Attachment(raw): ' + JSON.stringify(v.rawAttachment, null, 3) + '\n' + '메세지: ' + v.Text + '\n --------------------------------------- \n'
                    })
                    chat.replyText('헤헿 \n' + '\u200b'.repeat(500) + chlog)
                }
            })
        }
    }
    if (chat.Text == "/모두멘션" && admin.includes(id)) {
        chat.replyText(...Array.from(chat.channel.userInfoMap).map(s => s[1].user).map(s => new node_kakao.ChatMention(s)));
    }
    if (chat.Text.startsWith(".임티 ")) {
        var z = chat.Text.replace(".임티 ", "");
        if (admin.includes(id) || assist.includes(id)) {

            client.chatManager.sendRaw(chat.channel, 6, '', {
                "type": "animated-sticker/digital-item",
                "path": z + ".emot_011.webp",
                "name": "(이모티콘)",
                "sound": "",
                "width": "360",
                "height": "360",
                "msg": "",
                "alt": "카카오 이모티콘"
            });
        } else {
            chat.replyText("부관리자,관리자만 가능");
        }

        if (chat.Text == "보톡") {
            client.chatManager.sendRaw(chat.channel, 51, '보이스톡 해요', {
                "type": "cinvite",
                "csIP": "211.231.102.60",
                "csIP6": "2404:4600:6:23e:211:231:102:60",
                "csPort": 9000,
                "callId": "95138542137123542",
                "duration": 0
            }
            )
        }
    }
    if (chat.Type == 26 && chat.Text == "/삭제" && admin.includes(id)) {
        client.ChatManager.deleteChat(chat.channel.Id, chat.attachmentList[0].SourceLogId);
    }
    if (chat.text.startsWith("/아이디 ") && mentionList.length > 0 && admin.includes(id)) {
        chat.replyText(String(mentionList[0].UserId))
    }
    if (chat.Text.startsWith("/정보 ") && admin.includes(id)) {
        var _Mention = getMention(chat);
        client.chatManager.sendRaw(chat.channel, 23, 'Search', {
            "L": chat.channel.getUserInfoId(String(_Mention)).memberStruct.originalProfileImageUrl,
            "Q": chat.channel.getUserInfoId(String(_Mention)).memberStruct.nickname,
            "V": "image",
            "R": [
                {
                    "D": chat.channel.getUserInfoId(String(_Mention)).memberStruct.nickname,
                    "L": chat.channel.getUserInfoId(String(_Mention)).memberStruct.originalProfileImageUrl,
                    "I": chat.channel.getUserInfoId(String(_Mention)).memberStruct.originalProfileImageUrl,
                    "W": 10,
                    "H": 10
                }
            ]
        })
    }

    if (chat.Text.startsWith("/프로필") && admin.includes(id)) {
        var pro = chat.Text.split("프로필 ")[1];
        client.chatManager.sendRaw(chat.channel, 17, 'Unknown', {
            "userId": pro,
            "nickName": "",
            "fullProfileImageUrl": "",
            "profileImageUrl": "",
            "statusMessage": ""
        }
        )
    }
    if (chat.Text == "/임티 1" && admin.includes(id)) {
        chat.Channel.sendTemplate(new node_kakao.AttachmentTemplate(new node_kakao.EmoticonAniAttachment('(이모티콘)', '4412207.emot_009.webp', undefined, undefined, undefined, '120', '120', '카카오 이모티콘')));
    }
    if (chat.Text == "/임티 2" && admin.includes(id)) {
        chat.Channel.sendTemplate(new node_kakao.AttachmentTemplate(new node_kakao.EmoticonAniAttachment('(이모티콘)', '4412207.emot_017.webp', undefined, undefined, undefined, '120', '120', '카카오 이모티콘')));
    }
    if (chat.Text == "/임티 3" && admin.includes(id)) {
        chat.Channel.sendTemplate(new node_kakao.AttachmentTemplate(new node_kakao.EmoticonAniAttachment('(이모티콘)', '4412207.emot_020.webp', undefined, undefined, undefined, '120', '120', '카카오 이모티콘')));
    }
    if (chat.Text == "/임티 4" && admin.includes(id)) {
        chat.Channel.sendTemplate(new node_kakao.AttachmentTemplate(new node_kakao.EmoticonAniAttachment('(이모티콘)', '4412207.emot_003.webp', undefined, undefined, undefined, '120', '120', '카카오 이모티콘')));
    }
    if (chat.Text == "/임티 5" && admin.includes(id)) {
        chat.Channel.sendTemplate(new node_kakao.AttachmentTemplate(new node_kakao.EmoticonAniAttachment('(이모티콘)', '4412207.emot_042.webp', undefined, undefined, undefined, '120', '120', '카카오 이모티콘')));
    }
    if (chat.Text.startsWith("!큰임티 ") && admin.includes(id)) {

        var c = chat.Text.substr(5);

        client.chatManager.sendRaw(chat.channel, 25, '', { "name": "(이모티콘)", "path": "4412207.emot_041.webp", "type": "image/webp", "width": c, "height": c, "xconVersion": 1, "s": 0, "alt": "카카오 이모티콘" })
    }
    if (chat.Text == "/가리기" && admin.includes(id)) {
        var list = messages[roomId].reverse();
        var value = 0;
        var max = list.length;
        if (max.length != 0) {
            tt = setInterval(() => {
                if (value >= max) {
                    clearInterval(tt);
                } else {
                    client.OpenLinkManager.hideChat(chat.channel, list[value]);
                    value++;
                }
            }, 110);
            messages[roomId] = [];
        } else {
            chat.replyText("기록된 메시지가 없습니다.");
        }
    }
    if (chat.Text == "/도배" && admin.includes(id)) {
        tt1 = setInterval(() => {
            chat.replyText(Math.random().toString(36).slice(2, 11));
        }, 110);
    }
    if (chat.Text == "/중지" && admin.includes(id)) {
        clearInterval(tt1);
        tt1 = null;
    }
    if (chat.Text == "/작동" && admin.includes(id)) {
        chat.replyText("작동중")
    }
    if (chat.Text.startsWith("/유튜브 ") && admin.includes(id)) {
        var Search = chat.Text.split("유튜브 ")[1];
        chat.replyText("https://www.youtube.com/results?search_query=" + Search);
    }
    if (chat.Text.startsWith("/유튜브채널 ") && admin.includes(id)) {
        var channel = chat.Text.split("유튜브채널 ")[1];
        chat.replyText("https://www.youtube.com/channel/" + channel);
    }
    if (chat.Text == "/명령어" && admin.includes(id)) {
        chat.replyText("💻💻💻" + "\u200b".repeat(1000) + "\n명령어\n",
            "________\n",
            "/봇\n",
            "└ (방장일때만 사용가능) 봇을 주는 명령어입니다. 도배와 욕설을 해도 신고가 불가능합니다.\n",
            "/부방\n",
            "└ (방장일때만 사용가능) 부방을 주는 명령어입니다.\n",
            "/제거\n",
            "└ (방장일때만 사용가능) 봇,부방을 제거하는 명령어 입니다.\n",
            "/감지 @맨션\n",
            "└ 그 사람을 감지합니다.\n",
            "/채팅금지 @맨션\n",
            "└ (방장, 부방장만 사용가능) 그 사람의 채팅을 금지합니다.\n",
            "/채금해제 @맨션\n",
            "└ (방장, 부방장만 사용가능) 그 사람의 채팅금지를 해제 합니다.\n",
            "/읽은사람\n",
            "└ (99명 이상인 방 사용불가) 내 채팅이나 상대방 채팅을 누가 읽었는지 확인합니다\n",
            "/모두강퇴\n",
            "└ (방장, 부방장만 사용가능) 모든 유저를 강퇴합니다.\n",
            "/방폭\n",
            "└ (막힘) 방을 터트립니다.\n",
            "/강퇴 @맨션\n",
            "└(방장,부방장만 가능) 모두강퇴 와는 달리 한사람만 강퇴 할수 있습니다.\n",
            "/글쓰기 하고싶은말\n",
            "└ 공지 처럼 글을 쓸수 있습니다.\n",
            "/모두멘션\n",
            "└ (99명 이상인 방 사용불가) 방 인원 전체를 맨션합니다.\n",
            "/임티 1~5\n",
            "└ 다양한 임티가 나옵니다\n",
            "/도배\n",
            "└ 같은 문자가 아닌 다양한 문자로 도배합니다.\n",
            "/중지\n",
            "└ 도배를 중지합니다\n",
            "/작동\n",
            "└ 작동을 확인하는 명령어입니다.\n",
            "ㄷㄷ\n",
            "└ 치면 이모티콘이 나옵니다.\n",
            "ㅋㅋ\n",
            "└ 치면 이모티콘이 나옵니다.\n",
            "?\n",
            "└ 치면 이모티콘이 나옵니다.\n",
            "??\n",
            "└ 치면 이모티콘이 나옵니다.\n",
            "ㅠㅠ\n",
            "└ 치면 이모티콘이 나옵니다.\n",
            "ㅜㅜ\n",
            "└ 치면 이모티콘이 나옵니다.\n",
            "/아무말\n",
            "└ 랜덤으로 아무말이나 나옵니다\n",
            "무야호\n",
            "└ 무야호 할아버지가 나옵니다\n",
            "/ip\n",
            "└ 상대방 아이피를 딸수 있습니다.\n",
            "조커\n",
            "└ 조커가 나옵니다.\n",
            "봄수정\n",
            "└ 봄수정 유튜브&디코 주소가 나옵니다.\n",
            "/학교/학교코드/학년|반\n",
            "└ 현재 자가진단을 누가 했는지 나옵니다.\n")
    }
    if (chat.Text == "/아무말" && admin.includes(id)) {
        var value = Math.floor(Math.random() * 54);
        switch (value) {
            case 0:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F109.png");
                break;
            case 1:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F110.png");
                break;
            case 3:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F111.png");
                break;
            case 4:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F165.png");
                break;
            case 5:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F113.png");
                break;
            case 6:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F164.png");
                break;
            case 7:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F115.png");
                break;
            case 8:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F163.png");
                break;
            case 9:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F117.png");
                break;
            case 10:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F118.png");
                break;
            case 11:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F119.png");
                break;
            case 12:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F120.png");
                break;
            case 13:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F121.png");
                break;
            case 14:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F162.png");
                break;
            case 15:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F123.png");
                break;
            case 16:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F124.png");
                break;
            case 17:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F125.png");
                break;
            case 18:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F126.png");
                break;
            case 19:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F127.png");
                break;
            case 20:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F128.png");
                break;
            case 21:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F129.png");
                break;
            case 22:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F130.png");
                break;
            case 23:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F131.png");
                break;
            case 24:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F132.png");
                break;
            case 25:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F133.png");
                break;
            case 26:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F134.png");
                break;
            case 27:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F135.png");
                break;
            case 28:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F136.png");
                break;
            case 29:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F137.png");
                break;
            case 30:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F138.png");
                break;
            case 31:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F139.png");
                break;
            case 32:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F140.png");
                break;
            case 33:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F141.png");
                break;
            case 34:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F142.png");
                break;
            case 35:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F143.png");
                break;
            case 36:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F144.png");
                break;
            case 37:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F145.png");
                break;
            case 38:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F146.png");
                break;
            case 39:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F147.png");
                break;
            case 40:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F148.png");
                break;
            case 41:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F149.png");
                break;
            case 42:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F150.png");
                break;
            case 43:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F151.png");
                break;
            case 44:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F152.png");
                break;
            case 45:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F153.png");
                break;
            case 46:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F154.png");
                break;
            case 47:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F155.png");
                break;
            case 48:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F156.png");
                break;
            case 49:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F157.png");
                break;
            case 50:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F158.png");
                break;
            case 51:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F159.png");
                break;
            case 52:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F160.png");
                break;
            case 53:
                sendAny(chat, "https://search1.daumcdn.net/thumb/C328x328.q85/?fname=https%3A%2F%2Ft1.search.daumcdn.net%2Ftextcon%2Fstatics%2F161.png");
                break;
        }
    }
    function sendAny(chat, link) {
        client.chatManager.sendRaw(chat.channel, 23, 'Search', {
            "L": link,
            "Q": "아무말",
            "V": "image",
            "R": [
                {
                    "D": "아무말",
                    "L": link,
                    "I": link,
                    "W": 800,
                    "H": 800
                }
            ]
        })
    }
    if (chat.Text == "무야호" && admin.includes(id)) {
        var value = Math.floor(Math.random() * 1);
        switch (value) {
            case 0:
                sendAny(chat, "https://img.khan.co.kr/news/2021/03/14/l_2021031401001628900137951.jpg");
                break;
        }
    }
    function sendAny(chat, link) {
        client.chatManager.sendRaw(chat.channel, 23, 'Search', {
            "L": link,
            "Q": "봄수정",
            "V": "image",
            "R": [
                {
                    "D": "봄수정",
                    "L": link,
                    "I": link,
                    "W": 476,
                    "H": 351
                }
            ]
        })
    }
    if (chat.Text == "/iip" && admin.includes(id)) {
        var value = Math.floor(Math.random() * 1);
        switch (value) {
            case 0:
                sendAny(chat, "https://stopify.co/join.php?id=SBFUVU.lnk");
                break;
        }
    }
    function sendAny(chat, link) {
        client.chatManager.sendRaw(chat.channel, 23, 'Search', {
            "L": link,
            "Q": "자세히보기",
            "V": "image",
            "R": [
                {
                    "D": "자세히보기",
                    "L": link,
                    "I": link,
                    "W": 10,
                    "H": 10
                }
            ]
        })
    }
    if (chat.Text == "/앙앙" && admin.includes(id)) {
        var value = Math.floor(Math.random() * 1);
        switch (value) {
            case 0:
                sendAny(chat, "https://iplogger.org/2Fjwp6");
                break;
        }
    }
    function sendAny(chat, link) {
        client.chatManager.sendRaw(chat.channel, 23, 'Search', {
            "L": link,
            "Q": "자세히보기",
            "V": "image",
            "R": [
                {
                    "D": "자세히보기",
                    "L": link,
                    "I": link,
                    "W": 800,
                    "H": 800
                }
            ]
        })
    }


    if (chat.Text == "조커" && admin.includes(id)) {
        var value = Math.floor(Math.random() * 1);
        switch (value) {
            case 0:
                sendAny(chat, "https://cdn.discordapp.com/attachments/831495862852124727/839160612260675589/c419c8c82cd3a8626677c4adae404fb3_11207399552-1-1.png");
                break;
        }
    }
    if (chat.Text.startsWith("ev ") && admin.includes(id)) {
        chat.replyText(String(eval(chat.text.substr(3))))
    }
    function sendAny(chat, link) {
        client.chatManager.sendRaw(chat.channel, 23, 'Search', {
            "L": link,
            "Q": "봄수정",
            "V": "image",
            "R": [
                {
                    "D": "봄수정",
                    "L": link,
                    "I": link,
                    "W": 205,
                    "H": 302
                }
            ]
        })
    }
    if (chat.Text == "봄수정") {
        var value = Math.floor(Math.random() * 2);
        switch (value) {
            case 0:
                chat.replyText("https://www.youtube.com/channel/UCn7seSVRA84bGyPaitLIsxg");
                break;
            case 1:
                chat.replyText("https://discord.gg/PWxBzpwXYB");
                break;
        }
    }
    function schoolCode(schoName) {
        fs.readFile('school.txt', 'utf8', function (err, data) {
            var coder = data.split(schoName + "\",\"schoolCode\":\"")[1].split("\",")[0];
            chat.replyText(schoName + '의 학교코드는 \"' + coder + '\" 입니다.');
        });
    }
    if (chat.Text.startsWith('/코드 ')) {
        var schoName = chat.Text.substr(4);
        schoolCode(chat, schoName);
    }
    if (chat.Text.startsWith('/학교') && admin.includes(id)) {
        try {
            var coder = chat.Text.split('/학교/')[1].split("/")[0];
            var grades = chat.Text.substr(15).split('|')[0];
            var classs = chat.Text.split('|')[1];
            request({ uri: "http://193.123.246.37/api/isSurvey?org=" + coder + "&grade=" + grades + "&class=" + classs }, (e, r, bo) => {
                var bodys = bo.replace(/(\|[ ㅤ]*[0-9]{1,2}번[^\|(?! \|)]*[\|(?! \|)])/g, "\n$1");
                chat.replyText("자가진단 현황" + "\u200b".repeat(1000) + bodys);
            })
        } catch (e) {
            chat.replyText('오류입니다 다시 시도하세요.');
        }
    } // /학교/학교코드/학년|반
});
function rand() {
    return [1, 1, 1, 1, 1].map(() => {
        let i = Math.floor(Math.random() * 26);
        let add = Math.random() > 0.5 ? 65 : 97;
        return String.fromCharCode(i + add);
    }).join("");
}
var chatCount = {};

function response(room, msg, sender, isGroupChat, _replier, ImageDB) {
    var replier = {};
    replier.reply = function (msg) {
        _replier.reply(msg);
        chatCount[room] = 0;
    };
}
function getMention(chat) {
    var zr = chat.getMentionContentList();
    if (!zr[0]) {
        return null;
    }
    return zr[0].UserId;
}
client.on("message_read", function (channel, reader, logId) {
    if (readMessage[channel.id] === undefined) readMessage[channel.id] = {}; //채널 긁어오기
    if (readMessage[channel.Id][logId] === undefined) readMessage[channel.Id][logId] = []; //메시지 별로 배열 선언하기
    if (!Detect[channel.id]) Detect[channel.id] = [];
    if (!record[channel.id]) record[channel.id] = [];
    var usinfo = channel.getUserInfo(reader); //userInfo
    if (!usinfo) return;
    if (!usinfo.memberStruct) return;
    if (!record[channel.id].includes(logId)) record[channel.id].push(logId);
    if (Object.keys(readMessage[channel.id]).length >= 50) {
        delete readMessage[channel.id][Object.keys(readMessage[channel.id])[0]];
    }
    try {
        for (var j in Detect[channel.id]) {
            if (Detect[channel.id][j] == String(usinfo.memberStruct.userId)) {
                channel.sendText(new node_kakao.ChatMention(usinfo), "님이 읽었습니다.");
                var _index = Detect[channel.id].indexOf(String(usinfo.memberStruct.userId))
                Detect[channel.id].splice(_index, 1);
            }
        }
    } catch (e) { }
    Object.keys(readMessage[channel.id]).map(e => {
        try {
            if (!readMessage[channel.id][e].includes(usinfo.memberStruct.nickname)) { //각 메시지에 읽음목록 추가
                readMessage[channel.Id][e].push(String(usinfo.memberStruct.nickname)); //위와같음
            }
        } catch (e) {
            console.log("readMessage 오류가 발생하였습니다.\n" + e.stack);
        }
    });
})
var info = new node_kakao.CustomInfo(
    "봄수정",
    "Carousel",
    "plusfriend_bot",
    "https://naver.com",
    "6.4.5",
    "6.4.5",
    "2.6.1",
    "2.3.5",
    undefined,
    undefined,
    undefined,
    undefined,
    false, // Link
    true, // BigChat
    false, // Sercure
    false, // KakaoVerifed (카카오 뱃지)
    true, // CanForward
    true, // Ref
    true // Ad
)
function CaroSel(chat, slide, userInfo, style) {
    if (!userInfo) { userInfo = { memberStruct: { nickname: "Bot", profileImageUrl: "" } } };
    style = style ? style : "";
    var content = new node_kakao.CustomCarouselContent(
        node_kakao.CustomType.FEED, slide.map(feed => {
            feed.buttons = feed.buttons || [];
            feed.images = feed.images || [];
            var buttonTypes = { "up-down": 1, "left-right": 0 };
            if (feed.buttonType == "left-right") feed.buttons = feed.buttons.slice(0, 2);
            else if (feed.buttonType == "up-down") feed.buttons = feed.buttons.slice(0, 5);
            var cont = new node_kakao.CustomFeedContent(
                new node_kakao.TextDescFragment(feed.text, feed.desc),
                buttonTypes[feed.buttonType],
                feed.buttons.map(s => {
                    return new node_kakao.ButtonFragment(
                        s.text,
                        "both",
                        new node_kakao.URLFragment(...new Array(4).fill(s.url))
                    );
                }),
                feed.images.map(s => {
                    return new node_kakao.ImageFragment(s.image,
                        s.width || -1, s.height || -1, s.cropStyle || 0, s.isLive || false)
                }),
                feed.images.length,
                undefined,
                true,
                undefined,
                new node_kakao.ProfileFragment(
                    new node_kakao.TextDescFragment(style + userInfo.memberStruct.nickname, ""),
                    undefined,
                    undefined,
                    new node_kakao.ImageFragment(userInfo.memberStruct.profileImageUrl, 200, 200)
                ),
                new node_kakao.SocialFragment()
            );
            return cont;
        })
    );
    var attachment = new node_kakao.CustomAttachment(info, content);
    var template = new node_kakao.AttachmentTemplate(attachment, "카카오링크");
    return chat.replyTemplate(template);
}
