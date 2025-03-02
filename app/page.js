'use client'

import styles from "./page.module.css";
import data from '@emoji-mart/data'
import Picker from '@emoji-mart/react'
import { useState, useRef, useEffect } from "react";

import { database } from "./firebase";
import { ref as dbRef, push, query, onValue, limitToLast, orderByChild } from "firebase/database";

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
      if (event.shiftKey) {
        // setMessage(prev => prev + "\n");
      } else {
        if (message.trim()) {
            const messagesRef = dbRef(database, 'messages');
            push(messagesRef, { text: message, sender: currentUser, timestamp: Date.now() });
            setMessage("");
        }
        event.preventDefault();
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

  // const resizeImage = (file, maxWidth, maxHeight, quality = 0.7) => {
  //   return new Promise((resolve) => {
  //       const reader = new FileReader();
  //       reader.readAsDataURL(file);
  //       reader.onload = (event) => {
  //           const img = new Image();
  //           img.src = event.target.result;
  //           img.onload = () => {
  //               let width = img.width;
  //               let height = img.height;

  //               if (width > maxWidth || height > maxHeight) {
  //                   const scaleFactor = Math.min(maxWidth / width, maxHeight / height);
  //                   width *= scaleFactor;
  //                   height *= scaleFactor;
  //               }

  //               const canvas = document.createElement("canvas");
  //               canvas.width = width;
  //               canvas.height = height;
  //               const ctx = canvas.getContext("2d");
  //               ctx.drawImage(img, 0, 0, width, height);

  //               canvas.toBlob((blob) => {
  //                   resolve(blob);
  //               }, "image/jpeg", quality);
  //           };
  //       };
  //   });
  // };
  
  // Imgbb upload
  // const handleImageUpload = async (event) => {
  //   let file = event.target.files[0];
  //   if (!file) return;

  //   const API_KEY = "cf45a8172c3f0fe63ecf7f03ca62b8e4";

  //   try {

  //       const resizedFile = await resizeImage(file, 800, 800, 0.7);

  //       const formData = new FormData();
  //       formData.append("image", resizedFile, "resized.jpg");

  //       const response = await fetch(`https://api.imgbb.com/1/upload?key=${API_KEY}`, {
  //           method: "POST",
  //           body: formData
  //       });

  //       const result = await response.json();

  //       if (result.success) {
  //           const imageUrl = result.data.url;
  //           console.log("Ảnh đã tải lên:", imageUrl);
            
  //           const messagesRef = dbRef(database, "messages");
  //           push(messagesRef, {
  //               image: imageUrl,
  //               sender: currentUser,
  //               timestamp: Date.now()
  //           });
  //       } else {
  //           console.error("Lỗi tải ảnh lên ImgBB:", result.error);
  //       }
  //   } catch (error) {
  //       console.error("Lỗi khi upload ảnh:", error);
  //   }
  // };

  // Cloudinary upload
  const handleImageUpload = async (event) => {
    let file = event.target.files[0];
    if (!file) return;

    const CLOUD_NAME = "dsytquwvk";
    const UPLOAD_PRESET = "ml_default";

    try {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("upload_preset", UPLOAD_PRESET);
        formData.append("folder", "hidechat");
        formData.append("quality", "auto");
        formData.append("fetch_format", "auto");

        // Upload lên Cloudinary
        const response = await fetch(`https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`, {
            method: "POST",
            body: formData
        });

        const result = await response.json();

        if (result.secure_url) {
            const imageUrl = result.secure_url;
            console.log("Photo uploaded:", imageUrl);
            
            const messagesRef = dbRef(database, "messages");
            push(messagesRef, {
                image: imageUrl,
                sender: currentUser,
                timestamp: Date.now()
            });
        } else {
            console.error("Error uploading photos to Cloudinary:", result.error);
        }
    } catch (error) {
        console.error("Error when uploading photos:", error);
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
      <div className="main bg-white">
        <div className="messages px-4 py-2">
          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message mt-3 ${msg.sender === currentUser ? 'me text-end' : ''}`}
            >
              {msg.text && (
                <div className="message-text d-inline-block py-2 px-3 rounded text-start">
                  {msg.text}
                  <div className="message-time mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
              )}

              {msg.gif && (
                <div className="message-gif mt-2 text-start d-inline-block">
                  <img src={msg.gif} alt="GIF" className="img-fluid rounded" loading="lazy"/>
                  <div className="message-time mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
              )}

              {msg.image && (
                <div className="message-image mt-2 text-start d-inline-block rounded">
                  <img 
                    src={msg.image.replace("/upload/", "/upload/w_300,h_300,c_limit,q_auto,f_auto/")}  
                    alt="Uploaded" 
                    className="img-fluid rounded" 
                    loading="lazy"
                  />
                  <div className="message-time mt-1">
                    {new Date(msg.timestamp).toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit', hour12: false })}
                  </div>
                </div>
              )}
              
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
              <div className="border rounded px-2 btn-toggle image-toggle" onClick={() => document.getElementById("imageUpload").click()}>
                <i className="bi bi-image"></i>
                <input type="file" id="imageUpload" className="d-none" accept="image/*" onChange={handleImageUpload} />
              </div>
            </div>
            {showGifPicker && (
              <div ref={gifPickerRef} className="gif-picker-box">
                <GifPicker tenorApiKey={"AIzaSyCLDuxIJPnbJXVNFHwgXuVMrT4esJgApD8"} autoFocusSearch={false} onGifClick={handleGifSelect}/>
              </div>
            )}
          </div>
          <div className="chatbox-bottom pt-1">
            <div className="position-relative px-3">
              <div className="input-group">
                <textarea className="form-control input-message" spellCheck="false" onChange={handleInputChange} onKeyDown={handleKeyDown} value={message}></textarea>
                <i className={'bi '+(showEmojiPicker ? 'bi-x-circle' : 'bi-emoji-smile' ) + ' position-absolute emoji-toggle'} onClick={() => setShowEmojiPicker(!showEmojiPicker)}></i>
                <button className="text-center send-message" onClick={handleSendMessage}>
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
  );
}
