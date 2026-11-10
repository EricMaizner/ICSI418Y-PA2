
require("dotenv").config();
const { MongoClient, ObjectId } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");
const app = express();

const priorities = ["High", "Medium", "Low"];
const storyStatuses = ["To Do", "In Progress", "Done"];

app.use(express.json());
app.use(cors());

let users;
let projects;
let memberships;
let stories;

app.post("/signup", async (req, res) => {
    const { firstName, lastName, username, password } = req.body;

    try 
    {
        if(!firstName || firstName.trim() === "")
            return res.status(400).json({message : "First name is required."});
        
        if(!lastName || lastName.trim() === "")
            return res.status(400).json({message : "Last name is required."});
        
        if(!username || username.trim() === "")
            return res.status(400).json({message : "A username is required."});
        
        if(!password || password.trim() === "")
            return res.status(400).json({message : "A password is required."});


        const result = await users.findOne({username});

        if(result !== null) 
            return res.status(409).json({message: "Username already taken. Please choose different username."})
        

        await users.insertOne(
        {
            f_name: firstName,
            l_name: lastName,
            username: username,
            password: password
        });
            

        console.log("Signup request for:", username);
        
        res.status(201).json(
            {
            message : "Account created"
        })
        
    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({message: "Server error during signup"});
    }
    
});

app.post("/login", async (req, res) => {
    try 
    {
        const username = req.body.username;
        const password = req.body.password;

        if(!username || username.trim() === "")
            return res.status(400).json({message : "A username is required."});
        
        if(!password || password.trim() === "")
            return res.status(400).json({message : "A password is required."});

        const result = await users.findOne(
            {
                username : username
            });

        if(result === null || result.password !== password)
            return res.status(401).json({message: "Username or Password is incorrect"})
        

        console.log("Login request for:", username);
        
        res.status(200).json(
        {
            message : "Login Successful",
        })
    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({message: "Server error during login"})
    }
    
});

app.post("/api/projects", async (req, res) => {

    const {name, description, status, project_lead_id} = req.body;

    try 
    {
        if(!project_lead_id || project_lead_id.trim() === "")
            return res.status(400).json({message: "Project Lead ID is required"});
        if(!name || name.trim() === "")
            return res.status(400).json({message: "Project name is required"});
        if(!description || description.trim() === "")
            return res.status(400).json({message: "Description field is blank"});
        if(!status || status.trim() === "")
            return res.status(400).json({message: "Status field is required"});

        const validStatus = ["Planning", "Active", "Completed"];
        if (!validStatus.includes(status))
            return res.status(400).json({message: "Invalid project status"});

        if(!ObjectId.isValid(project_lead_id))
            return res.status(400).json({message: "Invalid Project Lead ID"});

        const leadObjectId = new ObjectId(project_lead_id);
        const leadUser = await users.findOne({_id: leadObjectId});
        if(leadUser === null)
            return res.status(404).json({message: "Selected project lead does not exist"});

        const newProject = {
            name: name.trim(),
            description: description.trim(),
            status: status,
            project_lead_id: leadObjectId
        };

        const result = await projects.insertOne(newProject);

        const projectId = result.insertedId;
        await memberships.insertOne({
            project_id: projectId,
            user_id: leadObjectId
        });

        res.status(201).json({
            message: "Project created successfully",
            project: {_id: projectId, ...newProject}
        });

    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({message: "Server error creating project"});
    }
});

app.post("/api/projects/:projectId/members", async (req, res) => {

    try
    {
        const {projectId} = req.params;
        const {user_id} = req.body;

        if (!ObjectId.isValid(projectId) || !user_id || !ObjectId.isValid(user_id)) 
            return res.status(400).json({ message: "Invalid project or user ID" });

        const projObjectId = new ObjectId(projectId);
        const userObjectId = new ObjectId(user_id);
        const project = await projects.findOne({_id: projObjectId});
        
        if(project === null)
            return res.status(404).json({message: "Requested project does not exist"});

        const user = await users.findOne({_id:userObjectId});
        if(user === null)
            return res.status(404).json({message: "Requested user does not exist"});


        const existingMembership = await memberships.findOne(
        {
            project_id: projObjectId,
            user_id: userObjectId
        });
        
        if (existingMembership !== null) 
            return res.status(409).json({ message: "User is already a member of this project." });
            

        const result = await memberships.insertOne(
        {
            project_id: projObjectId,
            user_id: userObjectId
        });

        res.status(201).json(
        {
            message: "Member added to project successfully!",
            membership: 
            {
                _id: result.insertedId,
                project_id: projObjectId,
                user_id: userObjectId
            }
        });
    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ message: "Server error adding project member." });
    }
        
});

