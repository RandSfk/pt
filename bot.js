let botName = "";
let prefix = ['.', '!'];
let chatTp = "";
let owner = "Rndxft";

function sendKeyEvent(key, type) {
    var eventObj;
    if (typeof KeyboardEvent === 'function') {
        eventObj = new KeyboardEvent(type, {
            keyCode: key,
            which: key,
            bubbles: true,
            cancelable: true
        });
    } else {
        eventObj = document.createEvent("Events");
        eventObj.initEvent(type, true, true);
        eventObj.keyCode = key;
        eventObj.which = key;
    }
    document.dispatchEvent(eventObj);
}
function clickCloseButton() {
    const closeButton = document.querySelector('.btn-close');
    if (closeButton) {
        closeButton.click();
        console.log('Button clicked!');
    } else {
        console.log('Button not found!');
    }
}

async function getUsername() {
    sendKeyEvent(74, 'keydown');
    await new Promise(resolve => setTimeout(resolve, 1000));
    sendKeyEvent(74, 'keyup');
    const inputElement = document.querySelector('input[placeholder="Name of your character"]');
    const username = inputElement ? inputElement.value : '';
    return username;
}

async function fetchAndLogUsername() {
    const username = await getUsername();
    console.log(username);
    botName = username;
    clickCloseButton();
}

function sm(msg) {
    let chatTA = document.querySelector("#chat-box > div > div > div.chat-textarea-wrap > textarea");
    let sendUi = document.querySelector("#chat-box > div > div > div.chat-box-controls > ui-button");
    if (chatTA && sendUi) {
        chatTA.value = msg;
        let event = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        sendUi.dispatchEvent(event);
        chatTA.value = "";
    } else {
        console.log('Chat input atau tombol kirim tidak ditemukan.');
    }
}

function command(user, msg, mtype) {
    if (!user || !msg || !mtype) return;
    console.log(`${user}: ${msg}`);
    if (!prefix.some(p => msg.startsWith(p))) return;

    let args = msg.split(' ');
    let cmd = args.shift().substring(1);
    let text = args.join(' ');

    function reply(message) {
        if (mtype === 'whisper') {
            setIn(() => {
                sm(`/whisper ${user} ${message}`);
            }, 3000);
        } else {
            setTimeout(() => {
                sm(`/${mtype} ${message}`);
            }, 2000);
        }
        sm('/clearchat')
    }

    switch (cmd) {
        case 'ping':
            reply('pong!');
            break;
        case 'help':
            reply('Command tersedia: ping, help, say, info');
            break;
        case 'say':
            reply(text || 'Ketik sesuatu setelah !say');
            break;
        case 'info':
            reply('Saya adalah chatbot yang membantu dalam game ini!');
            break;
        case 'sit':
            if (user !== owner) {
                reply('');
                break;
            }
            reply('Shap duduk');
            sm('/sit');
            break;
        case 'stand':
            if (user !== owner) {
                reply('So asik lu '+user);
                break;
            }
            reply('Shap berdiri');
            sm('/stand');
            break;
        case 'fly':
            if (user !== owner) {
                reply('So asik lu '+user);
                break;
            }
            reply('Shap terbang');
            sm('/fly');
            break;
        case 'lay':
            if (user !== owner) {
                reply('So asik lu '+user);
                break;
            }
            reply('Shap berbaring');
            sm('/lay');
            break;
        case 'sleep':
            reply('Shap tidur');
            sm('/sleep');
            break;
        case 'kiss':
            if (user !== owner) {
                reply('So asik lu '+user);
                break;
            }
            reply('Muacchhh');
            sm('/kiss');
            break;
        case 'turn':
            reply('Shap putar');
            sm('/turn');
            break;
        case 'botinfo':
            reply(`Owner: ${owner}`);
            setTimeout(() => {
                reply(`Bot name: ${botName}`);
            }, 2000);
            setTimeout(() => {
                reply(`Chat type: ${chatTp}`);
            }, 4000);

            setTimeout(() => {
                reply(`Prefix: ${prefix.join(', ')}`);
            }, 6000);
            break;

        case 'cek_khodam':
            let list_khodam = [
                'Laba Laba Sunda',
                'Gajah Ngambang',
                'Nenek Kipas Angin',
                'Pinguin Bawa Kipas',
                'Si Kucing Gendut',
                'Raja Mie Goreng',
                'Putri Kupu Kupu Ajaib',
                'Bapak Bawang Merah',
                'Tikus Kocak',
                'Kera Kaki Dua',
                'Si Monyet Ngangkang',
                'Ayam Pecah Kaca',
                'Tikus Sok Jagoan',
                'Babi Suka Ngegas',
                'Singa Gila Makan Kacang',
                'Kambing Ngambek',
                'Ular Berjamaah',
                'Kucing Malas Jaga Rumah',
                'Bebek Terbang Pake Parasut',
                'Kodok Gendut Suka Joget'
            ];
            list_khodam = list_khodam.sort(() => Math.random() - 0.5);
            let randomNames = list_khodam[0];
            console.log(randomNames);
            reply(`${user} Khodam kmu adalah ${randomNames}`);
            break;


        case 'left':
            if (user !== owner) {
                reply('So asik lu '+user);
                break;
            }
            sendKeyEvent(37, 'keydown'); // Press the left arrow key (keydown)
            setTimeout(() => {
                sendKeyEvent(37, 'keyup'); // Release the left arrow key (keyup) after 1 second
            }, 200);
            break;

        case 'up':
            if (user !== owner) {
                reply('So asik lu '+user);
                break;
            }
            sendKeyEvent(38, 'keydown'); // Press the up arrow key (keydown)
            setTimeout(() => {
                sendKeyEvent(38, 'keyup'); // Release the up arrow key (keyup) after 1 second
            }, 200);
            break;

        case 'right':
            if (user !== owner) {
                reply('So asik lu '+user);
                break;
            }
            sendKeyEvent(39, 'keydown');
            setTimeout(() => {
                sendKeyEvent(39, 'keyup');
            }, 200);
            break;

        case 'down':
            if (user !== owner) {
                reply('So asik lu '+user);
                break;
            }
            sendKeyEvent(40, 'keydown');
            setTimeout(() => {
                sendKeyEvent(40, 'keyup');
            }, 200);
            break;
        default:
            //reply('Command tidak ditemukan!');
            break;
    }
}



