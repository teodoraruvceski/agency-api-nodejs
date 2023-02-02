const express = require('express');
var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();
const uuid = require('uuid');
const randomstring=require('randomstring');
const repo=require('./Repository');
const nodemailer = require("nodemailer");
const { createLogger, format, transports } = require("winston");
const cors = require('cors');
const jwt = require('jsonwebtoken');
const jwt_decode=require('jwt-decode');
const app = express();
const axios=require('axios');
const TOKEN_KEY="dfgh234ghj2345bhnm345jkl678nbodxj7";
var codes= {};
const port=6001;
app.use(cors({
    origin: '*'
}));
const transporter = nodemailer.createTransport({
  host: "localhost",
  port: 2525
});
const psp_api="http://localhost:5000"

const logLevels = {
  fatal: 0,
  error: 1,
  warn: 2,
  info: 3
};
const logger = createLogger({
  levels:logLevels,
  transports: [new transports.File({ filename: "file.log" })],
  exceptionHandlers: [new transports.File({ filename: "exceptions.log" })],
  rejectionHandlers: [new transports.File({ filename: "rejections.log" })],
});
app.listen(port, () => {
  console.log(`Server Started on ${port}`);
  logger.info(`Time: ${new Date()} Message: Server started on ${port}.`);
  // var mymap={}
  // mymap['tea']='123';
  // console.log(mymap);
  // delete mymap['tea'];
  // console.log(mymap);

});
app.get('/agency-url-success-payment',jsonParser, async(req, res) => 
{
  console.log("getFrontUrlSuccessfulRegistration");
  logger.info(`Time: ${new Date()} Message: Requested url for successful payment.`);
  res.send("http://localhost:3000/successfulPayment");
});
app.get('/agency-url-error-payment',jsonParser, async(req, res) => 
{
  console.log("getFrontUrlErrorRegistration");
  logger.info(`Time: ${new Date()} Message: Requested url for error payment.`);
  res.send("http://localhost:3000/errorPayment");
});
app.get('/agency-url-cancel-payment',jsonParser, async(req, res) => 
{
  console.log("getFrontUrlCancelRegistration");
  logger.info(`Time: ${new Date()} Message: Requested url for canceled payment.`);
  res.send("http://localhost:3000/home");
});
app.post('/getPspUrl',jsonParser, async(req, res) => 
{
  console.log("getPspUrl");
  logger.info(`Time: ${new Date()} Message: Requested psp front url. Sending request to psp service.`);
  const resp=await axios.get(`${psp_api}/get-psp-url`);
  res.send(resp.data);
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
    if(data!=null && data.password===c.password )
    {
      if(data.role!=='company')
      {
        logger.error(`Time: ${new Date()} Message: Requested packages.Token not valid.`);
        res.send({successful:false,message:'Neautorizovan pristup.'});
      }
      try{
        const data=await repo.GetPackages();
        logger.info(`Time: ${new Date()} Message: Requested packages from database.`);
        res.send({successful:true,data:data});
      }
      catch(e)
      {
        console.log(e);
        logger.error(`Time: ${new Date()} Message: Requested packages.Token not valid.`);
        res.send({successful:false,message:'Doslo je do greske.'});
      }
    }
    else{
      logger.error(`Time: ${new Date()} Message: Requested packages.Token not valid.`);
      res.send({successful:false,message:'Neautorizovan pristup.'});
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
      if(data.role!=='user')
      {
        logger.error(`Time: ${new Date()} Message: Requested companies.Token not valid.`);
        res.send({successful:false,message:'Neautorizovan pristup.'});
      }
      try{
        const data=await repo.GetCompanies();
        logger.info(`Time: ${new Date()} Message: Requested companies from database.`);
        res.send({successful:true,data:data});
      }
      catch(e)
      {
        console.log(e);
        logger.error(`Time: ${new Date()} Message: Requested companies.Token not valid.`);
        res.send({successful:false,message:'Doslo je do greske.'});
      }
    }
    else{
      logger.error(`Time: ${new Date()} Message: Requested companies.Token not valid.`);
      res.send({successful:false,message:'Neautorizovan pristup.'});
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
        {
          logger.info(`Time: ${new Date()} Message: Requested package with id ${id}`);
          res.send(data);
        }
        else
        {
          logger.error(`Time: ${new Date()} Message: Requested package with id ${id}. Id not valid.`);
          res.send('error');
        }
      }
      catch(e)
      {
        console.log(e);
        logger.error(`Time: ${new Date()} Message: Requested package with id ${id}. Something went wrong.`);
        res.send("error");
      }
    }
    else{
      logger.error(`Time: ${new Date()} Message: Requested package with id ${id}. Token not valid.`);
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
  console.log('buyPackage')
  const token=req.headers.authentication
  console.log(token);
  const c=jwt_decode(token);
  const id=req.body.id;
  const data=await repo.GetPackage(id);
  if(data!==null)
  {
    const user=await repo.GetUserByEmail(c.email);
    if(user===null)
    {
      logger.error(`Time: ${new Date()} Message: Requested package with id ${id} purchase. Token not valid.`);
      res.send('error');
    }
    else
    {
      const pack=data;
      const info={payment_id:'purch_'+id+'_'+c.id+'_'+uuid.v4(),amount:pack.price};
        const data2=await axios.post(`${psp_api}/new-payment`,info);
      //check token...
      console.log("sending url");
      logger.info(`Time: ${new Date()} Message: Purchased package with id ${id}. Responding with psp url.`);
      res.send("http://localhost:3001/home?paymentId="+info.payment_id);
    }
  }
  else 
  {
    logger.error(`Time: ${new Date()} Message: Requested package with id ${id} purchase. Id not valid.`);
    res.send('error');
  }
  
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
    logger.info(`Time: ${new Date()} Message: Requested premium purchase. Responding with psp url.`);
    res.send(data2.data.url+'?paymentId='+info.payment_id);
  }
  else 
  {
    logger.error(`Time: ${new Date()} Message: Requested premium purchase. Token not valid.`);
    res.send('error');
  }
  
});
app.post('/updatePremium',jsonParser,async(req,res)=>
{
  console.log('buyPremium');
  const id=req.body.id;
  const token=req.headers.authentication
  const c=jwt_decode(token);
  const data =await repo.GetUserByEmail(c.email);
  if(data!=null && data.password===c.password && id===c.id)
  {
   const dataa=repo.UpdatePremium(id);
   const user=await repo.GetUserByEmail(data.email);
   
    const token2 = jwt.sign(
      user,
      TOKEN_KEY,
      {
        expiresIn: "2h",
      }
      
    );
    logger.info(`Time: ${new Date()} Message: Premium membership payment successfuly executed. Responding with updated token.`);
    console.log('sending response:'+token2);
    res.send({successful:true,token:token2});
  }
  else 
  {
    logger.error(`Time: ${new Date()} Message: Premium membership payment successfuly executed request. Token not valid.`);
    res.send({successful:false,message:'Invalid data.'});
  }
  
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
  var id=uuid.v4();
  const premium=false;
  if(password==='123' || password==='1234' || password==='12345' || password==='123456' || password==='12345678' )
  {
    logger.error(`Time: ${new Date()} Message: Registration - input not valid.`);
    res.send({successful:false,message:'Choose different username and password.'});
  }
try{
  console.log(1);
  const check=await repo.GetUserByEmail(email);
  console.log(2);
  if(check!==null)
  {
    logger.error(`Time: ${new Date()} Message: Registration - input not valid.`);
    res.send({successful:false,message:'User with email already exist.'});
  }
  const check2=await repo.GetUserByPib(pib);
  if(check2!==null)
  {
    logger.error(`Time: ${new Date()} Message: Registration - input not valid.`);
    if(role==='user') res.send({successful:false,message:'User with jmbg already exist.'});
    else if(role==='company') res.send({successful:false,message:'User with pib already exist.'});
  }
  logger.info(`Time: ${new Date()} Message: ${name} successfuly registrated.`);
  const data= await repo.AddCompany({email,name,password,paid,pib,id,role,premium});
  console.log(3);
  id='reg_'+id;
  if(role==='company')
  {
    console.log('sending response:'+id);
    const info={payment_id:id,amount:10};
    const data2=await axios.post(`${psp_api}/new-payment`,info);
    console.log(data2);
    
    res.send({successful:true,id:id});

  }
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
    if(data!==null && data.password===password)
    {
      const code=randomstring.generate(6);
      // if(codes.get(email)===null)
      codes[email]=code;
      const messageStatus = transporter.sendMail({
        from: "agencija@gmail.com",
        to: email,
        subject: code,
        text: code,
      });
      logger.info(`Time: ${new Date()} Message: Company ${email} logging in.`);
      res.send({successful:true});
    }
    else
    {
      logger.error(`Time: ${new Date()} Message: Company ${name} unsuccessful login.`);
      res.send({successful:false,message:'Data not valid'});
    }
    
}
  catch(e)
  {
    console.log(e);
  }
});
app.post('/login2',jsonParser,async(req,res)=>
{
  console.log('login2');
  console.log(req.body);
  const email=req.body.email;
  const password=req.body.password;
  const code=req.body.code;
  if(codes[email]!==code) res.send({successful:false,message:'Invalid authentication code'});
  else
  {
    delete codes[email];
    const data= await repo.GetUserByEmail(email);
    if(data.role==='company')
        {
          console.log('issa company')
          console.log('data:'+JSON.stringify(data));
          const user=data;
          if(data.paid===false)
          {
            res.send({successful:false,id:'reg_'+data.id,message:'NOT-PAID'});
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
            logger.info(`Time: ${new Date()} Message: Company ${email} successfuly logged in. Responding with token.`);
            res.send({successful:true,token:token});
          }
          else{
            logger.error(`Time: ${new Date()} Message: Company ${email} unsuccessfuly login.`);
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
  
});
app.post('/paid-registration',async (req, res) => {
  const id=req.query.id;
  logger.info(`Time: ${new Date()} Message: Registration paid. Payment id: ${id}`);
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
      logger.info(`Time: ${new Date()} Message: Package successfuly paid. Payment id: ${paymentId}`);
        const data=await repo.AddPackageToCompany({company_id:companyId,package_id:Number(packageId),purchase_date:new Date()})
        res.send(data);
    }
    else{
      logger.error(`Time: ${new Date()} Message: Package unsuccessfuly paid. Payment id: ${paymentId}.`);
      res.send('error');
    }
  }
    catch(e)
    {
      console.log(e)
      res.send('error');
    }
});

