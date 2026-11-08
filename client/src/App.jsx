import { useState, useEffect } from 'react';
import CreateProject from './components/CreateProject';
import ProjectList from './components/ProjectList';
import ProjectMembers from './components/ProjectMembers';
import Signup from './components/Signup';
import Login from './components/Login';
import './App.css';

function App()
{
    const [signupMessage, setSignupMessage] = useState("");
    const [loginMessage, setLoginMessage] = useState("");
    const [users, setUsers] = useState([]);
    const [projects, setProjects] = useState([]);

    async function fetchUsers()
    {
        try
        {
            const res = await fetch("http://localhost:9000/api/users");
            if (res.ok)
            {
                const data = await res.json();
                setUsers(data);
            }
        }
        catch (error)
        {
            console.error("Failed to fetch users:", error);
        }
    }

    async function fetchProjects()
    {
        try
        {
            const res = await fetch("http://localhost:9000/api/projects");
            if (res.ok)
            {
                const data = await res.json();
                setProjects(data);
            }
        }
        catch (error)
        {
            console.error("Failed to fetch projects:", error);
        }
    }

    useEffect(() =>
    {
        fetchUsers();
        fetchProjects();
    }, []);

    return (
        <div className = "app-wrapper">
            <div className = "input-menu">
                <Signup
                    message={signupMessage}
                    setMessage = {(msg) =>
                    {
                        setSignupMessage(msg);
                        setLoginMessage("");
                    }}
                    onUserCreated = {fetchUsers}
                />
                <Login
                    message={loginMessage}
                    setMessage = {(msg) =>
                    {
                        setSignupMessage("");
                        setLoginMessage(msg);
                    }}
                />
            </div>

            <hr />

            <div className = "projects-dashboard">
                <CreateProject users={users} onProjectCreated={fetchProjects} />
                <ProjectList projects={projects} users={users} />
                <ProjectMembers projects={projects} users={users} />
            </div>
        </div>
    );
}

export default App;