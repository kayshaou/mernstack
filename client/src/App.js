import React, { Fragment, useEffect } from 'react';
import { Route, Switch, BrowserRouter as Router } from 'react-router-dom'

import Navbar from './components/layout/Navbar';
import Landing from './components/layout/Landing';
import Dashboard from './components/layout/dashboard/Dashboard'
import Register from './components/auth/Register';
import Login from './components/auth/Login';

//redux
// this connects reacy n redux tgt
import { Provider } from 'react-redux';
// the store we initiated
import store from './store';
//
import Alert from './components/layout/Alert'

import './App.css';
import { loadUser } from '../src/components/actions/auth'
import { userInfo } from 'os';
import setAuthToken from './utils/setAuthToken'

console.log(localStorage.getItem('token'));
if(localStorage.token){
  setAuthToken(localStorage.token);
}
 
const App = () => {
  useEffect(() => {
    store.dispatch(loadUser());
  }, []);

return (
  <Provider store={store}>
   <Router>
    <Fragment>
      <Navbar/>
      {/* <Landing /> */}
      <Route exact path="/" component={Landing} />
      <section className="container"> 
        <Alert />
        <Switch>
          <Route path="/register" component={Register} /> 
          <Route path="/login" component={Login} /> 
          <Route path="/dashboard" component={Dashboard} />
        </Switch>
      </section>
    </Fragment>
   </Router>
   </Provider>
)}
export default App;
