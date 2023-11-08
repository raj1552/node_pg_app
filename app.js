const express = require('express');
const dotenv = require('dotenv');
const { Pool } = require('pg');
const app = express();
const cors = require('cors');
const port = 4000;

dotenv.config()

app.use(express.json())
app.use(express.urlencoded({ extended: false }));
app.use(express.static('public'))

app.use(cors())

const pool = new Pool({
         user: 'postgres',
         host: 'localhost',
         database: 'exercisetracker',
         password: 'postgres', 
         port: 5432,
     })


app.get('/' , ( req, res) =>{

        res.sendFile(__dirname + '/views/index.html')
    })  

    app.get('/showdetails.html' , ( req, res) =>{

      res.sendFile(__dirname + '/views/showdetails.html')
  })  

  app.get('/listusers.html' , ( req, res) =>{

    res.sendFile(__dirname + '/views/listusers.html')
})  

      

app.get('/api/users', async(req, res) => {
        
        const userResult = await pool.query('SELECT * FROM users;');
    
        res.json(userResult.rows)
        
    })


app.post('/api/users', async(req, res) => {
  
        const { username } = req.body;
      
        if (!username) {
          return res.json({ error: "username is required" })
        }
    
        try{
            const result = await pool.query('INSERT INTO users (username) values ($1) RETURNING id;' , [username])
            const newUserId = result.rows[0].id; 
    
            const newusers = {
                username ,
                _id : newUserId
            }
    
            res.json(newusers)
    
        }
        catch(error){
                console.log('Cant create a user')
            }
      
    })

app.post('/api/users/exercises', async (req, res) => {

      const { username, description, duration, date } = req.body;
    
      let exerciseDate = new Date(date);
    
      if (isNaN(exerciseDate)) {
        exerciseDate = new Date();
      }
    
      try {

        const userResult = await pool.query(`SELECT * FROM users WHERE username = $1`, [username]);
    
        if (userResult.rowCount === 0) {
          return res.status(404).send("User Not Found");
        }
    
        const userIDResult = await pool.query('SELECT id from users where username = $1', [username]);

        const userID = userIDResult.rows[0].id;
    
        const exerciseResult = await pool.query(
                              'INSERT INTO exercise (id, description, duration, date, username) VALUES ($1, $2, $3, $4, $5) RETURNING id',
                              [userID, description, duration, exerciseDate, username]
        );
        
        res.json(exerciseResult);
      } catch (error) {
        console.log(error);
      }
    });
    

app.post('/api/users/:username/exercises' , async(req , res) =>{

    const { username } = req.body

    const userResult = await pool.query('SELECT * FROM exercise where username = $1;' , [username])

    if (!userResult) {
      return res.status(404).json({ error: 'User Not Found' });
    }
    
    if (userResult.rowCount === 0) {
      return res.status(404).json({ error: 'No Details' });
    }
    
    res.json(userResult)
  })

  app.get('/api/users/:username/exercises' , async (req , res) =>{

    const {username} = req.params
   
    const userResult = await pool.query('SELECT * FROM exercise where username = $1;', [username]);

    if (!userResult) {
        return res.status(404).json({ error: 'User Not Found' });
    }

    if (userResult.rowCount === 0) {
        return res.status(404).json({ error: 'No Details' });
    }
    res.json(userResult.rows);
  })

app.listen(port , () =>{
        console.log(`Iam listening to ${port}`)
    })