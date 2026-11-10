function StoryForm(
{
    formTitle,
    title,
    setTitle,
    description,
    setDescription,
    priority,
    setPriority,
    status,
    setStatus,
    assignedUserId,
    setAssignedUserId,
    projectMemberUsers = [],
    onSubmit,
    onCancel,
    submitLabel = "Save",
    includeStatus = false,
    disabled = false
})
{
    return(
        <form className = "project-form" onSubmit={onSubmit}>
            {formTitle && <h3>{formTitle}</h3>}

            <label>Title</label>
            <input
                type = "text"
                value = {title}
                onChange = {(e) => setTitle(e.target.value)}
            />

            <label>Description</label>
            <textarea
                placeholder = "As a [type of user], I want [goal], so that [benifit]"
                value = {description}
                onChange = {(e) => setDescription(e.target.value)}
            />

            <label>Priority</label>
            <select value = {priority} onChange = {(e) => setPriority(e.target.value)}>
                <option value = "High">High</option>
                <option value = "Medium">Medium</option>
                <option value = "Low">Low</option>
            </select>

            {includeStatus && 
            (
                <>
                    <label>Status</label>
                    <select value = {status} onChange = {(e) => setStatus(e.target.value)}>
                        <option value = "To Do">To Do</option>
                        <option value = "In Progress">In Progress</option>
                        <option value = "Done">Done</option>
                    </select>
                </>
            )}

            <label>Assigned Member</label>
            <select value = {assignedUserId} onChange = {(e) => setAssignedUserId(e.target.value)}>
                <option value = "">Unassigned</option>
                {projectMemberUsers.map((user) => (
                    <option key = {user._id} value = {user._id}>
                        {user.f_name} {user.l_name} {user.username}
                    </option>
                ))}
            </select>

            <div className = "story-actions">
                <button type = "submit" disabled = {disabled}>
                    {submitLabel}
                </button>{onCancel && (<button type = "button" onClick = {onCancel}>Cancel</button>)}
            </div>
        </form>
    );
}

export default StoryForm;