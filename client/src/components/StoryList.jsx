import StoryForm from "./StoryForm"

function StoryList(
{
    stories = [],
    users = [],
    projectMemberUsers = [],
    editingStoryId,
    editTitle,
    setEditTitle,
    editDescription,
    setEditDescription,
    editPriority,
    setEditPriority,
    editStatus,
    setEditStatus,
    editAssignedUserId,
    setEditAssignedUserId,
    onStartEdit,
    onCancelEdit,
    onSaveEdit,
    onDeleteStory
})
{
    function getAssigneeName(assignedUserId)
    {
        if(!assignedUserId)
            return "Unassigned";

        const user = users.find((u) => String(u._id) === String(assignedUserId));
        return user ? `${user.f_name} ${user.l_name} (${user.username})` : "Unknown User";
    }

    if(stories.length === 0)
        return <p>This project has no user stories yet...</p>;

    return (
        <div className="story-list">
            {stories.map((story) =>
            {
                const isEditing = String(editingStoryId) === String(story._id);

                if (isEditing)
                {
                    return (
                        <div key = {story._id} className = "story-item">
                            <StoryForm
                                formTitle = "Edit User Story"
                                title = {editTitle}
                                setTitle = {setEditTitle}
                                description = {editDescription}
                                setDescription = {setEditDescription}
                                priority = {editPriority}
                                setPriority = {setEditPriority}
                                status = {editStatus}
                                setStatus = {setEditStatus}
                                assignedUserId = {editAssignedUserId}
                                setAssignedUserId = {setEditAssignedUserId}
                                projectMemberUsers = {projectMemberUsers}
                                onSubmit = {onSaveEdit}
                                onCancel = {onCancelEdit}
                                submitLabel = "Save"
                                includeStatus = {true}
                            />
                        </div>
                    );
                }

                return (
                    <div key = {story._id} className = "story-item">
                        <div className = "story-header">
                            <strong>{story.title}</strong>
                            <span className = "story-badges">
                                [{story.priority}] — {story.status}
                            </span>
                        </div>
                        <p className = "story-desc-text">{story.description}</p>
                        <div className = "story-footer">
                            <span>
                                <strong>Assigned to:</strong>{" "}
                                {getAssigneeName(story.assigned_user_id)}
                            </span>
                            <div className="story-actions">
                                <button
                                    type="button"
                                    onClick={() => onStartEdit(story)}
                                >
                                    Edit
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteStory(story._id, story.title)}
                                >
                                    Delete
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}
export default StoryList;