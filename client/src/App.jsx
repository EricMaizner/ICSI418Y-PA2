import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import Signup from './components/Signup'
import Login from './components/Login'
import './App.css'


function App() {
  const [signupMessage, setSignupMessage] = useState("");
  const [loginMessage, setLoginMessage] = useState("");

  return (
    <>
    <div className = "input-menu">
      <Signup
        message={signupMessage}
        setMessage = {(msg) =>{
          setSignupMessage(msg);
          setLoginMessage("");
        }}
      />
      <Login
        message={loginMessage}
        setMessage = {(msg) =>{
          setSignupMessage("");
          setLoginMessage(msg);
        }}  
      />
    </div>
    </>
  )
}

export default App
