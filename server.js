const express = require('express');//express
const app = express();// init express as app 
const cors = require('cors');//middleware
const { v4: uuidv4 } = require('uuid');//used to create better id
const pool = require('./db')//get the db connection file;
const Joi = require('joi');//joi to do authentication
// const SocketServer = require('./SocketServer');

const socket = require('socket.io');


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
app.get('/users/search/:value', async (req,res)=>{
    try {
        // console.log(reg)
        const {value} = req.params;
        console.log(req.params);
       const {rows} = await pool.query(`select * from users where lname like '%${value}%' or email like '%${value}%' or id like '%${value}%'`);
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
        const newUser = await pool.query(`INSERT INTO users (id,fname,lname,email,password) values($1,$2,$3,$4,$5)`,
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

/**
 * @{socket Database setup below}
 */
//this post request creates an new group with it participants
//utilizies two tables chatgroup (does a single query) and
//chat_participants
    app.post('/chatGroup/createGroup', async (req,res)=>{
        const {group_data,content} = req.body;
        const group_id = uuidv4();
        let sql = `INSERT INTO chatgroup (group_id,group_name,group_owner) values($1,$2,$3) RETURNING *`;
        await pool.query(sql,[group_id,group_data.group_name,group_data.group_owner]).
            then((res)=>{
                 content.forEach(user => {
                        sql = `INSERT INTO group_participants(group_id,user_id) 
                             values($1,$2)`;
                         pool.query(sql,[group_id,user.id]);
                        console.log(user)
                    });
            }).then(()=>{
                res.send(`${group_data.group_name} created successfully`)
                console.log('hello you added participants')
            }).catch(e => console.error(e.stack))        
    });

    //get the list of groups a user belongs | the user will pass 
    //his id through a post request body
    app.post('/chatGroup/myGroups', async (req,res)=>{
        console.log(req.body);
        const {userID} = req.body;
        let sql = `select chatgroup.group_name,chatgroup.group_id from chatgroup inner join group_participants	on chatgroup.group_id = group_participants.group_id
	    where group_participants.user_id = $1`;
        const {rows} =  await pool.query(sql,[userID])
        res.json(rows);
    })
    //create a new chat with, to set an id, we combine init id and co_op id
    app.post('/singlechat/create', async (req,res)=>{
        try {
            const {init_id,coop_id} = req.body
            console.log('body ',init_id,coop_id)
            // const chatid = uuid();
            let sql = `INSERT INTO singlechat (init_id,coop_id) values ($1,$2) RETURNING * `;                        
            const {rows} = await pool.query(sql,[init_id,coop_id])            
            res.json(rows)
        } catch (err) {
            res.send(err )
        }
    })

/**
 * socket
 */

const server = app.listen(PORT,()=>console.log('server started on port ' + PORT));
