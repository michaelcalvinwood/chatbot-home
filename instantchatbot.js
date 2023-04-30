
// const instantChatbotToken="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJvcGVuQUlLZXkiOiJzay1XdmYzcnlKNmVQRGhFUWJCZ2xXdlQzQmxia0ZKSWxuM0xkeWJNcjA0MTRDZ2NIWjciLCJpYXQiOjE2ODIwMDMzMDR9.4vdfhHRLlRnWX4n5WfQxlxeIcDw_4UyF6yd0urpU7LM";
// const instantChatbotHost='https://node.pymnts.com:6250/pymnts-ai';

let form;
let chatContainer;

let loadInterval

function loader(element) {
    element.textContent = ''

    loadInterval = setInterval(() => {
        element.textContent += '.';

        if (element.textContent === '....') {
            element.textContent = '';
        }
    }, 300);

    return loadInterval;
}

function typeText(element, text) {
    element.innerHTML = '';
    let index = 0

    let interval = setInterval(() => {
        console.log('index text.length', index, text.length);
        if (index < text.length) {
            element.innerHTML += text.charAt(index)
            index++
            chatContainer.scrollTop = chatContainer.scrollHeight;
        } else {
            clearInterval(interval)
        }
    }, 20)
}

function generateUniqueId() {
    const timestamp = Date.now();
    const randomNumber = Math.random();
    const hexadecimalString = randomNumber.toString(16);

    return `id-${timestamp}-${hexadecimalString}`;
}

function chatStripe(isAi, value, uniqueId) {
    return (
        `
        <div class="wrapper ${isAi && 'ai'}">
            <div class="chat">
                <div class="profile">
                    <img 
                      src=${isAi ? 'https://instantchatbot.net/assets/bot.svg' : 'https://instantchatbot.net/assets/user.svg'} 
                      alt="${isAi ? 'bot' : 'user'}" 
                    />
                </div>
                <div class="message" id=${uniqueId}>${value}</div>
            </div>
        </div>
    `
    )
}

const handleIntantChatbotSubmit = async (e) => {
    console.log('instantChatbot: got submit');
    e.preventDefault()

    const data = new FormData(form)

    // user's chatstripe
    chatContainer.innerHTML += chatStripe(false, data.get('prompt'))

    // to clear the textarea input 
    form.reset()

    // bot's chatstripe
    const uniqueId = generateUniqueId()
    chatContainer.innerHTML += chatStripe(true, " ", uniqueId)

    // to focus scroll to the bottom 
    chatContainer.scrollTop = chatContainer.scrollHeight;

    // specific message div 
    const messageDiv = document.getElementById(uniqueId)

    // messageDiv.innerHTML = "..."
    const intervalId = loader(messageDiv)

    // setTimeout(() => {
    //     clearInterval(intervalId);
    //     typeText(messageDiv, "here we are");
    // }, 2000)
    // return;

    console.log('instantChatbot host', instantChatbotHost);
  
    const response = await fetch(`${instantChatbotHost}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            prompt: data.get('prompt'),
            token: instantChatbotToken
        })
    })

    clearInterval(loadInterval)
    messageDiv.innerHTML = " "

    if (response.ok) {
        const data = await response.json();
        const parsedData = data.bot.trim() // trims any trailing spaces/'\n' 

        typeText(messageDiv, parsedData)
    } else {
        const err = await response.text()

        messageDiv.innerHTML = "Something went wrong"
        alert(err)
    }
}

const instantChatbotLoaded = () => {
    console.log('instantChatbot: loaded', instantChatbotToken);
    const body = document.querySelector('body');
    // const chatDiv = document.createElement('div');
    // chatDiv.style.width = 'fit-content';
    // chatDiv.style.height = 'fit-content';
    // chatDiv.style.zIndex = 1000000;
    // chatDiv.style.position = 'fixed';
    // chatDiv.style.right = '0';
    // chatDiv.style.bottom = '0';

    const chatbotImage = document.createElement('div');
    chatbotImage.setAttribute('id', 'chatbotImage');
    chatbotImage.innerHTML = `
        <div id="instantChatbotImageContainer">
            <div id="chatbot">
                <div class="dot"></div>
                <div class="dot"></div>
                <div class="dot"></div>
            </div>
        <div id="chatbot-corner"></div>
            <div id="antenna">
                <div id="beam"></div>
                <div id="beam-pulsar"></div>
            </div>
        </div>
    `;
    body.append(chatbotImage);

    const instantChatAppContainer = document.createElement('div');
    instantChatAppContainer.setAttribute('id', 'chatbotContainer');
    instantChatAppContainer.classList.add('chatbotClosed');
    instantChatAppContainer.innerHTML = `
        <div id="chatbotApp">
            <img id="chatbotCloseIcon" src="https://instantchatbot.net/assets/close.svg" />
                <div id="chatContainer"></div>
                <form id="instantChatbotForm">
                    <textarea name="prompt" rows="1" cols="1" placeholder="Ask PYMNTS AI..."></textarea>
                    <button type="submit"><img src="https://instantchatbot.net/assets/send.svg" alt="send" />
                </form>
            </div>
        </div>
    `
    body.append(instantChatAppContainer);

    // chatDiv.innerHTML = `
    //     <div id="chatbotImage">
    //         <div id="instantChatbotImageContainer">
    //             <div id="chatbot">
    //                 <div class="dot"></div>
    //                 <div class="dot"></div>
    //                 <div class="dot"></div>
    //             </div>
    //             <div id="chatbot-corner"></div>
    //             <div id="antenna">
    //                 <div id="beam"></div>
    //                 <div id="beam-pulsar"></div>
    //             </div>
    //         </div>
    //     </div>

    //     <div id="chatbotContainer" class="chatbotClosed">
    //         <div id="chatbotApp">
    //             <img id="chatbotCloseIcon" src="https://instantchatbot.net/assets/close.svg" />
    //             <div id="chatContainer"></div>
    //             <form>
    //                 <textarea name="prompt" rows="1" cols="1" placeholder="Ask AI..."></textarea>
    //                 <button type="submit"><img src="https://instantchatbot.net/assets/send.svg" alt="send" />
    //             </form>
    //         </div>
    //     </div>
    // `;
    //body.append(chatDiv);
    form = document.getElementById('instantChatbotForm');

    console.log('instantChatbot form', form);
    chatContainer = document.querySelector('#chatContainer')
    form.addEventListener('submit', handleIntantChatbotSubmit)
    form.addEventListener('keyup', (e) => {
        if (e.keyCode === 13) {
            handleIntantChatbotSubmit(e)
        }
    })
    const chatImage = document.getElementById('chatbotImage');
    const chatbotContainer = document.getElementById('chatbotContainer');

    chatImage.addEventListener('click', () => {     
        chatImage.classList.add('hidden');
        chatbotContainer.classList.remove('hidden');
        chatbotContainer.classList.remove('chatbotClosed');
        chatbotContainer.classList.add('chatbotFullsize');
    })

    const chatbotCloseIcon = document.getElementById('chatbotCloseIcon');
    chatbotCloseIcon.addEventListener('click', () => {
        chatbotContainer.classList.add('hidden');
        chatbotContainer.classList.add('chatbotClosed');
        chatbotContainer.classList.remove('chatbotFullsize');
        chatImage.classList.remove('hidden');
    })
}

window.addEventListener('DOMContentLoaded', instantChatbotLoaded);

