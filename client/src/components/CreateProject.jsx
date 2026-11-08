import { useState } from 'react';

function CreateProject({ users, onProjectCreated }) 
{
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [status, setStatus] = useState("Planning");
    const [projectLeadId, setProjectLeadId] = useState("");
    const [message, setMessage] = useState("");

    async function handleSubmit(event) 
    {
        event.preventDefault();
        setMessage("");

        if (name.trim() === "" || description.trim() === "" || !projectLeadId) {
            setMessage("Please fill out all required project fields");
            return;
        }

        try {
            const response = await fetch("http://localhost:9000/api/projects", 
            {
                method: "POST",
                headers:
                {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(
                {
                    name,
                    description,
                    status,
                    project_lead_id: projectLeadId
                })
            });

            const data = await response.json();

            if (response.ok) 
            {
                setMessage("Project created successfully");
                setName("");
                setDescription("");
                setStatus("Planning");
                setProjectLeadId("");
                
                if (onProjectCreated) 
                    onProjectCreated();
                
            } 
            else 
                if(data.message)
                    setMessage(data.message); 
                else
                    setMessage("Failed to create project");
            
        } 
        catch (error) 
        {
            console.error(error);
            setMessage("Unable to connect to the server");
        }
    }

    return (
        <div className="project-card">
            <h2>Create Project</h2>
            <form className="project-form" onSubmit={handleSubmit}>
                <label htmlFor="project-name">Project Name</label>
                <input
                    id="project-name"
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />

                <label htmlFor="project-desc">Description</label>
                <textarea
                    id="project-desc"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />

                <label htmlFor="project-status">Status</label>
                <select
                    id="project-status"
                    value={status}
                    onChange={(event) => setStatus(event.target.value)}
                >
                    <option value="Planning">Planning</option>
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                </select>

                <label htmlFor="project-lead">Project Lead</label>
                <select
                    id="project-lead"
                    value={projectLeadId}
                    onChange={(event) => setProjectLeadId(event.target.value)}
                >
                    <option value="">Select a Project Lead</option>
                    {users.map((user) => (
                        <option key={user._id} value={user._id}>
                            {user.f_name} {user.l_name} ({user.username})
                        </option>
                    ))}
                </select>

                <button type="submit">Create Project</button>
                <p className="status-message">{message}</p>
            </form>
        </div>
    );
}
export default CreateProject;