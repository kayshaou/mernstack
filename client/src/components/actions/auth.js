import axios from 'axios'
import { setAlert } from './alert'
import {REGISTER_SUCCESS, REGISTER_FAILED, USER_LOADED, AUTH_ERROR, LOGIN_SUCCESS, LOGIN_FAIL, LOGOUT} from './types';
import setAuthToken from '../../utils/setAuthToken'

export const loadUser = () => async dispatch => {
    // console.log('is there any token ? '+localStorage.token);
    if(localStorage.token){
        setAuthToken(localStorage.token);
    }

    try{
        const res = await axios.get('/api/auth');
        // console.log('what is res '+res.data);
        dispatch({
            type: USER_LOADED,
            payload: res.data
        });
 
    } catch(err){
        // console.error(err.response.data);
        // const res = await axios.get('/api/auth');
        // console.log('what is res in error '+res.data);
        dispatch({
            type: AUTH_ERROR
            // type: USER_LOADED,
            // payload: res.data
        })
    }

}

export const register = ({name, email, password}) => async dispatch => {
    const config = {
        headers:{
            'Content-type' : 'application/json'
        }
    }

    // console.log('auth log '+name +' ema '+email+' pwd '+password);

    const body = JSON.stringify({name, email, password});
    try {

        // console.log('sending  body '+body);
        const res = await axios.post('/api/users', body, config);

        // dispatch success
    
        dispatch({
            type: REGISTER_SUCCESS, 
            payload: res.data // responding token
        })
    } catch (error) {
        const errors = error.response.data.errors;
    
        if(errors){
            errors.forEach(error => {
                dispatch(setAlert(error.msg, 'danger'))
               
            })
        }
        dispatch({
            type: REGISTER_FAILED
        })
    }
} 
// login
export const login = (email, password) => async dispatch => {
    const config = {
        headers:{
            'Content-type' : 'application/json'
        }
    }

    // console.log('auth log '+name +' ema '+email+' pwd '+password);

    const body = JSON.stringify({email, password});
    try {

        // console.log('sending  body '+body);
        const res = await axios.post('/api/auth', body, config);

        // dispatch success
    
        dispatch({
            type: LOGIN_SUCCESS, 
            payload: res.data // responding token
        });

        dispatch(loadUser());
    } catch (error) {
        const errors = error.response.data.errors;
    
        if(errors){
            errors.forEach(error => {
                dispatch(setAlert(error.msg, 'danger'))
               
            })
        }
        dispatch({
            type: LOGIN_FAIL
        })
    }
} 

export const logout = () => dispatch => {
    dispatch({
        type: LOGOUT
    });
}