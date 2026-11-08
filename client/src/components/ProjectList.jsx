function ProjectList({ projects, users }) 
{ 
    
    function getLeadName(leadId) 
    {
        const lead = users.find((user) => String(user._id) === String(leadId));
        return lead ? `${lead.f_name} ${lead.l_name} (${lead.username})` : "Unknown User";
    }

    return (
        <div className="project-card">
            <h2>All Projects</h2>
            {projects.length === 0 ? (
                <p>No projects created yet.</p>
            ) : (
                <table className="project-table">
                    <thead>
                        <tr>
                            <th>Project Name</th>
                            <th>Description</th>
                            <th>Status</th>
                            <th>Project Lead</th>
                        </tr>
                    </thead>
                    <tbody>
                        {projects.map((project) => (
                            <tr key={project._id}>
                                <td>{project.name}</td>
                                <td>{project.description}</td>
                                <td>{project.status}</td>
                                <td>{getLeadName(project.project_lead_id)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            )}
        </div>
    );
}

export default ProjectList;