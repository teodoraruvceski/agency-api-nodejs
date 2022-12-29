const express = require('express');
const uuid = require('uuid');
const { createClient } =require("@supabase/supabase-js");
const { createLogger, format, transports } = require("winston");
const cors = require('cors');
const app = express();
app.use(cors({
    origin: '*'
}));
const supabaseUrl = 'https://qxvuqmzydpwwqvldclve.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dnVxbXp5ZHB3d3F2bGRjbHZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MjE1NjAwNCwiZXhwIjoxOTg3NzMyMDA0fQ.P5kK_j5vTzKzNcEZOVEkOqIMmAetTFEND7Q7PCTYTnI"
const supabase = createClient(supabaseUrl, supabaseKey)
const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3,
  debug: 4,
  trace: 5,
};
const logger = createLogger({
  levels:logLevels,
  transports: [new transports.File({ filename: "file.log" })],
  exceptionHandlers: [new transports.File({ filename: "exceptions.log" })],
  rejectionHandlers: [new transports.File({ filename: "rejections.log" })],
});
app.get('/getPspUrl', (req, res) => 
{
  console.log("getPspUrl");
    logger.info(`from:${req.url}. sending response: http://localhost:3001/home`);
    //ask bek psp for url
    res.send("http://localhost:3001/home");
});
app.post('/registration',async(req,res)=>
{
  console.log(req.query);
  const email=req.query.c.email;
  const name=req.query.c.name;
  const password=req.query.c.password;
  const pib=req.query.c.pib;
  const paid=req.query.c.paid;
  const id=uuid.v4();
  console.log(id);
try{

  const {data}= supabase
    .from('companies')
    .insert([
        {email,name,password,paid,pib,id}
    ])
    .single();
    res.send(id);
}
catch(e)
{
  console.log(e);
}
  
  
});
app.post('/paid-registration', (req, res) => {
  console.log("update");
    const id=req.query.id;
    try{
      const {data}= supabase
      .from('companies')
      .update([
          {paid:true}
      ])
      .eq('id',id)
    }
    catch(e)
    {
      console.log(e)
    }
    
});
app.listen(6001, () => console.log(`Server Started on 6001`));


// public int id { get; set; }
// public string name { get; set; }
// public string pib { get; set; }
// public string email { get; set; }
// public string password { get; set; }
// public bool paid { get; set; }