const express = require('express');//express
const app = express();// init express as app 
const cors = require('cors');//middleware
const { v4: uuidv4 } = require('uuid');//used to create better id
const pool = require('./db')//get the db connection file;
const Joi = require('joi');//joi to do authentication
const socket = require('socket.io');// ini socket || continues on line 98

app.use(express.json());
app.use(cors());


const PORT = 5000 || process.env.PORT;

//do login
app.post('/users/login', async (req,res)=>{
    try {
        const {username,password} = req.body;
        console.log(username,password);
       const {rows} = await 
       pool.query(`select * from users where lname='${username}' or email='${username}' and password='${password}'`);
       res.json(rows);
    } catch (err) {
        console.log(err.message , err.routine)
    }
});

//get all users
app.get('/users', async (req,res)=>{
    try {
        const {rows} = await pool.query('SELECT * from users')
        res.json(rows)
    } catch (error) {
        console.log(error)
    }
});

//get a single user
app.get('/users/:value', async (req,res)=>{
    try {
        const {value} = req.params;
        console.log(value);
       const {rows} = await pool.query(`select * from users where lname like '%${value}%' or 
        email like '%${value}%' or id like '%${value}%'`);
       res.json(rows);
      
    } catch (err) {
        console.log(err)
    }
});

//insert users
app.post('/users/register', async (req,res)=>{
    //await
    try {
        const {fname,lname,email,password} = req.body;
        console.log(fname,lname);
        const newUser = await pool.query(`INSERT INTO users (id,fname,lname,email,password) values($1,$2,$4,$5)`,
        [uuidv4(),fname,lname,email,password]);
        res.json('uRs-01');
    } catch (err) {
        res.send(err.message);
    }
});

//update user
app.put('/users/:id', async (req,res)=>{
     try {
         const {id} = req.params;
         const {columns,value} = req.body;
         console.log(columns)
         console.log(id, value)
         const updateUser = await pool.query(`update users set ${columns} = $1 where id=$2`,[value,id])
         res.json(`Updated ${id} with ${columns}  ${value}`);
     } catch (error) {
         console.log(error)
     }
});

//update user
app.put('/users/:id', async (req,res)=>{
    try {
        const {id} = req.params;
        const {email} = req.body;
        console.log(id, email)
        const updateUser = await pool.query('update users set email = $1 where id=$2',[email,id])
        res.json(`Updated ${id} with email ${email}`);
    } catch (error) {
        console.log(error)
    }
});

app.get('/users/:id/:name',(req,res)=>{
    res.send(req.params);
})

app.listen(PORT,()=>console.log('server started on port ' + PORT));

// init socket server 
const socketServer = express();
const server = socketServer.listen(5001,()=>{console.log('socket server rolling')})
//create connection to socket
io = socket(server);

//setup
io.on('connection', (socket)=>{
    
    //manage disconnections
    socket.on('disconnect',()=>{

    });
});