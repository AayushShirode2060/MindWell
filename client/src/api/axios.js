 import axios from 'axios';

 const API=axios.create({
    baseURL:'/api',//Vite proxy forward this to localhost:5000
 })

 //beforre every rrequest ,attach jwt token from sessionStorage
 API.interceptors.request.use((config)=>{
    const token=sessionStorage.getItem('token');
    if(token){
        config.headers.Authorization=`Bearer ${token}`;
    }
    return config;
 })

 //after every respnse,check for 401(expired token)
 API.interceptors.response.use(
    (response)=>response,
     (error)=>{
        if(error.response?.status===401){
            sessionStorage.removeItem('token');

            sessionStorage.removeItem('user');

            //redirect to login if not already there
            if(window.location.pathname!=='/login'){
                window.location.href='/login'
            }
        }
        return Promise.reject(error);
     }
    )

export default API;