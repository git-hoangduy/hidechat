// app/firebase.js
import { initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';
import { getStorage } from "firebase/storage";

const firebaseConfig = {
    apiKey: "AIzaSyBDG7r8yICxyhbkKFhEcm7cTix8OUhbizQ",
    authDomain: "hidechat-42764.firebaseapp.com",
    projectId: "hidechat-42764",
    storageBucket: "hidechat-42764.firebasestorage.app",
    messagingSenderId: "871336933432",
    appId: "1:871336933432:web:a5a27d138a19fd405a8ecd",
    measurementId: "G-1YF3PW8V5Z",
    databaseURL: 'https://hidechat-42764-default-rtdb.asia-southeast1.firebasedatabase.app'
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);
const storage = getStorage(app);

export { database, storage };
