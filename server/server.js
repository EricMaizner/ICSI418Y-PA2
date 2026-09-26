
require("dotenv").config();
const { MongoClient } = require("mongodb");
const client = new MongoClient(process.env.MONGO_URI);

const express = require("express");
const cors = require("cors");

const app = express();

app.use(express.json());
app.use(cors());

let users;

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
            firstName,
            lastName,
            username,
            password
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

app.get("/", (req, res) => {
    res.json({
        message: "Server is running"
    });
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

    } 
    catch (error) 
    {
        console.error("Could not connect to MongoDB");
        console.error(error);
    }
}

connectDatabase();