import { useState } from 'react';

function Signup({message, setMessage, onUserCreated})
{
    
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");

    async function handleSubmit(event)
    {
        
        try 
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
            });

            const data = await response.json();

            if(response.ok)
            {
                setMessage("Signup sucessful");
                if(onUserCreated)
                    onUserCreated();
            }
            else
            {
                setMessage(data.message);
            }
        } 
        catch (error) 
        {
            setMessage("Could not connect to the server");
        }
        
    }
    return (
        <>
        <div className="signup-field">   
            <h2>Sign up</h2>
            <form className = "signup-form" onSubmit={handleSubmit}>
                <label htmlFor="signup-input-fName"> First Name </label>
                <input
                    id='signup-input-fName'
                    type = "text"
                    value={firstName}
                    onChange={(event) => setFirstName(event.target.value)}
                />
                <label htmlFor = "signup-input-lName"> Last Name </label>
                <input
                    id='signup-input-lName'
                    type = "text"
                    value={lastName}
                    onChange={(event) => setLastName(event.target.value)}
                />
                <label htmlFor = "signup-input-username"> Username </label>
                <input
                    id='signup-input-username'
                    type = "text"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                />
                <label htmlFor = "signup-input-password"> Password </label>
                <input
                    id='signup-input-password'
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