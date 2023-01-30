const express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const uuid = require('uuid');
const repo=require('./Repository');

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
app.get('/agency-url-error-payment',jsonParser, async(req, res) => 
{
  console.log("getFrontUrlErrorRegistration");
    logger.info(`from:${req.url}. sending response: http://localhost:3000/errorPayment`);
    res.send("http://localhost:3000/errorPayment");
});
app.get('/agency-url-cancel-payment',jsonParser, async(req, res) => 
{
  console.log("getFrontUrlCancelRegistration");
    logger.info(`from:${req.url}. sending response: http://localhost:3000/home`);
    res.send("http://localhost:3000/home");
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
  console.log('getPackages')
  const token=req.headers.authentication
  console.log(token);
  const c=jwt_decode(token);
  console.log(c);
  // if(c.exp < dateNow.getTime()/1000)
  // {
  //   console.log("error");
  //   res.send("error");
  // }
  try{
    const data =await repo.GetUserByEmail(c.email);
    console.log(data);
    if(data!=null && data.password===c.password)
    {
      try{
        const data=await repo.GetPackages();
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
app.get('/getCompanies',async(req,res)=>
{
  console.log('getComapnies')
  const token=req.headers.authentication
  console.log(token);
  const c=jwt_decode(token);
  console.log(c);
  // if(c.exp < dateNow.getTime()/1000)
  // {
  //   console.log("error");
  //   res.send("error");
  // }
  try{
    const data =await repo.GetUserByEmail(c.email);
    console.log(data);
    if(data!=null && data.password===c.password)
    {
      try{
        const data=await repo.GetCompanies();
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
app.get('/getPackage',async(req,res)=>
{
  const id=req.query.id;
  const token=req.headers.authentication
  console.log(token);
  const c=jwt_decode(token);
  console.log(c);
  // if(c.exp < dateNow.getTime()/1000)
  // {
  //   console.log("error");
  //   res.send("error");
  // }
  try{
    const data = await repo.GetUserByEmail(c.email);
    if(data!=null && data.password===c.password)
    {
      try{
        const data=await repo.GetPackage(id);
        if(data!==null)
          res.send(data);
        else
          res.send('error');
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
  const token=req.headers.authentication
  console.log(token);
  const c=jwt_decode(token);
  console.log(c);
  const id=req.body.id;
  console.log(id);
  const data=await repo.GetPackage(id);
  if(data!=null)
  {
    const pack=data;
    const info={payment_id:'purch_'+id+'_'+c.id+'_'+uuid.v4(),amount:pack.price};
      const data2=await axios.post(`${psp_api}/new-payment`,info);
      console.log(data2);
    //check token...
    console.log("sending url");
    res.send("http://localhost:3001/home?paymentId="+info.payment_id);
    console.log("sent");
  }
  else 
  res.send('error');
  
});
app.post('/buyPremium',jsonParser,async(req,res)=>
{
  console.log('buyPremium');
  const price=100;
  const token=req.headers.authentication
  console.log(token);
  const c=jwt_decode(token);
  console.log(c);
  const data =await repo.GetUserByEmail(c.email);
  console.log(data);
  if(data!=null && data.password===c.password)
  {
    const info={payment_id:'purch_premium'+'_'+c.id+'_'+uuid.v4(),amount:price};
    const data2=await axios.post(`${psp_api}/new-payment`,info);
    console.log(data2.data);
    console.log("sending url");
    res.send(data2.data.url+'?paymentId='+info.payment_id);
    console.log("sent");
  }
  else 
  res.send('error');
  
});
app.post('/updatePremium',jsonParser,async(req,res)=>
{
  console.log('buyPremium');
  const id=req.body.id;
  const token=req.headers.authentication
  console.log(token);
  const c=jwt_decode(token);
  console.log(c);
  const data =await repo.GetUserByEmail(c.email);
  console.log(data);
  if(data!=null && data.password===c.password && id===c.id)
  {
   const dataa=repo.UpdatePremium(id);
   res.send({successful:true});
  }
  else 
  res.send({successful:false,message:'Invalid data.'});
  
});
app.post('/registration',jsonParser,async(req,res)=>
{
  console.log('Registrating company:',req.body);
  const email=req.body.email;
  const name=req.body.name;
  const password=req.body.password;
  const pib=req.body.pib;
  const paid=req.body.paid;
  const role=req.body.role
  const id='reg_'+uuid.v4();
try{
  const check=await repo.GetUserByEmail(email);
  if(check!==null)
    res.send({successful:false,message:'User with email already exist.'});
  const data= await repo.AddCompany({email,name,password,paid,pib,id,role});
  if(role==='company')
  {
    console.log('sending response:'+id);
    const info={payment_id:id,amount:10};
    const data2=await axios.post(`${psp_api}/new-payment`,info);
    console.log(data2);
    res.send({successful:true,id:id});

  }
  res.send({successful:true,message:''});
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
    const data= await repo.GetUserByEmail(email);
    if(data!==null)
    {
      if(data.role==='company')
      {
        console.log('issa company')
        console.log('data:'+JSON.stringify(data));
        const user=data;
        if(data.paid===false)
        {
          res.send({successful:false,id:data.id,message:'NOT-PAID'});
        }
        if(data.password===password)
        {
          const token = jwt.sign(
            data,
            TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          console.log('sending response:'+token);
          res.send({successful:true,token:token});
        }
        else{
          res.send({successful:false,message:'Invalid email or password'});
        }
      }
      else
      {
        console.log('issa user')
        if(data.password===password)
        {
          const token = jwt.sign(
            data,
            TOKEN_KEY,
            {
              expiresIn: "2h",
            }
          );
          console.log('sending response:'+token);
          res.send({successful:true,token:token});
        }
        else{
          res.send({successful:false,message:'Invalid email or password'});
        }
      }
      
    }
    else{
      res.send({successful:false,message:'Invalid email or password'});
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
      const data= await repo.UpdatePaid(id);
    }
    catch(e)
    {
      console.log(e)
    }
    res.send('ok');
});
app.get('/addPackageToCompany',async(req,res)=>
{
  console.log('addPackage')
  const token=req.headers.authentication
  const c=jwt_decode(token);
  const paymentId=req.query.paymentId;
  const packageId=paymentId.split('_')[1];
  const companyId=paymentId.split('_')[2];
  // if(c.exp < dateNow.getTime()/1000)
  // {
  //   console.log("error");
  //   res.send("error");
  // }
  try{
    const data =await repo.GetUserByEmail(c.email);
    if(data!=null && data.password===c.password)
    {
        const data=await repo.AddPackageToCompany({company_id:companyId,package_id:Number(packageId),purchase_date:new Date()})
        res.send(data);
    }
  }
    catch(e)
    {
      console.log(e)
      res.send('error');
    }
});
app.listen(6001, () => {
  console.log(`Server Started on 6001`);
});


// public int id { get; set; }
// public string name { get; set; }
// public string pib { get; set; }
// public string email { get; set; }
// public string password { get; set; }
// public bool paid { get; set; }