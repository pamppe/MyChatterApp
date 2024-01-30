// App.js
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Auth } from "./auth";
import { firestore, auth } from './config/firebase';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";

function App() {
  const [user] = useAuthState(auth);

  return (
      <div className='App'>
        <header>
          {user ? <SignOut /> : <Auth />}
        </header>
        <section>
          {user && <ChatRoom />}
        </section>
      </div>
  );
}

function ChatRoom() {
  const dummy = useRef();
  const messagesEndRef = useRef(null);

  // Reference to the collection
  const messagesRef = collection(firestore, 'messages');

  // Creating a query
  const messagesQuery = query(messagesRef, orderBy('createdAt'), limit(25));

  // Using the query with useCollectionData
  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });
  const [formValue, setFormValue] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();

    const { uid, photoURL } = auth.currentUser;

    await addDoc(messagesRef, {
      text: formValue,
      createdAt: serverTimestamp(),
      uid,
      photoURL,
    });

    setFormValue('');
    scrollToBottom();
  };

  return (
      <>
        <main className="chat-messages">
          {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg} />)}
          <div ref={messagesEndRef} />
        </main>

        <form onSubmit={sendMessage}>
          <input value={formValue} onChange={(e) => setFormValue(e.target.value)} />
          <button type="submit">Send</button>
        </form>
      </>
  );
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  const avatarSrc = photoURL || 'avatar.png';

  return (
      <div className={`message ${messageClass}`}>
        <img src={avatarSrc} alt="Avatar" onError={(e) => { e.target.onerror = null; e.target.src = 'avatar.png'; }} />
        <p>{text}</p>
      </div>
  );
}

function SignOut() {
  return (
      <button onClick={() => auth.signOut()}>Sign Out</button>
  );
}

export default App;
