let servername = "overjjang.xyz";
// 테스트 서버: loungeonline.kro.kr
const serverIP = 'your.server.ip';  // 여기에 확인하려는 서버의 IP 주소나 도메인 입력
const apiUrlBase = 'https://api.mcsrvstat.us/3/';

const statusElement = document.getElementById('status');
const imageView = document.getElementById('image');
const motdView = document.getElementById('motd');
const playerList = document.getElementById('players');
const container = document.getElementById("container");
const serverchange = document.getElementById("otherservercheak");
const playerOnPing = document.getElementById("playerOnPing");
const moreInfo = document.getElementById("moreInfo");
const infoSummary = document.getElementById("infoSummary");
const progress = document.getElementById("progress-container");


function serverNameInput(fixedServerName = '') {
    const input = document.getElementById('servernameinput').value;
    servername = input ? input : servername;
    servername = fixedServerName ? fixedServerName : input;
    statusElement.classList.remove('offline');
    statusElement.innerHTML = `서버 상태를 확인 중입니다...`;
    playerList.style.visibility = `hidden`;
    container.style.visibility = "hidden";
    serverchange.style.visibility = 'hidden';
    moreInfo.style.visibility = 'hidden';
    progress.style.visibility = `visible`;
    checkServerStatus();
}

//import userInfo.json

let userInfo = [];

const xhr = new XMLHttpRequest();
xhr.open('GET', 'userInfo.json', true);
xhr.responseType = 'json';
xhr.onload = function() {
    userInfo = xhr.response.users;
};
xhr.send();

/**
 * 유저 아이디를 알려진 이름으로 변환
 * @param id
 * @return {*}
 */
function knownUserName(id){

    // 다 갈아엎어 ㅅㅂ
    const user = userInfo.find(user => user[0] === id);
    return user ? user[1] : id;
}

/**
 * 서버 상태 확인
 */

function checkServerStatus() {
    const apiUrl = `${apiUrlBase}${servername}`;
    fetch(apiUrl)
        .then(response => response.json())
        .then(data => {

            if (data.online) {
                console.log(data);
                statusElement.innerHTML = `서버가 열려 있습니다!<br>현재 플레이어: ${data.players.online} / ${data.players.max} `;
                statusElement.innerHTML += `<br>서버 주소 : ${servername}`
                playerOnPing.innerHTML = `${data.players.online} / ${data.players.max}`
                if(data.version && data.version.includes(".")){
                    statusElement.innerHTML += `<br>서버 버전 : ${data.version}`
                }
                else{
                    statusElement.innerHTML += `<br>서버 버전 : ${data.protocol.name}`
                }
                if(data.icon) imageView.src = `${data.icon}`;
                else {
                    imageView.style.width = "64px";
                    imageView.style.height = "64px";
                    imageView.src = `Unknown_server.png`;
                }
                motdView.innerHTML = `${data.motd.html[0]}<br>`;
                if (data.motd.html[1]) motdView.innerHTML +=`${data.motd.html[1]}`;
                if (data.players.list){
                    playerList.innerHTML = `<h3>플레이어 목록:</h3>`;
                    var i=0;
                    // console.log(data.players.list.length);
                    data.players.list.forEach(player => {
                        playerList.innerHTML +=
                            `<img src="https://minotar.net/helm/${player.name}/100.png" style="width: 16px; height: 16px;" alt="${player.name}">  ${knownUserName(player.name)}<br>`
                    });
                    if(data.players.online>data.players.list.length){
                        playerList.innerHTML += `외 ${data.players.online-data.players.list.length}명의 플레이어...`;
                    }
                }
                else if(data.players.online>0) {
                    playerList.innerHTML = `<p>플레이어 리스트를<br>불러올 수 없습니다.</p>`;
                    playerList.classList.add('none');
                }
                else playerList.innerHTML = `<p>플레이어가 없습니다</p>`
                container.style.visibility = `visible`;
                serverchange.style.visibility = `visible`;
                moreInfo.style.visibility = `visible`;
                infoSummary.innerHTML = ``;
                playerList.style.visibility = `visible`;
                if (data.software) infoSummary.innerHTML += `서버 소프트웨어: ${data.software}<br>`;
                if (data.version) infoSummary.innerHTML += `서버 버전: ${data.version}<br>`;
                if (data.protocol) infoSummary.innerHTML += `서버 프로토콜: ${data.protocol.name}<br>서버 프로토콜 버전: ${data.protocol.version}<br>`;
                if (data.plugins) {
                    pluginlist = "";
                    data.plugins.forEach(Plugin =>{
                        pluginlist +=`${Plugin.name} - ${Plugin.version}<br>`

                    })
                    infoSummary.innerHTML +=`<details><summary>플러그인 목록: </summary> ${pluginlist} </detalis>`;
                }
                if (data.mods) {
                    let modlist = "";
                    // for(let mod of data.mods){
                    //     modlist +=`${mod.name}`
                    //     if(mod.version.includes(".")) modlist += ` - ${mod.version}`
                    //     modlist += `<br>`
                    // }
                    data.mods.forEach(mod =>{
                        modlist +=`${mod.name}`
                        if(mod.version.includes(".")) modlist += ` - ${mod.version}`
                        modlist += `<br>`
                    })
                    infoSummary.innerHTML +=`<details><summary>모드 목록: </summary> ${modlist} </detalis>`;
                }
                progress.style.visibility = `hidden`;

                statusElement.classList.remove('offline');
            }

            // 서버가 닫혀있을때
            else {
                statusElement.textContent = '서버가 닫혀 있습니다.';
                imageView.src = ``;
                motdView.innerHTML = ``;
                container.style.visibility = `hidden`;
                playerList.style.visibility = `hidden`;
                playerList.innerHTML = ``;
                serverchange.style.visibility = "visible"
                progress.style.visibility = `hidden`;
                statusElement.classList.add('offline');
            }
        })
        .catch(error => {
            document.getElementById('status').innerHTML = '서버 상태를 확인할 수 없습니다.';
            console.error('Error fetching server status:', error);
            const otherservercheak = document.getElementById("otherservercheak")
            const progress = document.getElementById("progress-container");
            otherservercheak.style.visibility = `visible`;
            progress.style.visibility = `hidden`;

        });
}

// 페이지 로드 시 서버 상태 확인
checkServerStatus();

// 1분마다 서버 상태 갱신
setInterval(checkServerStatus, 60000);
