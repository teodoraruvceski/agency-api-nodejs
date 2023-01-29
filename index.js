const express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const uuid = require('uuid');
const { createClient } =require("@supabase/supabase-js");
const { createLogger, format, transports } = require("winston");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwt_decode=require('jwt-decode');
const app = express();
const axios=require('axios');
const TOKEN_KEY="dfgh234ghj2345bhnm345jkl678nbodxj7";
app.use(cors({
    origin: '*'
}));
const psp_api="http://localhost:5000"
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

app.get('/agency-url-success-payment',jsonParser, async(req, res) => 
{
  console.log("getFrontUrlSuccessfulRegistration");
    logger.info(`from:${req.url}. sending response: http://localhost:3000/successfulPayment`);
    res.send("http://localhost:3000/successfulPayment");
});
app.post('/getPspUrl',jsonParser, async(req, res) => 
{
  console.log("getPspUrl");
    logger.info(`from:${req.url}. sending response: http://localhost:3001/home`);
    //ask bek psp for url
    res.send("http://localhost:3001/home");
});
app.get('/getPackages',async(req,res)=>
{
  const token=req.headers.authentification
  console.log(token);
  const c=jwt_decode(token);
  console.log(c);
  // if(c.exp < dateNow.getTime()/1000)
  // {
  //   console.log("error");
  //   res.send("error");
  // }
  try{
    const { data, error } = await supabase
    .from('companies')
    .select()
    .eq('email', c.email);
    console.log(data);
    if(data!=null && data[0].password===c.password)
    {
      try{
        const {data,error}=await supabase
        .from('packages')
        .select();
        res.send(data);
      }
      catch(e)
      {
        console.log(e);
        res.send("error");
      }
    }
    else{
      res.send("error");
    }
    
  }
  catch(e)
  {
    console.log(e);
  }
});
app.post('/buyPackage',jsonParser,async(req,res)=>
{
  const package=req.body;
  console.log(package);
  //check token...
  console.log("sending url");
  res.send("http://localhost:3001/home");
  console.log("sent");
});
app.post('/registration',jsonParser,async(req,res)=>
{
  console.log('Registrating company:',req.body);
  const email=req.body.email;
  const name=req.body.name;
  const password=req.body.password;
  const pib=req.body.pib;
  const paid=req.body.paid;
  const id='reg_'+uuid.v4();
try{

  const {data,error}= await supabase
    .from('companies')
    .insert([
        {email,name,password,paid,pib,id}
    ])
    .single();
    console.log('sending response:'+id);
    const info={payment_id:id,amount:10};
    const data2=await axios.post(`${psp_api}/new-payment`,info);
    console.log(data2);
    res.send(id);
}
catch(e)
{
  console.log(e);
}
});
app.post('/login',jsonParser,async(req,res)=>
{
  console.log('Login company:',req.body);
  const email=req.body.email;
  const password=req.body.password;
  try{
    const { data, error } = await supabase
    .from('companies')
    .select()
    .eq('email', email);
    console.log('data:'+JSON.stringify(data));
    const user=data[0];
    if(data[0].paid===false)
    {
      res.send("not-paid_"+data[0].id);
    }
    if(data[0].password===password)
    {
      
      const token = jwt.sign(
        data[0],
        TOKEN_KEY,
        {
          expiresIn: "2h",
        }
      );
      console.log('sending response:'+token);
      res.send(token);
    }
    else{
      res.send(undefined);
    }
    
  }
  catch(e)
  {
    console.log(e);
  }
});
app.post('/paid-registration',async (req, res) => {
  const id=req.query.id;
  console.log("update: ",id);
    try{
      const {data,error}= await supabase
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
    res.send('ok');
});
app.listen(6001, () => console.log(`Server Started on 6001`));


// public int id { get; set; }
// public string name { get; set; }
// public string pib { get; set; }
// public string email { get; set; }
// public string password { get; set; }
// public bool paid { get; set; }