const axios=require('axios');
const fs=require('fs');
(async()=>{
  try{
    // login first
    let r=await axios.post('http://localhost:10000/api/auth/login',
      {username:'testuser',password:'Password123'},
      {withCredentials:true,validateStatus:()=>true}
    );
    console.log('login',r.status);
    const cookies = r.headers['set-cookie'];
    // logout with same cookie
    let r2=await axios.post('http://localhost:10000/api/auth/logout',{},
      {withCredentials:true,headers:{Cookie:cookies.join('; ')},validateStatus:()=>true}
    );
    console.log('logout',r2.status,r2.data);
    // check
    let r3=await axios.get('http://localhost:10000/api/auth/check',{
      withCredentials:true,headers:{Cookie:cookies.join('; ')},validateStatus:()=>true
    });
    console.log('check after logout',r3.status,r3.data);
  } catch(e){
    console.error('error',e.message);
  }
})();