app.post("/api/projects/:projectId/stories", async (req, res) =>
{
    try
    {
        
        const rawProjectId = req.params.projectId;                                              
        if(typeof rawProjectId !== "string" || !ObjectId.isValid(rawProjectId))
            return res.status(400).json ({message: "Invalid project identifier"});
        
        const projectId = new ObjectId(rawProjectId);
        const project = await projects.findOne({_id:projectId});

        if(project === null)
            return res.status(404).json({ message: "Requested project does not exist"})

        //After confirming project exists, extract all data from entered fields
        const {title, description, priority, assigned_user_id} = req.body;

        //Validate manually entered fields
        if(typeof title !== "string" || title.trim() === "" || typeof description !== "string" || description.trim() === "")
           return res.status(400).json({ message: "Title and description are required" });

        //Compare entered priority field with allowed priority 'enum'
        if (!priorities.includes(priority))
            return res.status(400).json({ message: "Priority must be High, Medium or Low" });

        //Create and set default to null (unassigned)
        let assignedUserId = null;

        //Validate check assigned_user_id field 
        if (assigned_user_id !== null && assigned_user_id !== undefined && assigned_user_id !== "")
        {
            //Further validate assigned_user_id
            if (typeof assigned_user_id !== "string" || !ObjectId.isValid(assigned_user_id))
                return res.status(400).json({ message: "Invalid assigned user identifier." });
            
            //Convert readable text into a mongoDB ObjectId
            assignedUserId = new ObjectId(assigned_user_id);

            //Confirm requested user exists
            const existingUser = await users.findOne({ _id: assignedUserId });
            if (existingUser === null)
                return res.status(404).json({ message: "Assigned user does not exist" });
            

            //Ensure user is assigned to selected project
            const membership = await memberships.findOne(
            {
                project_id: projectId,
                user_id: assignedUserId
            });

            if (membership === null)
                return res.status(400).json({message: "Assigned user must be a current member of this project"});

        }

        // Create and insert story
        const newStory = 
        {
            project_id: projectId,
            title: title.trim(),
            description: description.trim(),
            priority: priority,
            status: "To Do",
            assigned_user_id: assignedUserId
        };

        const result = await stories.insertOne(newStory);

        res.status(201).json({
            message: "User story created successfully",
            story: { _id: result.insertedId, ...newStory }
        });
    
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({ message: "Server error creating user story" });
    }
});

app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
});

app.get("/api/projects/:projectId/stories", async (req, res) =>
{
    try
    {
        
        const rawProjectId = req.params.projectId;                                          
        if(typeof rawProjectId !== "string" || !ObjectId.isValid(rawProjectId))             
            return res.status(400).json ({message: "Invalid project identifier"});

        const projectId = new ObjectId(rawProjectId);                                       

        const project = await projects.findOne({_id:projectId});                            
        if(project === null)
            return res.status(404).json({ message: "Requested project does not exist"})
        
        const projectStories = await stories.find({project_id: projectId}).toArray();       
        res.status(200).json(projectStories);

    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({ message: "Server error fetching user stories"});
    }
});

app.get("/api/projects", async (req, res) => {
    
    try
    {
        const allProjects = await projects.find({}).toArray();
        res.status(200).json(allProjects);
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({message: "Server error fetching projects"})
    }

});

app.get("/api/users", async (req, res) => {

    try
    {
        const allUsers = await users.find({}).project({password : 0}).toArray();
        res.status(200).json(allUsers);
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({message: "Server error fetching users"});
    }

});

app.get("/api/projects/:projectId/members", async(req,res) =>{

    try
    {
        const {projectId} = req.params;
        if(!ObjectId.isValid(projectId))
            return res.status(400).json({message: "Invalid project ID"});
        
        const projObjectId = new ObjectId(projectId);

        const project = await projects.findOne({_id: projObjectId});
        
        if(project === null)
            return res.status(404).json({message: "Requested project does not exist"});

        const projectMemberships = await memberships.find({project_id: projObjectId}).toArray();

        res.status(200).json(projectMemberships);
    }
    catch(error)
    {
        console.error(error);
        res.status(500).json({message: "Server error fetching project members"})
    }
});

