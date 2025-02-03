'use client'

import styles from "./page.module.css";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useState, useRef, useEffect } from "react";

import database from "./firebase";
import { ref, set, push, query, onValue, limitToLast, orderByChild } from "firebase/database";

export default function Home() {

  const [currentUser, setCurrentUser] = useState("");

  const [message, setMessage] = useState("")
  const [showPicker, setShowPicker] = useState(false);

  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);

  const pickerRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (message.trim()) {

        const messagesRef = ref(database, 'messages');
        push(messagesRef, { text: message, sender: currentUser, timestamp: Date.now() });
        setMessage("");

        // const messagesRef = ref(database, `messages/${currentUser}`);
        // set(messagesRef, { 
        //   text: message, 
        //   sender: currentUser, 
        //   timestamp: Date.now() 
        // });
        // setMessage("");
      }
    }
  }

  const handleSendMessage = (e) => {
    if (message.trim()) {
      const messagesRef = ref(database, 'messages');
      push(messagesRef, { text: message, sender: currentUser, timestamp: Date.now() });
      setMessage("");
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const hanldeEmojiSelect = (e) => {
    let emoji = e.native;
    setMessage(message + emoji);
  }

  useEffect(() => {
    const userCookie = document.cookie.split('; ').find((row) => row.startsWith('hcuser='))?.split('=')[1];
    userCookie && setCurrentUser(userCookie)
  }, []);

  useEffect(() => {
    const messagesRef = ref(database, 'messages');
    const messagesQuery = query(messagesRef, orderByChild('timestamp'), limitToLast(20));

    onValue(messagesQuery, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const chatMessages = Object.values(data);
        setMessages(chatMessages);
      }
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      const isToggleButton = event.target.closest('.emoji-toggle');
      console.log(isToggleButton)
      if (pickerRef.current && !pickerRef.current.contains(event.target) && !isToggleButton) {
        setShowPicker(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);


  return (
    <div className={styles.page}>
      <div className="main">
        <div className="messages px-3 py-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message mt-3 ${msg.sender === currentUser ? 'me text-end' : ''}`}
            >
              <div className={`message-text d-inline-block shadow py-1 px-3 rounded-pill ${msg.sender === currentUser ? 'text-light bg-primary' : ''}`}>
                {msg.text}
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbox">
          <div className="chatbox-top"></div>
          <div className="chatbox-bottom mt-3">
            <div className="row">
              <div className="col-10 col-md-12">
                <div className="position-relative">
                    <input type="text" className="form-control rounded-pill input-message" placeholder="" spellCheck="false" value={message} onChange={handleInputChange} onKeyDown={handleKeyDown}/>
                    <i className={'bi '+(showPicker ? 'bi-x-circle' : 'bi-emoji-smile' )+' position-absolute emoji-toggle'} onClick={() => setShowPicker(!showPicker)}></i>
                </div>
              </div>
              <div className="col-2 px-0 d-md-none">
                <button className="text-center h-100 send-message" onClick={handleSendMessage}>
                  <i className="bi bi-send"></i>
                </button>
              </div>
            </div>
            {showPicker && (
              <div ref={pickerRef} className="picker-style-custom">
                <Picker data={data} onEmojiSelect={hanldeEmojiSelect} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
