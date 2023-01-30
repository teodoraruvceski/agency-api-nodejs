const { createClient } =require("@supabase/supabase-js");
const supabaseUrl = 'https://qxvuqmzydpwwqvldclve.supabase.co'
const supabaseKey = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InF4dnVxbXp5ZHB3d3F2bGRjbHZlIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTY3MjE1NjAwNCwiZXhwIjoxOTg3NzMyMDA0fQ.P5kK_j5vTzKzNcEZOVEkOqIMmAetTFEND7Q7PCTYTnI"
const supabase = createClient(supabaseUrl, supabaseKey)

exports.GetUserByEmail=async function(email)
{
    const { data, error } = await supabase
                                .from('companies')
                                .select()
                                .eq('email', email);
    if(data!=null && data.length>0)
        return data[0];
    else 
        return null;
}
exports.GetCompanies=async function(email)
{
    const { data, error } = await supabase
                                .from('companies')
                                .select()
                                .eq('role', 'company');
    return data;
}
exports.GetPackages=async function()
{
    const {data,error}=await supabase
        .from('packages')
        .select();
    if(data!=null)
        return data;
    else 
        return null;
}
exports.GetPackage=async function(id)
{
    const {data,error}=await supabase
        .from('packages')
        .select()
        .eq('id',id);
    if(data!=null && data.length>0)
        return data[0];
    else 
        return null;
}
exports.UpdatePaid=async function(id)
{
    const {data,error}= await supabase
      .from('companies')
      .update([
          {paid:true}
      ])
      .eq('id',id)
    if(data!=null )
        return data;
    else 
        return null;
}
exports.UpdatePremium=async function(id)
{
    const {data,error}= await supabase
      .from('companies')
      .update([
          {premium:true}
      ])
      .eq('id',id)
    if(data!=null )
        return data;
    else 
        return null;
}
exports.AddCompany=async function(c)
{
    console.log(c);
    const {data,error}= await supabase
    .from('companies')
    .insert([ c])
    .single();
    if(data!=null )
        return data;
    else 
        return null;
}
exports.AddPackageToCompany=async function(c)
{
    const {data,error}= await supabase
    .from('companies-packages')
    .insert([ c])
    .single();
    console.log(error);
    console.log(data);
    if(data!=null )
        return data;
    else 
        return null;
}