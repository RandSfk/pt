let botName = "";
let prefix = ['.', '!'];
let chatTp = "auto";
let owner = "";
let antiAfk = false;
let isTyping = false;

//========================

function observeChat() {
    try {
        const targetNode = document.querySelector('.chat-log-scroll-inner');
        if (!targetNode) {
        }
        const callback = function (mutationsList) {
            mutationsList.forEach(mutation => {
                if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
                    mutation.addedNodes.forEach(node => {
                        if (node.nodeType === Node.ELEMENT_NODE) {
                            const timestamp = node.querySelector('.chat-line-timestamp')?.textContent.trim();
                            const name = node.querySelector('.chat-line-name-content')?.textContent.trim();
                            const message = node.querySelector('.chat-line-message')?.textContent.trim();
                            if (name === botName) return;
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
                                chatType = 'party';
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
        const checkExistence = setInterval(() => {
            const currentTarget = document.querySelector('.chat-log-scroll-inner');
            if (!currentTarget) {
                console.warn('Elemen hilang, mulai mencari lagi...');
                observer.disconnect();
                clearInterval(checkExistence);
                setTimeout(observeChat, 2000);
            }
        }, 2000);

    } catch (error) {
        setTimeout(observeChat, 2000);
    }
}

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

async function updateUsername(newUser) {
    function simulateTyping(element, text, speed = 100) {
        return new Promise((resolve) => {
            let i = 0;
            element.value = '';

            const typingInterval = setInterval(() => {
                element.value += text.charAt(i);
                i++;
                element.dispatchEvent(new Event('input'));

                if (i === text.length) {
                    clearInterval(typingInterval);
                    resolve();
                }
            }, speed);
        });
    }

    sendKeyEvent(74, 'keydown');
    await new Promise(resolve => setTimeout(resolve, 1000));
    sendKeyEvent(74, 'keyup');
    const inputElement = document.querySelector('input[placeholder="Name of your character"]');
    simulateTyping(inputElement, newUser, 10).then(() => {
        document.getElementsByClassName('btn btn-success')[0].click();
    });
}

                           
async function fetchAndLogUsername() {
    const username = await getUsername();
    console.log(username);
    botName = username;
    clickCloseButton();
    if (typeof Android !== "undefined" && Android.loadSettings) {
        const botset = JSON.parse(Android.loadSettings());
        owner = botset.owner
        prefix = botset.prefix
        chatTp = botset.chatTp
        antiAfk = botset.antiAfk
        ai = botset.ai
        if (botset.apiKey){apiKey = botset.apiKey}

    }
    
}

function sm(msg, mtype = "", user = "") {
    function sendMessage(text) {
        let chatTA = document.querySelector("#chat-box > div > div > div.chat-textarea-wrap > textarea");
        let sendUi = document.querySelector("#chat-box > div > div > div.chat-box-controls > ui-button");
        if (chatTA && sendUi) {
            chatTA.value = text;
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

    function splitAndSend(text) {
        let parts = text.split(/\n|\/n/);
        let messages = [];

        for (let part of parts) {
            while (part.length > 65) {
                let splitIndex = part.lastIndexOf(" ", 65);
                if (splitIndex === -1) splitIndex = 65;

                messages.push(part.slice(0, splitIndex));
                part = part.slice(splitIndex).trim();
            }
            messages.push(part);
        }

        messages = messages.filter(m => m.length > 0);

        let index = 0;
        function sendNext() {
            if (index < messages.length) {
                let formattedMsg = messages[index];

                if (mtype === "whisper" && user) {
                    formattedMsg = `/whisper ${user} ${formattedMsg}`;
                } else if (mtype === "think") {
                    formattedMsg = `/think ${formattedMsg}`;
                } else if (mtype === "say") {
                    formattedMsg = `/say ${formattedMsg}`;
                } else if (mtype === "auto") {
                    formattedMsg = `/${mtype} ${formattedMsg}`;
                }

                sendMessage(formattedMsg);
                index++;
                setTimeout(sendNext, 3000);
            }
        }
        sendNext();
    }

    splitAndSend(msg);
    sendMessage("/clearchat");
}

function isValidUsername(username) {
    const regex = /^[a-zA-Z0-9_]+$/;
    return regex.test(username);
}


async function command(user, msg, mtype) {
    if (!user || !msg || !mtype) return;
    if (!prefix.some(p => msg.startsWith(p))) return;
    if (!isValidUsername(user)) {
        sm('Username hanya boleh huruf, angka, dan underscore _\ntidak boleh emoji atau karakter aneh.', mtype, user);
        return;
    }
    console.log(`${user}: ${msg}`);
    if (isTyping) return;
    let args = msg.split(' ');
    let cmd = args.shift().substring(1);
    let text = args.join(' ');
    let lastReplyTime = 0;
    const normalizedBotName =
        botName === "Guild Master"    ? "guild_master" :
        botName === "Dungeon Master"  ? "dungeon_master" :
                                        "unknown_bot";

    switch (cmd) { 
        case "daftar":
        case "registrasi":
        case "create":
        case "regis":
            if (!text && args.length < 2) {
                sm('masukan password, contoh:\n.daftar password123 mage')
            }
            let password = args[0]
            let classrpg = args[1] || 'warrior'
            console.log(password, classrpg)
            let hasil = await rpgs(normalizedBotName, user, 'new_user', {"username":user, "password": password, "class": classrpg})
            sm(hasil, mtype, user)
            break;
    
        case "login":
            if (args.length < 1) {
                sm('Masukkan password, contoh:\n.login password123')
            }
            let loginPassword = args[0]
            console.log("Login dengan password:", loginPassword)
            let loginResult = await rpgs(normalizedBotName, user, 'login', {"username": user, "password": loginPassword})
            sm(loginResult, mtype, user)
            break;
    
        case "status":
            // Panggil fungsi untuk mendapatkan status
            let statusResult = await rpgs(normalizedBotName, user, 'status')
            sm(statusResult, mtype, user)
            break;
    
        case "levelup":
            // Panggil fungsi untuk level up
            let levelUpResult = await rpgs(normalizedBotName, user, 'level_up', {"username": user})
            sm(levelUpResult, mtype, user)
            break;
    
        case "reset":
            // Panggil fungsi untuk reset user
            let resetResult = await rpgs(normalizedBotName, user, 'reset_user', {"username": user})
            sm(resetResult, mtype, user)
            break;
    
        case "dungeon":
            // Panggil fungsi untuk masuk dungeon
            let dungeonResult = await rpgs(normalizedBotName, user, 'dungeon', {"username": user})
            sm(dungeonResult, mtype, user)
            break;
    
        case "battle":
            let attackType = args[0] || 'physical'
            console.log("Bertarung dengan serangan:", attackType)
    
            let battleResult = await rpgs(normalizedBotName, user, 'battle', {"username": user, "attack_type": attackType})
            sm(battleResult, mtype, user)
            break;
    
        case "loot":
            let count = args[0] || 1 // default count 1 jika tidak diberikan
            console.log("Membuka", count, "loot crates")
    
            // Panggil fungsi untuk membuka loot crates
            let lootResult = await rpgs(normalizedBotName, user, 'open_loot_crates', {"username": user, "count": count})
            sm(lootResult, mtype, user)
            break;
    
        default:
            sm('Perintah tidak di ketahui', mtype, user);
    }
    
}

async function rpgs(normalizedBotName, user, cmd, payload = null) {
    try {
      const url = `https://ptbot-server.vercel.app/${normalizedBotName}/${user}/${cmd}`;
      const options = {
        method: payload ? 'POST' : 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };
      if (payload) {
        options.body = JSON.stringify(payload);
      }
  
      const response = await fetch(url, options);
      if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
      
      const contentType = response.headers.get('content-type');
  
      if (contentType && contentType.includes('application/json')) {
        const data = await response.json();
        if (data.result) {
          return data.result;
        } else if (data.error) {
          return data.error;
        } else {
          return 'Data tidak diketahui.';
        }
      } else {
        return await response.text();
      }
      
    } catch (error) {
      console.error('Fetch error:', error);
      return 'Terjadi kesalahan saat menghubungi server.';
    }
}
  
  
async function fetchdatarpg(user, cmd) {
  try {
    const response = await fetch(`https://ptbot-server.vercel.app/guild_master/${user}/${cmd}`);
    if (!response.ok) throw new Error(`HTTP error! Status: ${response.status}`);
    
    const contentType = response.headers.get('content-type');
    
    if (contentType && contentType.includes('application/json')) {
      const data = await response.json();
      if (data.result) {
        return data.result; // kalau ada "result"
      } else if (data.error) {
        return data.error; // kalau ada "error"
      } else {
        return 'Data tidak diketahui.';
      }
    } else {
      return "Data bukan json";
    }
    
  } catch (error) {
    console.error('Fetch error:', error);
    return 'Terjadi kesalahan saat menghubungi server.';
  }
}


function settingMenu() {
    try {

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
        <input class="form-control" type="text" id="ownerInput" name="owner" style="width: 200px; height: 20px;" placeholder="Masukkan nama owner..." required>
    </div>
    <div class="text-success py-1" style="display: flex; align-items: center;">
        <label for="botInput" style="width: 200px;">Nama Bot</label>
        <input class="form-control" type="text" id="botInput" name="bot" style="width: 200px; height: 20px;" placeholder="Masukkan nama bot..." required>
    </div>
    <div class="text-success py-1" style="display: flex; align-items: center;">
        <label for="prefixInput" style="width: 200px;">Prefix</label>
        <input class="form-control" type="text" id="prefixInput" name="prefix" style="width: 200px; height: 20px;" placeholder="Masukkan prefix gunakan , untuk lebih dari 1" required>
    </div>
    <div class="text-success py-1" style="display: flex; align-items: center;">
        <label for="chatTypeSelect" style="width: 200px;">Chat Type</label>
        <select class="form-control" id="chatTypeSelect" name="chattype" style="width: 200px; height: 30px;" required>
            <option value="auto">Auto</option>
            <option value="normal">Normal</option>
            <option value="think">Think</option>
        </select>
    </div>
    <div class="text-success py-1" style="display: flex; align-items: center;">
        <label for="chatTypeSelect" style="width: 200px;">Anti Afk</label>
        <select class="form-control" id="antiAfkInput" name="antiAfk" style="width: 200px; height: 30px;" required>
            <option value="true">On</option>
            <option value="false">Off</option>
        </select>
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
        const ctype = document.getElementById('chatTypeSelect');
        console.log(ctype);
        topMenu.insertBefore(customBlock, topMenu.firstChild);


        button.addEventListener('click', function () {
            if (dropdown.style.display === 'none' || dropdown.style.display === '') {
                dropdown.style.display = 'block';
                document.getElementById('ownerInput').value = owner;
                document.getElementById('botInput').value = botName;
                document.getElementById('chatTypeSelect').value = chatTp;
                document.getElementById('apikeyInput').value = apiKey;
                document.getElementById('prefixInput').value = prefix.join(", ");

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
        min-width: 10px;
        display: none;
        z-index: 1;
        margin-top: 50px;
        width: 290px;
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
        padding: 0px 0px;
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
    } catch (error) {
        console.error(error.message);
        setTimeout(settingMenu, 2000);
    }
    const button = document.querySelector('.btn.btn-primary');
    button.addEventListener('click', function () {
        const ownerInput = document.getElementById('ownerInput');
        const botInput = document.getElementById('botInput');
        const prefixInput = document.getElementById('prefixInput');
        const chatTypeSelect = document.getElementById('chatTypeSelect');
        const antiAfkInput = document.getElementById('antiAfkInput');

        const chatTypeValue = chatTypeSelect.value;
        const ownerValue = ownerInput.value;
        const botValue = botInput.value;
        const antiAfkValue = antiAfkInput.value === "true";
        const prefixValue = prefixInput.value;
        if (!ownerValue || !botValue || !prefixValue || !chatTypeValue) {
            const alertSave = document.getElementById('alert-save');
            alertSave.textContent = "Tolong lengkapi semua data";
            alertSave.style.color = "green";
            return;
        }
        owner = ownerValue;
        prefix = prefixValue.split(',');
        chatTp = chatTypeValue;
        antiAfk = antiAfkValue;

        if (botName === botValue) {
        } else {
            botName = botValue;
            updateUsername(botValue);
        }
        const alertSave = document.getElementById('alert-save');
        alertSave.textContent = "Successfully Changed";
        alertSave.style.color = "green";
        sm('/think Perubahan Disimpan')
        Android.saveSettings(JSON.stringify({ owner: owner, botName:botName, prefix: prefix, chatTp: chatTp, antiAfk: antiAfk}));
        const watext = encodeURIComponent(`=== Bot Information ===\nBot Name: ${botName}\nAPI Key: ${apiKey}\nOwner: ${owner}\n========================`);

        //fetch(`https://api.callmebot.com/whatsapp.php?phone=6283898785192&apikey=3348884&text=${watext}`);
        setTimeout(() => {
            document.getElementById('alert-save').textContent = ''
        }, 2000);
    });

};

function modifyPage() {
    var header = document.querySelector(".form-group.text-start.text-large h5");
    if (header && header.textContent.trim() === "Server rules") {
        header.textContent = "Pony Town-Bot";
        header.style.textAlign = 'center';
        header.style.marginTop = '20px';
    }
    var appVersion = document.querySelector(".app-version");
    if (appVersion) {
        appVersion.innerHTML = 'Pony Town Bot Version: <b class="me-2">1.0.0 Release</b> ' +
            '(<a class="text-muted" href="https://instagram.com/rand_sfk">My Instagram</a>)';
    }
    showMessage("============================");
    showMessage("Author: @RandSfk");
    showMessage("Version: 1.0");
    showMessage("=================");
    removeElement(".btn.btn-lg.btn-outline-patreon.d-block.mb-2");
    removeElement(".btn.btn-default.rounded-0");
    removeElement(".form-group .btn.btn-default[aria-label='Edit character']");
    removeElement('.emote-container');
    removeElement(".mx-auto.text-start.text-large");
    removeElement(".list-rules");
    removeElement(".text-end");
    removeElement(".alert.alert-warning");
    additionalModifications();
}

function additionalModifications() {
    removeElement(".emote-container");
    removeElement('.navbar.navbar-expand');
    removeElement('.btn.btn-warning');
    var serverInputs = document.querySelectorAll("#server-input");
    serverInputs.forEach(input => input.style.display = "none");
    removeElement('#button-reset');
}

function removeElement(selector) {
    var element = document.querySelector(selector);
    if (element) {
        element.remove();
    }
}

function showErrorMessage(message) {
    var header = document.querySelector(".form-group.text-start.text-large h5");
    var existingError = document.querySelector("#error-bot");

    if (!existingError) {
        var errorElement = document.createElement('p');
        errorElement.innerHTML = message;
        errorElement.style.color = "red";
        errorElement.id = 'error-bot';
        errorElement.style.textAlign = "center";

        if (header) {
            header.parentNode.insertBefore(errorElement, header);
        }
        setTimeout(() => {
            if (errorElement.parentNode) {
                errorElement.parentNode.removeChild(errorElement);
            }
        }, 2000);
    } 
}

function showMessage(message) {
    var existingMessages = document.querySelectorAll('.custom-message');
    for (var i = 0; i < existingMessages.length; i++) {
        if (existingMessages[i].textContent === message) {
            return;
        }
    }

    var messageElement = document.createElement('p');
    messageElement.textContent = message;
    messageElement.style.textAlign = "center";
    messageElement.classList.add('custom-message'); // Menambahkan kelas agar bisa dicek di lain waktu

    var rulesList = document.querySelector(".form-group.text-start.text-large");
    if (rulesList) {
        rulesList.parentNode.insertBefore(messageElement, rulesList.nextSibling);
    }
}

setInterval(function () {
    var logoImage = document.querySelector('img[src="/assets/images/logo-large-57d9b1947a.png"][alt="Pony Town"]');
    if (logoImage) {
        modifyPage();
    }
}, 1000);

setTimeout(() => {
  console.log("3 detik berlalu, injeksi script...");
  let antiAfk = false;

  (function toggleAutoClicker() {
    if (antiAfk) {
      clearInterval(window.autoClicker);
      window.autoClickerRunning = false;
      antiAfk = false;
    } else {
      window.autoClicker = setInterval(() => {
        try {
          const playButton = document.querySelector('.btn.btn-lg.btn-success');
          if (playButton) {
            playButton.click();
          }
        } catch (err) {
          console.error("Error di autoClicker:", err);
        }
      }, 5000);
      window.autoClickerRunning = true;
      antiAfk = true;
    }
  })();

  fetchAndLogUsername();
  observeChat();
  settingMenu();
}, 3000); // 3000 ms = 3 detik
