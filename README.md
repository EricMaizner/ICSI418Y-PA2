# icsi418y-pa4
ICSI 418Y Project 4

## Prerequisites
- Node.js
- MongoDB Atlas

## Starting the Application

### 1. Start the Backend Server
From the directory containing 'server.js', run:
```text
Connected to MongoDB
Server running on port 9000
```

### 2. Start the React Frontend

In a second terminal window, navigate to your React project directory
and start the development server:

```bash
npm run dev
```

Open the local URL displayed in your terminal 

1. **Create at least 3 Registered Users** (via the Sign up card):
   - Example: User A, User B, and User C.
2. **Create at least 2 Projects** (via the Create Project card):
   - Project 1: Select User A as the Project Lead
   - Project 2: Select User C as the Project Lead
3. **Add Project Members** (via the Manage Project Memberships card):
   - Select Project 1 and add User B as a member (leave User C out of Project 1 to verify that the story member dropdown only lists members of the selected project).
   - Select Project 2nand add User A as a member.
4. **Create at least 5 User Stories across the 2 Projects** (via the Create User Story card):
   - Select Project 1 and create 3–4 user stories using the standard format (`"As a [type of user], I want [goal], so that [benefit]."`).
   - Include a mix of priorities (`High`, `Medium`, `Low`) and assign at least one story to User B and leave at least one story `Unassigned`.
   - Use the Edit button in the Project Backlog card to update a story's status across `To Do`, `In Progress`, and `Done`.
   - Select Project 2 and create 1–2 additional user stories to verify that switching projects loads each project's separate backlog and eligible members.
5. **Test Relational Validation Rules**:
   - **Blank Field Validation**: Attempt to create or edit a story with an empty title or description to verify the error message.
   - **Member Removal Protection**: In Manage Project Memberships for Project 1, click Remove next to User B while User B still has an assigned story (even if its status is `Done`). The server will block removal with a 409 Conflict message instructing you to reassign, unassign, or delete that member's stories first.

