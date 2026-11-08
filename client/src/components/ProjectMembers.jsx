import { useState, useEffect } from 'react';

function ProjectMembers({ projects, users}) 
{
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [memberships, setMemberships] = useState([]);
    const [selectedUserId, setSelectedUserId] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (selectedProjectId)
            fetchMembers(selectedProjectId);
        else
            setMemberships([]);
    }, [selectedProjectId]);

    async function fetchMembers(projectId)
    {
        try
        {
            const response = await fetch(`http://localhost:9000/api/projects/${projectId}/members`);
            const data = await response.json();
            if(response.ok)
                setMemberships(data);
            else
                if (data.message)
                    setMessage(data.message);
                else
                    setMessage("Error fetching project members.");
        }
        catch (error)
        {
            console.error(error);
            setMessage("Failed to fetch project members")
        }
    }

    async function handleAddMember(event)
    {
        event.preventDefault();
        setMessage("");

        if (!selectedProjectId) 
        {
            setMessage("Please select a project first.");
            return;
        }
        if (!selectedUserId) 
        {
            setMessage("Please select a user to add.");
            return;
        }

        try 
        {
            const response = await fetch(
                `http://localhost:9000/api/projects/${selectedProjectId}/members`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ user_id: selectedUserId })
                }
            );

            const data = await response.json();

            if (response.ok) 
            {
                setMessage("Member added to project!");
                setSelectedUserId("");
                fetchMembers(selectedProjectId);
            } 
            else 
            {
                if (data.message)
                    setMessage(data.message);
                else
                    setMessage("Could not add member.");
            }
        } 
        catch (error) 
        {
            console.error(error);
            setMessage("Server error while adding member.");
        }
    }

    async function handleRemoveMember(userId)
    {
        setMessage("");
        try 
        {
            const response = await fetch(
                `http://localhost:9000/api/projects/${selectedProjectId}/members/${userId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (response.ok) 
            {
                setMessage("Member removed from project.");
                fetchMembers(selectedProjectId);
            } 
            else 
                if (data.message)
                    setMessage(data.message);
                else
                    setMessage("Could not remove member.");
            
        } 
        catch (error) 
        {
            console.error(error);
            setMessage("Server error while removing member.");
        }
    }

    const currentProject = projects.find((p) => String(p._id) === String(selectedProjectId));

    function getUserDetails(userId) 
    {
        return users.find((u) => String(u._id) === String(userId));
    }

    return (
        <div className = "project-card">
            <h2>Manage Project Memberships</h2>

            <label htmlFor = "select-project">Select Project:</label>
            <select
                id = "select-project"
                value={selectedProjectId}
                onChange={(e) => setSelectedProjectId(e.target.value)}
            >
                <option value = "">Choose a Project</option>
                {projects.map((proj) => (
                    <option key={proj._id} value={proj._id}>
                        {proj.name}
                    </option>
                ))}
            </select>

            {selectedProjectId && currentProject && (
                <div className = "membership-details">
                    <h3>Current Members</h3>
                    {memberships.length === 0 ? (
                        <p>No members found.</p>
                    ) : (
                        <ul className = "member-list">
                            {memberships.map((membership) => {
                                const user = getUserDetails(membership.user_id);
                                const isLead = String(membership.user_id) === String(currentProject.project_lead_id);

                                return (
                                    <li key = {membership._id} className="member-item">
                                        <span>
                                            {user
                                                ? `${user.f_name} ${user.l_name} (${user.username})`
                                                : "Unknown User"}
                                            {isLead && <strong> — Project Lead</strong>}
                                        </span>
                                        
                                        {!isLead && (
                                            <button
                                                type="button"
                                                onClick={() => handleRemoveMember(membership.user_id)}
                                            >
                                                Remove
                                            </button>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    )}

                
                    <form className = "add-member-form" onSubmit = {handleAddMember}>
                        <label htmlFor = "add-user-select">Add Registered User:</label>
                        <select
                            id = "add-user-select"
                            value = {selectedUserId}
                            onChange = {(e) => setSelectedUserId(e.target.value)}
                        >
                            <option value = "">Select a User</option>
                            {users.map((user) => (
                                <option key = {user._id} value = {user._id}>
                                    {user.f_name} {user.l_name} ({user.username})
                                </option>
                            ))}
                        </select>
                        <button type = "submit">Add Member</button>
                    </form>
                </div>
            )}

            <p className = "status-message">{message}</p>
        </div>
    );
}
export default ProjectMembers;