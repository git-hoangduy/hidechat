'use client'

import styles from "./page.module.css";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useState, useRef, useEffect } from "react";

import { storage, database } from "./firebase";
import { ref as dbRef, push, query, onValue, limitToLast, orderByChild } from "firebase/database";
import { ref as storageRef, uploadBytes, getDownloadURL } from "firebase/storage";

import GifPicker from 'gif-picker-react';

export default function Home() {

  const [currentUser, setCurrentUser] = useState("");

  const [message, setMessage] = useState("")
  const [messages, setMessages] = useState([]);
  const messagesEndRef = useRef(null);
  
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);

  const [showGifPicker, setShowGifPicker] = useState(false);
  const gifPickerRef = useRef(null);

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      if (message.trim()) {
        const messagesRef = dbRef(database, 'messages');
        push(messagesRef, { text: message, sender: currentUser, timestamp: Date.now() });
        setMessage("");
      }
    }
  }

  const handleSendMessage = (e) => {
    if (message.trim()) {
      const messagesRef = dbRef(database, 'messages');
      push(messagesRef, { text: message, sender: currentUser, timestamp: Date.now() });
      setMessage("");
    }
  }

  const handleInputChange = (e) => {
    setMessage(e.target.value);
  };

  const handleEmojiSelect = (e) => {
    let emoji = e.native;
    setMessage(message + emoji);
  }

  const handleGifSelect = (e) => {
    const gifUrl = e.preview.url;
    const messagesRef = dbRef(database, 'messages');
    push(messagesRef, { gif: gifUrl, sender: currentUser, timestamp: Date.now() });
    setShowGifPicker(false);
  }

  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return; 
  
    try {
      const fileRef = storageRef(storage, `images/${Date.now()}_${file.name}`);
      await uploadBytes(fileRef, file);
      const imageUrl = await getDownloadURL(fileRef);
  
      const messagesRef = dbRef(database, "messages");
      push(messagesRef, { image: imageUrl, sender: currentUser, timestamp: Date.now() });
  
      console.log("Ảnh đã tải lên:", imageUrl);
    } catch (error) {
      console.error("Lỗi tải ảnh:", error);
    }
  };

  useEffect(() => {
    const userCookie = document.cookie.split('; ').find((row) => row.startsWith('hcuser='))?.split('=')[1];
    userCookie && setCurrentUser(userCookie)
  }, []);

  useEffect(() => {
    const messagesRef = dbRef(database, 'messages');
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

      const isEmojiToggleButton = event.target.closest('.emoji-toggle');
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target) && !isEmojiToggleButton) {
        setShowEmojiPicker(false);
      }

      const isGifToggleButton = event.target.closest('.gif-toggle');
      if (gifPickerRef.current && !gifPickerRef.current.contains(event.target) && !isGifToggleButton) {
        setShowGifPicker(false);
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
        <div className="messages px-4 py-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message mt-3 ${msg.sender === currentUser ? 'me text-end' : ''}`}
            >
              {msg.text && (
                <div className="message-text d-inline-block shadow py-2 px-2 rounded text-start">
                  {msg.text}
                  <div className="message-time mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
              )}

              {msg.gif && (
                <div className="message-gif mt-2 text-start d-inline-block">
                  <img src={msg.gif} alt="GIF" className="img-fluid rounded" />
                  <div className="message-time mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
              )}

              {msg.image && (
                <div className="message-image mt-2 text-start d-inline-block">
                  <img src={msg.image} alt="Uploaded" className="img-fluid rounded" />
                </div>
              )}

              {/* <div className={`message-text d-inline-block shadow py-2 px-2 rounded text-start`}>
                {msg.text}
                <div className="message-time mt-1">
                  {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                </div>
              </div>
              */}
              
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>
        <div className="chatbox">
          <div className="chatbox-top">
            <div className="chat-features d-flex px-3 gap-1">
              <div className="border rounded px-2 btn-toggle gif-toggle" onClick={() => setShowGifPicker(!showGifPicker)}>
                <i className="bi bi-filetype-gif"></i>
              </div>
              <div className="border rounded px-2 btn-toggle image-toggle d-none" onClick={() => document.getElementById("imageUpload").click()}>
                <i className="bi bi-image"></i>
                <input type="file" id="imageUpload" className="d-none" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>
            {showGifPicker && (
              <div ref={gifPickerRef} className="gif-picker-box">
                <GifPicker tenorApiKey={"AIzaSyCLDuxIJPnbJXVNFHwgXuVMrT4esJgApD8"} onGifClick={handleGifSelect}/>
              </div>
            )}
          </div>
          <div className="chatbox-bottom pt-1">
            <div className="container-fluid">
              <div className="row">
                <div className="col-10 col-md-12">
                  <div className="position-relative">
                      <input type="text" className="form-control rounded-pill input-message" placeholder="" spellCheck="false" value={message} onChange={handleInputChange} onKeyDown={handleKeyDown}/>
                      <i className={'bi '+(showEmojiPicker ? 'bi-x-circle' : 'bi-emoji-smile' ) + ' position-absolute emoji-toggle'} onClick={() => setShowEmojiPicker(!showEmojiPicker)}></i>
                  </div>
                </div>
                <div className="col-2 px-0 d-md-none">
                  <button className="text-center h-100 send-message" onClick={handleSendMessage}>
                    <i className="bi bi-send"></i>
                  </button>
                </div>
              </div>
              {showEmojiPicker && (
                <div ref={emojiPickerRef} className="emoji-picker-box">
                  <Picker data={data} onEmojiSelect={handleEmojiSelect} />
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
