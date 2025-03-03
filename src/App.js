import './App.css';
import React, { useState } from 'react';
import { GoogleGenerativeAI } from "@google/generative-ai";
import ReactMarkdown from 'react-markdown';
import FlatList from 'flatlist-react';

export default function App() {
  const [messages, setMessages] = useState([]); // Each message: { id, sender, text }
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;
    // Save current input to use later in the prompt
    const userInput = input;
    const userMessage = { id: Date.now().toString(), sender: 'user', text: userInput };
    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const genAI = new GoogleGenerativeAI(process.env.REACT_APP_API_KEY);
      const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
      
      const prompt = `
        Take on the teaching style of Jesus as a Pastor who loves Him and answer the user’s questions as they explore how Jesus might respond.
        Act as a teacher of Jesus' words, telling one of his parables and relating it to modern times.
        Reference relevant gospel passages whenever possible. Please remember you are not Jesus, but a humble servant of Him.
        
        User Query: ${userInput}
      `;

      const result = await model.generateContent(prompt);
      console.log(result.response.text());
      const pastorReply = { 
        id: (Date.now() + 1).toString(), 
        sender: 'pastor', 
        text: result.response.text() 
      };
      setMessages(prev => [...prev, pastorReply]);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <FlatList
        list={messages}
        renderItem={(item) => (
          <div style={ item.sender === 'pastor' ? styles.pastor : styles.user }>
            <ReactMarkdown>{item.text}</ReactMarkdown>
          </div>
        )}
        renderWhenEmpty={() => <div style={styles.chatHistory}>What questions do you have for the AI Pastor?</div>}
        style={styles.chatHistory}
      />
      {loading && <div style={styles.loading}>Loading...</div>}
      <div style={styles.inputContainer}>
        <input
          style={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask your question..."
          onKeyDown={(e) => { if (e.key === 'Enter') sendMessage(); }}
        />
        <button onClick={sendMessage} style={styles.sendButton} disabled={loading}>
          {loading ? 'Loading...' : <span style={styles.sendButtonText}>Send</span>}
        </button>
      </div>
    </div>
  );
}

const styles = {
  container: { 
    display: 'flex', 
    flexDirection: 'column', 
    height: '100vh', 
    backgroundColor: '#fff', 
    padding: '10px' 
  },
  chatHistory: { 
    flex: 1, 
    overflowY: 'auto', 
    paddingBottom: '20px' 
  },
  user: { 
    backgroundColor: '#e0f7fa', 
    alignSelf: 'flex-end', 
    margin: '5px', 
    padding: '10px', 
    borderRadius: '5px', 
    maxWidth: '60%' 
  },
  pastor: { 
    backgroundColor: '#fff9c4', 
    alignSelf: 'flex-start', 
    margin: '5px', 
    padding: '10px', 
    borderRadius: '5px', 
    maxWidth: '60%' 
  },
  inputContainer: { 
    display: 'flex', 
    flexDirection: 'row', 
    alignItems: 'center', 
    borderTop: '1px solid #ccc', 
    padding: '5px' 
  },
  input: { 
    flex: 1, 
    height: '40px', 
    border: '1px solid #ccc', 
    borderRadius: '5px', 
    padding: '0 10px' 
  },
  sendButton: { 
    marginLeft: '10px', 
    backgroundColor: '#007aff', 
    padding: '10px', 
    borderRadius: '5px', 
    border: 'none', 
    cursor: 'pointer' 
  },
  sendButtonText: { 
    color: '#fff' 
  },
  loading: { 
    margin: '10px', 
    textAlign: 'center' 
  }
};
