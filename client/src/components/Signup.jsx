import { useState } from 'react'

function Signup()
{
    const [message,setMessage] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(event)
    {
        event.preventDefault();
        const response = await fetch(
            "http://localhost:9000/signup",
            {
                method: "POST",
                headers: 
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                    {
                        firstName,
                        lastName,
                        username,
                        password
                    }
                )
            }
        );

        const data = await response.json();

        if(response.ok)
        {
            setMessage("Signup sucessful");
        }
        else
        {
            setMessage(data.message);
        }
    }
    return (
        <>
        <div className="signup-field">   
            <h2>Sign up</h2>
            <form className = "signup-form" onSubmit={handleSubmit}>
                <label for="signup-input-fName"> First Name </label>
                <input
                    type = "text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                />
                <label for = "signup-input-lName"> Last Name </label>
                <input
                    type = "text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                />
                <label for = "signup-input-username"> Username </label>
                <input
                    type = "text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />
                <label for = "signup-input-password"> Password </label>
                <input
                    type = "password"
                    placeholder='Enter Password'
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                />
                <button type="submit"> Create Account </button>
            </form>
            {message && <p className ="status-message">{message}</p>}
        </div>
        
        
        </>
    );
}

export default Signup;