function observeChat() {
    const targetNode = document.querySelector('.chat-log-scroll-inner');
    const callback = function (mutationsList) {
        mutationsList.forEach(mutation => {
            if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        const timestamp = node.querySelector('.chat-line-timestamp')?.textContent.trim();
                        const name = node.querySelector('.chat-line-name-content')?.textContent.trim();
                        const message = node.querySelector('.chat-line-message')?.textContent.trim();
                        if (name === botName) {
                            return;
                        }
                        const chatLine = node;
                        const chatClassList = chatLine.classList;
                        const lastClass = chatClassList[chatClassList.length - 1];
                        let chatType = '';
                        if (lastClass === 'chat-line-whisper') {
                            chatType = 'whisper';
                        } else if (lastClass === 'chat-line-whisper-thinking') {
                            chatType = 'whisper-think';
                        } else if (lastClass === 'chat-line-party') {
                            chatType = 'party';
                        } else if (lastClass === 'chat-line-party-thinking') {
                            chatType = 'party-think';
                        } else if (lastClass === 'chat-line-supporter-1') {
                            chatType = 'tier 1';
                        } else if (lastClass === 'chat-line-supporter-2') {
                            chatType = 'tier 2';
                        } else if (lastClass === 'chat-line-supporter-3') {
                            chatType = 'tier 3';
                        } else if (lastClass === 'chat-line-supporter-4') {
                            chatType = 'tier 4';
                        } else if (lastClass === 'chat-line-thinking') {
                            chatType = 'think';
                        } else {
                            chatType = 'say';
                        }
                        command(name, message, chatType);
                    }
                });
            }
        });
    };
    const observer = new MutationObserver(callback);
    const config = { childList: true, subtree: true };
    observer.observe(targetNode, config);
}

fetchAndLogUsername();

