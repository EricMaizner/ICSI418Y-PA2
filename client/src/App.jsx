import { useState } from 'react'
import heroImg from './assets/hero.png'
import reactLogo from './assets/react.svg'
import viteLogo from './assets/vite.svg'
import Signup from './components/Signup'
import Login from './components/Login'
import './App.css'


function App() {
  const [username, setUsername] = useState("")

  return (
    <>
    <div className = "input-menu">
      <Signup></Signup>
      <Login></Login>
    </div>
    </>
  )
}

export default App