app.delete("/api/projects/:projectId/members/:userId", async (req, res) => {
    try 
    {
        const { projectId, userId } = req.params;

        if (!ObjectId.isValid(projectId) || !ObjectId.isValid(userId)) 
            return res.status(400).json({ message: "Invalid project or user ID" });
        

        const projObjectId = new ObjectId(projectId);
        const userObjectId = new ObjectId(userId);

        const project = await projects.findOne({ _id: projObjectId });
        if (project === null) 
            return res.status(404).json({ message: "Requested project does not exist" });
        

        if (project.project_lead_id.equals(userObjectId)) 
            return res.status(409).json({ message: "The current Project Lead cannot be removed from the project" });
        
        const assignedStory = await stories.findOne({
            project_id: projObjectId,
            assigned_user_id: userObjectId
        });
       
        if(assignedStory !== null)
            return res.status(409).json({message: "Reassign, unassign, or delete this member's stories before removing them from the project"});
       
        const deleteResult = await memberships.deleteOne(
        {
            project_id: projObjectId,
            user_id: userObjectId
        });

        if (deleteResult.deletedCount === 0) 
            return res.status(404).json({ message: "User is not a member of this project" });
        
        res.status(200).json({ message: "Member removed successfully" });
    } 
    catch (error) 
    {
        console.error(error);
        res.status(500).json({ message: "Server error removing project member" });
    }
});

app.delete("/api/projects/:projectId/stories/:storyId", async (req, res) =>
{
    try
    {
        const { projectId: rawProjectId, storyId: rawStoryId } = req.params;

        if (
            typeof rawProjectId !== "string" || !ObjectId.isValid(rawProjectId) ||
            typeof rawStoryId !== "string" || !ObjectId.isValid(rawStoryId)
        )
            return res.status(400).json({ message: "Invalid project or story identifier" });

        const projectId = new ObjectId(rawProjectId);
        const storyId = new ObjectId(rawStoryId);

        const result = await stories.deleteOne({
            _id: storyId,
            project_id: projectId
        });

        if (result.deletedCount === 0)
            return res.status(404).json({ message: "Story not found in the selected project" });

        res.status(200).json({ message: "User story deleted successfully" });
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({ message: "Server error deleting user story" });
    }
});

app.put("/api/projects/:projectId/stories/:storyId", async (req, res) =>
{
    try
    {
        const { projectId: rawProjectId, storyId: rawStoryId } = req.params;

        //Validation
        if (
            typeof rawProjectId !== "string" || !ObjectId.isValid(rawProjectId) ||
            typeof rawStoryId !== "string" || !ObjectId.isValid(rawStoryId)
        )
            return res.status(400).json({ message: "Invalid project or story identifier" });
        

        //Convert raw IDs to readable text
        const projectId = new ObjectId(rawProjectId);
        const storyId = new ObjectId(rawStoryId);

        //Ensure selected project exists
        const project = await projects.findOne({ _id: projectId });
        if (project === null)
            return res.status(404).json({ message: "Requested project does not exist" });
        

        // Retrieve data from filled fields 
        const { title, description, priority, status, assigned_user_id } = req.body;

        //Validation of title and description
        if (
            typeof title !== "string" || title.trim() === "" ||
            typeof description !== "string" || description.trim() === ""
        )
            return res.status(400).json({ message: "Title and description are required" });
        

        //Validation of priority 
        if (!priorities.includes(priority))
            return res.status(400).json({ message: "Priority must be High, Medium, or Low" });
        

        //Validation of status 
        if (!storyStatuses.includes(status))
            return res.status(400).json({ message: "Status must be To Do, In Progress, or Done" });
        

        let assignedUserId = null;
        if (assigned_user_id !== null && assigned_user_id !== undefined && assigned_user_id !== "")
        {
            if (typeof assigned_user_id !== "string" || !ObjectId.isValid(assigned_user_id))
                return res.status(400).json({ message: "Invalid assigned user identifier" });
            
            assignedUserId = new ObjectId(assigned_user_id);

            const existingUser = await users.findOne({ _id: assignedUserId });
            if (existingUser === null)
                return res.status(404).json({ message: "Assigned user does not exist" });
            

            const membership = await memberships.findOne({
                project_id: projectId,
                user_id: assignedUserId
            });
            if (membership === null)
                return res.status(400).json({ message: "Assigned user must be a current member of this project"});
        }


        const storyQuery = {_id: storyId, project_id: projectId};

        const updates = {
            title: title.trim(),
            description: description.trim(),
            priority: priority,
            status: status,
            assigned_user_id: assignedUserId
        };

        const result = await stories.updateOne(storyQuery, { $set: updates });

        if (result.matchedCount === 0)
            return res.status(404).json({ message: "Story not found in the selected project." });
        
        res.status(200).json(
        {
            message: "User story updated successfully!",
            story: { _id: storyId, project_id: projectId, ...updates }
        });
    }
    catch (error)
    {
        console.error(error);
        res.status(500).json({ message: "Server error updating user story." });
    }
});

app.listen(9000, () => {
    console.log("Server running on port 9000");
});



async function connectDatabase() 
{
    try 
    {
        await client.connect();
        console.log("Connected to MongoDB");
        const db = client.db("pa2");
        users = db.collection("users");
        projects = db.collection("projects");
        memberships = db.collection("projectMemberships")
        stories = db.collection("userStories")


    } 
    catch (error) 
    {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}

connectDatabase();