function settingMenu() {
    const topMenu = document.querySelector('.top-menu');

    const button = document.createElement('button');
    button.classList.add('tombol-setting');

    const icon = document.createElement('i');
    icon.classList.add('fa-solid', 'fa-crown');
    button.appendChild(icon);
    const dropdown = document.createElement('div');
    dropdown.style.display = 'none';
    dropdown.classList.add('deropdown');

    dropdown.innerHTML = `
    <div class="text-success py-1" style="display: flex; align-items: center;">
        <label for="ownerInput" style="width: 200px;">Nama Owner</label>
        <input class="form-control" type="text" id="ownerInput" name="owner" style="width: 200px; height: 20px;" placeholder="Masukkan nama..." required>
    </div>
    <div class="text-success py-1" style="display: flex; align-items: center;">
        <label for="botInput" style="width: 200px;">Nama Bot</label>
        <input class="form-control" type="text" id="botInput" name="bot" style="width: 200px; height: 20px;" placeholder="Masukkan nama..." required>
    </div>
    <div class="text-success py-1" style="display: flex; align-items: center;">
        <label for="prefixInput" style="width: 200px;">Prefix</label>
        <input class="form-control" type="text" id="prefixInput" name="prefix" style="width: 200px; height: 20px;" placeholder="Masukkan nama..." required>
    </div>
    <div style="margin-top: 10px; display: flex; justify-content: flex-start; align-items: center;">
        <button id="settingsForm" class="btn btn-primary" style="height: 30px; width: 100px;" type="submit">Save</button>
    </div>
    <div class="py-1" style="display: flex; align-items: center;">
        <div id="alert-save"></div>
    </div>

`;

    const customBlock = document.createElement('div');
    customBlock.classList.add('custom-blocks');
    customBlock.appendChild(button);
    customBlock.appendChild(dropdown);

    topMenu.insertBefore(customBlock, topMenu.firstChild);


    button.addEventListener('click', function () {
        if (dropdown.style.display === 'none' || dropdown.style.display === '') {
            dropdown.style.display = 'block';
            document.getElementById('ownerInput').value = owner;
            document.getElementById('botInput').value = botName;
            document.getElementById('prefixInput').value = prefix;

        } else {
            dropdown.style.display = 'none';
        }
    });

    const style = document.createElement('style');
    style.innerHTML = `
    .custom-blocks {
        position: relative;
        display: inline-block;
    }

    .tombol-setting {
        background-color: transparent;
        color: white;
        border: none;
        cursor: pointer;
        font-size: 24px;
        border-radius: 5px;
        shadow: 0 6px 9px rgba(0, 0, 0, 0.7);
    }

    .tombol-setting:hover {
        background-color: transparent;
        color: #ccc;
    }

    .deropdown {
        position: absolute;
        top: 100%;
        left: 50%;
        transform: translateX(-50%);
        background-color: white;
        border: 1px solid #ccc;
        box-shadow: 0 8px 16px rgba(0, 0, 0, 0.2);
        border-radius: 5px;
        padding: 10px;
        min-width: 100px;
        display: none;
        z-index: 1;
        margin-top: 50px;
    }

    .deropdown::before {
        content: '';
        position: absolute;
        top: -10px;
        left: 50%;
        transform: translateX(-50%);
        border-width: 10px;
        border-style: solid;
        border-color: transparent transparent white transparent;
        margin-top: -9px;
    }

    .deropdown div {
        padding: 8px 12px;
        cursor: pointer;
    }

    .deropdown div:hover {
        background-color: #f1f1f1;
    }
`;
    document.head.appendChild(style);

    const fontAwesomeLink = document.createElement('link');
    fontAwesomeLink.rel = 'stylesheet';
    fontAwesomeLink.href = 'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css';
    document.head.appendChild(fontAwesomeLink);
};
observeChat();
settingMenu();
const button = document.querySelector('.btn.btn-primary');
button.addEventListener('click', function () {
    const ownerInput = document.getElementById('ownerInput');
    const botInput = document.getElementById('botInput');
    const prefixInput = document.getElementById('prefixInput');
    const savenfo = document.getElementById('alert-save');

    const ownerValue = ownerInput.value;
    const botValue = botInput.value;
    const prefixValue = prefixInput.value;
    if (!ownerValue || !botValue || !prefixValue) {
        alert('Tolong lengkapi semua data');
        return;
    }
    owner = ownerValue;
    botName = botValue;
    prefix = prefixValue.split(',');
    const alertSave = document.getElementById('alert-save');
    alertSave.textContent = "Save Success!";
    alertSave.style.color = "green";
    sm('/think Perubahan Disimpan')
    setTimeout(() => {
        document.getElementById('alert-save').textContent = ''
    }, 2000);

    console.log("Nama Owner:", owner);
    console.log("Nama Bot:", botName);
    console.log("Prefix:", prefix);
});
