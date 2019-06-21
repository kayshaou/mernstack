import axios from 'axios'

const setAuthToken = (token) => {

    console.log('set auth token get called? '+token);
    if(token){
        // localStorage.setItem('x-auth-token', token);
        console.log('setting token header '+token);
        axios.defaults.headers.common['x-auth-token'] = token;
    } else {
     delete axios.defaults.headers.common['x-auth-token'];
    }
} 

export default setAuthToken;
