import { useState, useEffect } from "react";
import StoryForm from "./StoryForm";
import StoryList from "./StoryList";

function ProjectBacklog({ projects = [], users = [], membershipVersion })
{
    const [selectedProjectId, setSelectedProjectId] = useState("");
    const [memberships, setMemberships] = useState([]);
    const [stories, setStories] = useState([]);

    // Create Story State
    const [createTitle, setCreateTitle] = useState("");
    const [createDescription, setCreateDescription] = useState("");
    const [createPriority, setCreatePriority] = useState("Medium");
    const [createAssignedUserId, setCreateAssignedUserId] = useState("");
    const [createMessage, setCreateMessage] = useState("");

    // Edit Story State
    const [editingStoryId, setEditingStoryId] = useState(null);
    const [editTitle, setEditTitle] = useState("");
    const [editDescription, setEditDescription] = useState("");
    const [editPriority, setEditPriority] = useState("Medium");
    const [editStatus, setEditStatus] = useState("To Do");
    const [editAssignedUserId, setEditAssignedUserId] = useState("");
    const [backlogMessage, setBacklogMessage] = useState("");

    useEffect(() =>
    {
        setEditingStoryId(null);
        setCreateMessage("");
        setBacklogMessage("");
        setCreateTitle("");
        setCreateDescription("");
        setCreatePriority("Medium");
        setCreateAssignedUserId("");

        if (!selectedProjectId)
        {
            setMemberships([]);
            setStories([]);
            return;
        }

        let ignore = false;

        async function loadProjectData()
        {
            try
            {
                const [membersRes, storiesRes] = await Promise.all([
                    fetch(`http://localhost:9000/api/projects/${selectedProjectId}/members`),
                    fetch(`http://localhost:9000/api/projects/${selectedProjectId}/stories`)
                ]);

                const membersData = await membersRes.json();
                const storiesData = await storiesRes.json();

                if (!ignore)
                {
                    if (membersRes.ok)
                        setMemberships(membersData);
                    if (storiesRes.ok)
                        setStories(storiesData);
                    else
                        setBacklogMessage(storiesData.message || "Error loading stories.");
                    
                }
            }
            catch (error)
            {
                if (!ignore)
                {
                    console.error(error);
                    setBacklogMessage("Failed to load project backlog data.");
                }
            }
        }

        loadProjectData();

        return () => {ignore = true;};
    }, [selectedProjectId, membershipVersion]);

    async function refreshStories()
    {
        if (!selectedProjectId) 
            return;
        try
        {
            const response = await fetch(`http://localhost:9000/api/projects/${selectedProjectId}/stories`);
            const data = await response.json();
            if (response.ok)
                setStories(data);
        
        }
        catch (error)
        {
            console.error(error);
        }
    }

    async function refreshMembers()
    {
        if (!selectedProjectId) 
            return;
        try
        {
            const response = await fetch(`http://localhost:9000/api/projects/${selectedProjectId}/members`);
            const data = await response.json();
            if (response.ok)
                setMemberships(data);
            
        }
        catch (error)
        {
            console.error(error);
        }
    }

    const projectMemberUsers = memberships.map((m) => users.find((u) => String(u._id) === String(m.user_id))).filter(Boolean);

    async function handleCreateStory(event)
    {
        event.preventDefault();
        setCreateMessage("");

        if (!selectedProjectId)
        {
            setCreateMessage("Please select a project first.");
            return;
        }

        if (createTitle.trim() === "" || createDescription.trim() === "")
        {
            setCreateMessage("Title and description are required.");
            return;
        }

        const assignedUserId = createAssignedUserId === "" ? null : createAssignedUserId;

        try
        {
            const response = await fetch(
                `http://localhost:9000/api/projects/${selectedProjectId}/stories`,
                {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: createTitle,
                        description: createDescription,
                        priority: createPriority,
                        assigned_user_id: assignedUserId
                    })
                }
            );

            const data = await response.json();

            if (!response.ok)
                throw new Error(data.message || "Could not create user story.");
            

            setCreateMessage("User story created successfully!");
            setCreateTitle("");
            setCreateDescription("");
            setCreatePriority("Medium");
            setCreateAssignedUserId("");
            refreshStories();
        }
        catch (error)
        {
            setCreateMessage(error.message || "Unable to connect to the server.");
        }
    }

    function startEditing(story)
    {
        setBacklogMessage("");
        refreshMembers();
        setEditingStoryId(story._id);
        setEditTitle(story.title);
        setEditDescription(story.description);
        setEditPriority(story.priority);
        setEditStatus(story.status);
        setEditAssignedUserId(story.assigned_user_id ? String(story.assigned_user_id) : "");
    }

    function cancelEditing()
    {
        setEditingStoryId(null);
        setBacklogMessage("");
    }

    async function handleSaveEdit(event)
    {
        event.preventDefault();
        setBacklogMessage("");

        if (editTitle.trim() === "" || editDescription.trim() === "")
        {
            setBacklogMessage("Title and description cannot be blank.");
            return;
        }

        const assignedUserId = editAssignedUserId === "" ? null : editAssignedUserId;

        try
        {
            const response = await fetch(
                `http://localhost:9000/api/projects/${selectedProjectId}/stories/${editingStoryId}`,
                {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                        title: editTitle,
                        description: editDescription,
                        priority: editPriority,
                        status: editStatus,
                        assigned_user_id: assignedUserId
                    })
                }
            );

            const data = await response.json();

            if (!response.ok)
                throw new Error(data.message || "Could not update user story.");
            

            setBacklogMessage("User story updated successfully!");
            setEditingStoryId(null);
            refreshStories();
        }
        catch (error)
        {
            setBacklogMessage(error.message || "Unable to connect to the server.");
        }
    }

    async function handleDeleteStory(storyId, storyTitle)
    {
        setBacklogMessage("");
        const confirmed = window.confirm(`Are you sure you want to delete the story "${storyTitle}"?`);
        if (!confirmed)
            return;
        
        try
        {
            const response = await fetch(
                `http://localhost:9000/api/projects/${selectedProjectId}/stories/${storyId}`,
                {
                    method: "DELETE"
                }
            );

            const data = await response.json();

            if (!response.ok)
                throw new Error(data.message || "Could not delete user story.");
            

            if (String(editingStoryId) === String(storyId))
                setEditingStoryId(null);
            

            setBacklogMessage("User story deleted.");
            refreshStories();
        }
        catch (error)
        {
            setBacklogMessage(error.message || "Unable to connect to the server.");
        }
    }

    return (
        <div className="backlog-section">
            <div className="project-card">
                <h2>Create User Story</h2>

                <label htmlFor="backlog-project-select">Select Project:</label>
                <select
                    id = "backlog-project-select"
                    value = {selectedProjectId}
                    onChange = {(e) => setSelectedProjectId(e.target.value)}
                >
                    <option value = "">-- Choose a Project --</option>
                    {projects.map((proj) => (
                        <option key = {proj._id} value = {proj._id}>
                            {proj.name}
                        </option>
                    ))}
                </select>

                {!selectedProjectId ? (
                    <p>Select a project above to create and view its user stories.</p>
                ) : (
                    <StoryForm
                        title = {createTitle}
                        setTitle = {setCreateTitle}
                        description = {createDescription}
                        setDescription = {setCreateDescription}
                        priority = {createPriority}
                        setPriority = {setCreatePriority}
                        assignedUserId = {createAssignedUserId}
                        setAssignedUserId = {setCreateAssignedUserId}
                        projectMemberUsers = {projectMemberUsers}
                        onSubmit = {handleCreateStory}
                        submitLabel = "Create Story"
                        includeStatus = {false}
                        disabled = {!selectedProjectId}
                    />
                )}

                <p className = "status-message">{createMessage}</p>
            </div>

            <div className = "project-card backlog-card-wide">
                <h2>Project Backlog</h2>

                {!selectedProjectId ? (
                    <p>No project selected. Choose a project to view its backlog.</p>
                ) : (
                    <StoryList
                        stories = {stories}
                        users = {users}
                        projectMemberUsers = {projectMemberUsers}
                        editingStoryId = {editingStoryId}
                        editTitle = {editTitle}
                        setEditTitle = {setEditTitle}
                        editDescription = {editDescription}
                        setEditDescription = {setEditDescription}
                        editPriority = {editPriority}
                        setEditPriority = {setEditPriority}
                        editStatus = {editStatus}
                        setEditStatus = {setEditStatus}
                        editAssignedUserId = {editAssignedUserId}
                        setEditAssignedUserId = {setEditAssignedUserId}
                        onStartEdit = {startEditing}
                        onCancelEdit = {cancelEditing}
                        onSaveEdit = {handleSaveEdit}
                        onDeleteStory = {handleDeleteStory}
                    />
                )}

                <p className = "status-message">{backlogMessage}</p>
            </div>
        </div>
    );
}

export default ProjectBacklog;