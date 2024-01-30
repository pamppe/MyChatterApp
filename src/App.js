// App.js
import React, { useEffect, useRef, useState } from 'react';
import './App.css';
import { Auth } from "./auth";
import { firestore, auth } from './config/firebase';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { useCollectionData } from "react-firebase-hooks/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import Modal from "./Modal";

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
  const messagesEndRef = useRef(null);

  // Reference to the collection
  const messagesRef = collection(firestore, 'messages');

  // Creating a query
  const messagesQuery = query(messagesRef, orderBy('createdAt'), limit(25));

  // Using the query with useCollectionData
  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });
  const [formValue, setFormValue] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const [showModal, setShowModal] = useState(false);

  const sendMessage = async (e) => {
    e.preventDefault();

      if (formValue.trim() === '') {
          setShowModal(true); // Show modal when the message is empty
          return;
      }

    const { uid, photoURL } = auth.currentUser;

      try {
          await addDoc(messagesRef, {
              text: formValue,
              createdAt: serverTimestamp(),
              uid,
              photoURL,
          });
          setFormValue(''); // Clear the input field after sending the message
          scrollToBottom();
          setErrorMessage('');
        } catch (error) {
        console.error("Error sending message:", error);
    }
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
            {errorMessage && <div className="error-message">{errorMessage}</div>}
        </form>
          {showModal && (
              <Modal
                  message="Message cannot be empty."
                  onClose={() => setShowModal(false)}
              />
          )}
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
