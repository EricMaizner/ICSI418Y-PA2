import { useState } from 'react'

function Login()
{
    const [message,setMessage] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");


    async function handleSubmit(event)
    {
        event.preventDefault();
        const response = await fetch(
            "http://localhost:9000/login",
            {
                method: "POST",
                headers: 
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        username,
                        password
                    }
                )
            }
        );

        const data = await response.json();

        if(response.ok)
        {
            setMessage("Login sucessful");
        }
        else
        {
            setMessage(data.message);
        }
    }

    return(
        <>
        <div className="login-field">   
            <h2>Login</h2>
            <form className = "login-form" onSubmit={handleSubmit}>
                <label for = "login-input-username"> Username </label>
                <input
                    type = "text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />
                <label for = "login-input-password"> Password </label>
                <input
                    type = "password"
                    placeholder='Enter Password'
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <button type="submit"> Login </button>
            </form>
            {message && <p className ="status-message">{message}</p>}
        </div>
        
        
        </>
    );
}

export default Login;