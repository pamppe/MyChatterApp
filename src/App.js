import React, {useRef, useState} from 'react';
import './App.css';

import { initializeApp } from 'firebase/app';
import { addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { collection, query, orderBy, limit } from 'firebase/firestore';
import { getAuth, GoogleAuthProvider, signInWithPopup, signInAnonymously,} from 'firebase/auth';
import {useAuthState} from "react-firebase-hooks/auth";
import {useCollectionData} from "react-firebase-hooks/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyCrCAZWlXeoO34pzNEallWPRf6C86qg2co",
  authDomain: "mychatapp-4d6ed.firebaseapp.com",
  projectId: "mychatapp-4d6ed",
  storageBucket: "mychatapp-4d6ed.appspot.com",
  messagingSenderId: "90011669534",
  appId: "1:90011669534:web:4648956947ac255d9c0a0f",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);

function App() {

  const [user] = useAuthState(auth);

  return (
    <div className="App">
      <header>
        {user && <SignOut />}
      </header>

      <section>
        {user ? <ChatRoom /> : <SignIn />}
      </section>
    </div>
  );
}

function SignIn() {
  // Function for signing in with Google
  const signInWithGoogle = () => {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  };

  // Function for signing in anonymously
  const signAnonymous = () => {
    signInAnonymously(auth).catch(error => {
      console.error('Error signing in anonymously', error);
    });
  };

  return (
    <div>
    <button onClick={signInWithGoogle}>Sign in with Google</button>
    <button onClick={signAnonymous}>Sign in Anonymously</button>
    </div>
  );
}

function SignOut() {
  return auth.currentUser && (

    <button onClick={() => auth.signOut()}>Sign Out</button>
  )
}

function ChatRoom() {

  const dummy = useRef()

  // Reference to the collection
  const messagesRef = collection(firestore, 'messages');

  // Creating a query
  const messagesQuery = query(messagesRef, orderBy('createdAt'), limit(25));

  // Using the query with useCollectionData
  const [messages] = useCollectionData(messagesQuery, { idField: 'id' });

  const [formValue, setFormValue] = useState('');

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

    dummy.current.scrollIntoView({ behavior: 'smooth' });
  }

  return (
  <>
    <main>
      {messages && messages.map(msg => <ChatMessage key={msg.id} message={msg}/>)}
    </main>

    <div ref={dummy}></div>

    <form onSubmit={sendMessage}>
      <input value={formValue} onChange={(e) => setFormValue(e.target.value)}/>
      <button type="submit">🗣</button>
    </form>
  </>
)
}

function ChatMessage(props) {
  const { text, uid, photoURL } = props.message;
  const messageClass = uid === auth.currentUser.uid ? 'sent' : 'received';

  const avatarSrc = photoURL || 'avatar.png';

  return (
     <div className={`message ${messageClass}`}>
     <img src={avatarSrc} alt="Avatar" onError={(e)=> { e.target.onerror = null; e.target.src = 'avatar.png'; }} />
      <p>{text}</p>
     </div>
  );
}

export default App;
