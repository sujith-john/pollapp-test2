import React, { Component } from "react";

import Home from "./Components/Home";
import {Router, Route } from 'react-router';
import { BrowserRouter, Switch  } from 'react-router-dom'
import Admin from "./Components/Admin";
import Users from "./Components/Users";
import Results from "./Components/Results";
import Navbar from "./Components/Navbar";
import Notfound from "./Components/Notfound"

var io = require('socket.io-client');



class App extends Component {
  constructor() {
    super();
    // this.state = {
    //   endpoint: "http://127.0.0.1:4001",
    //   status: 'disconnected'
    // };
    this.state = {
        status:'disconnected',
        title:'',
        member:{},  //from this specific socket
        audience :[],
        administrator: '' ,// same for all sock
        questions:[],
        currentQuestion:false

    }
    this.emit = this.emit.bind(this);
  }
  // getInitialState(){
  //   return {
  //       status: 'disconnected',
  //       title:'Poll name',

  //   }
  // }
  //listen for events
  componentWillMount() {
    this.socket = io('http://127.0.0.1:4001')
    this.socket.on('connect', this.connect);
    this.socket.on('disconnect', this.disconnect)
    this.socket.on('welcome', this.updateState)
    this.socket.on('joined', this.joined)
    this.socket.on('audience', this.updateAudience);
    this.socket.on('start', this.start);
    this.socket.on('end', this.updateState);
    this.socket.on('ask', this.ask);
    // const { endpoint } = this.state;
    // const socket = socketIOClient(endpoint);
    // socket.on('connect', this.connect);
    // socket.on("FromAPI", data => this.setState({ response: data }));
   
    // socket.on('disconnect', this.disconnect);
    // socket.on('welcome', this.welcome);
  }

  emit=(eventName, dataFromClient) => {
    this.socket.emit(eventName, dataFromClient);
  }
  connect=()=>{
    var member = (sessionStorage.member) ? JSON.parse(sessionStorage.member): null;
    if (member && member.type === 'audience'){
      this.emit('join', member) // automatically join user after refresh
    }else if (member && member.type === 'administrator'){
      this.emit('start', {name: member.name, title:sessionStorage.title});
    }
    this.setState({status: 'connected'})
  }

  disconnect=()=>{
    this.setState({
      status: 'disconnected',
      title: 'disconnected',
      administrator: '' 
  
    });
  }
  updateState=(serverState)=>{
    this.setState(serverState)
  }

  joined=(member)=>{
    sessionStorage.member = JSON.stringify(member)
    this.setState({member:member})
  }

  updateAudience=(newAudience)=>{
    this.setState({audience: newAudience});
  }
  start(){
    // if (this.state.administrator.type === 'administrator'){
    //   sessionStorage.title = poll.title;
    // }
    // this.setState(poll);
  }
  ask=(question)=>{
    this.setState({currentQuestion: question});
  }

  render() {
    // const {response} = this.state;
    return (
      <BrowserRouter>
        <div style={{ textAlign: "center" }}>
          <Navbar />
          <Switch>
            <Route exact path="/" 
              render={(props) => <Home {...props} {...this.state} />} 
            />
            <Route path="/users" 
              render={(props) => <Users  {...props} emit={this.emit} {...this.state} />}
            />
            <Route path="/results" 
              render={(props) => <Results  {...props} {...this.state} />} 
            />
            <Route path="/admin" 
              render={(props) => <Admin  {...props} emit={this.emit} {...this.state} />}
            />
            <Route component={Notfound} />;   
          </Switch>
        
        {/* <Home title={this.state.title} status={this.state.status}/> */}
        
        </div>
      </BrowserRouter>

    )
  }
}
export default App;