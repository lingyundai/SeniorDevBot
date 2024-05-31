import '@chatscope/chat-ui-kit-styles/dist/default/styles.min.css';
import { useState } from 'react';
import { MainContainer, 
        ChatContainer, 
        MessageList, 
        Message, 
        MessageInput, 
        TypingIndicator } from '@chatscope/chat-ui-kit-react';

const API_KEY = process.env.REACT_APP_OPENAI_API_KEY;

function App() {
  console.log(API_KEY);

  const [messages, setMessages] = useState([
    {
      message: "Hello, I am ChatGPT!",
      sender: "ChatGPT",
      direction: "incoming"
    }
  ]);
  const [typing, setTyping] = useState(false);

  const handleSend = async (message) => {
    const newMessage = {
      message: message,
      sender: "User",
      direction: "outgoing"
    }
    const newMessages = [...messages, newMessage]; // all old messages and the new message
    setMessages(newMessages);
    setTyping(true);
    await processMessageToChatGPT(newMessages);
  }
  async function processMessageToChatGPT(chatMessages) {
    let apiMessages = chatMessages.map((messageObject) => {
      let role = "";
      if (messageObject.sender === "ChatGPT") {
        // repsonse from chatgpt
        role = "assistant";
      }
      else {
        // message from user
        role = "user";
      }
      return {
        role: role,
        content: messageObject.message
      }
    });
    // define how ChatGPT talks
    const systemMessage = {
      role: "system",
      content: "Explain like I am an experienced software engineer."
    }
    const apiRequestBody = {
      "model": "gpt-3.5-turbo",
      "messages": [
        systemMessage,
        ...apiMessages
      ]
    }
    await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + API_KEY,
        "Content-Type": "application/json"
      },
      body: JSON.stringify(apiRequestBody)
      }).then((data) => {
        return data.json();
      }).then((data) => {
        console.log(data);
        console.log(data.choices[0].message.content);
        setMessages([
          ...chatMessages,
          {
            message: data.choices[0].message.content,
            sender: "ChatGPT",
            direction: "incoming"
          }
        ]);
        setTyping(false);
      })
  }

  return (
    <div className="App">
      <div style={{ position: "relative", height: "800px", width: "700px" }}>
        <MainContainer>
          <ChatContainer>
            <MessageList
              scrollBehavior='smooth'
              typingIndicator={typing ? <TypingIndicator content="ChatGPT is typing..." /> : null}
            >
              {messages.map((message, i) => {
                return <Message key={i} model={message} />
              })}
            </MessageList>
            <MessageInput placeholder='Type message here' onSend={handleSend}/>
          </ChatContainer>
        </MainContainer>
      </div>
    </div>
  );
}

export default App;
