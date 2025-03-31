const express = require('express')
const bodyParser = require('body-parser')
const mongoose = require('mongoose')
require('dotenv').config()
const bcrypt=require('bcryptjs')

const app = express()
const port = 3000;

// Middleware to parse JSON data
app.use(bodyParser.json())

// MongoDB connection
mongoose.connect(process.env.mongo_url).then(
    ()=>console.log('db connected successfully...')
    
).catch(
    (err)=>console.log(err)
    
)

// Define the User model (Schema)
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  email: { type: String, required: true, unique: true }
});

const User = mongoose.model('User', userSchema)

// Simple GET route to test the server
app.get('/', (req, res) => {
  res.send('Welcome to the Registration API')
});

// POST route for registration
app.post('/register', async (req, res) => {
  const { username, password, email } = req.body

  // Validate the request body
  if (!username || !password || !email) {
    return res.status(400).json({ message: 'All fields are required (username, password, email)' });
  }

  try {
    // Check if the username or email already exists
    const hashPassword=await bcrypt.hash(password,10)
    const existingUser = await User.findOne({ $or: [{ username }, { email }] });
    if (existingUser) {
      return res.status(400).json({ message: 'Username or Email already exists' });
    }
 
    // Create a new user and save to the database
    const newUser = new User({ username, password:hashPassword, email });
    await newUser.save();

    res.status(201).json({
      message: 'User registered successfully',
      user: { username, email }
    });
  } catch (err) {
    console.error('Error during registration', err);
    res.status(500).json({ message: 'Server error' })
  }
});
//api Login page
app.post('/login',async(req,res)=>{
    const {email,password}=req.body
    try{
        const user= await User.findOne({email})
        if(!user||!(await bcrypt.compare(password,user.password)))
        {
            return res.status(400).json({message:"invalid user name and password"})
        }
        res.json({message:"Login Succesful",username:user.username})
    }
    catch(err){
        console.log(err)
        
    }
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`)
});