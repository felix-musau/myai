const axios=require('axios');
(async()=>{
  try{
    let r=await axios.post('http://localhost:10000/api/auth/register',
      {username:'testuser',email:'test@example.com',password:'Password123'},
      {withCredentials:true,validateStatus:()=>true}
    );
    console.log('status',r.status,'data',r.data);
  } catch(e){
    console.error('error',e.message);
  }
})();
