import 'bootstrap/dist/css/bootstrap.min.css';
import axios from "axios";
import { useState, useEffect } from "react";
import { Form, Button, DropdownButton, Dropdown, Card } from "react-bootstrap";
import {
  LineChart,
  ResponsiveContainer,
  Legend, Tooltip,
  Line,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';
import moment from 'moment';

function App() {

  const Adjuster = () =>{
  
    const [calibration_min, setCalibration_min] = useState(0);
    const [calibration_max, setCalibration_max] = useState(100);
    const [calibration_reverse, setCalibration_reverse] = useState(false);
    const [percentOpen, setPercentOpen] = useState(50);
  
    const setPercentOpenSend = () => {
        axios({
          method:'POST',
          url:'/api/setServoPosition',
          data:{
              percent: percentOpen,
              calibration_max: calibration_max,
              calibration_min: calibration_min,
              calibration_reverse: calibration_reverse
          }
      });
    };

  return (
  <Form.Group className="mb-3">
    <Form.Label>
        Min%
        <Form.Control min="0" max="100" type="number" onChange={ e=>setCalibration_min(parseFloat(e.target.value)) } value={ calibration_min } />    
    </Form.Label>
  
    <Form.Label>
        Max%
        <Form.Control min="0" max="100" type="number" onChange={ e=>setCalibration_max(parseFloat(e.target.value)) } value={ calibration_max } />    
    </Form.Label>
    <Form.Label>
        Reverse
        <Form.Check checked={ calibration_reverse } onChange={ e=>setCalibration_reverse(!calibration_reverse) } type="checkbox"/> 
    </Form.Label>
    <Form.Label>
        Set% Open
        <Form.Control min="0" max="100" type="number" onChange={ e=>setPercentOpen(parseFloat(e.target.value)) } value={ percentOpen }/>    
    </Form.Label>
    <Button onClick={ setPercentOpenSend }>
        Set
    </Button>
  </Form.Group>
  )};
  
  const MeaterLogin = () => {

    const [userName, setUserName] = useState("");
    const [password, setPassword] = useState("");

    const login = () =>{
      axios({
          method:'POST',
          url:'/api/meaterLogin',
          data:{
              'userName': userName,
              'password': password
          }
      });
    };

    return(
      <Form.Group className="mb-3">
        <Form.Label>
            Username
            <Form.Control type="text" onChange={ e=>setUserName(e.target.value) } value={ userName }/>    
        </Form.Label>
      
        <Form.Label>
            Password
            <Form.Control type="password" onChange={ e=>setPassword(e.target.value) } value={ password }/>    
        </Form.Label>
      
        <Button onClick={ login }>
            Login
        </Button>
      </Form.Group>
)};

const LiveData = () => {

  const [meaterData, setMeaterData] = useState();

  const updateData = () => {
    axios({
      method:'GET',
      url:'/api/getMeaterData'
    })
    .then((meaterDataRes) =>{
      setMeaterData(meaterDataRes.data);
    });
  };

  let intervalId = null;
  const startPolling = () => {
    if(intervalId != null) {
      clearInterval(intervalId);
    }
    updateData();
    intervalId = setInterval(updateData, 15 * 1000);
  };


return (
<Form.Group className="mb-3">
  <Button onClick={ startPolling }>
      Start
  </Button>
  <pre>
    { JSON.stringify(meaterData, null, 2) }
  </pre>
</Form.Group>
)};

const Stats = () => {
  const useFetch = (url) => {
    const [data, setData] = useState(null);
  
    // empty array as second argument equivalent to componentDidMount
    useEffect(() => {
      async function fetchData() {
        const response = await fetch(url);
        const text = await response.text();
        setData(text);
      }
      fetchData();
    }, [url]);
  
    return data;
  };
  
  const [selectedSession, setSelectedSession] = useState();
  const [selectedTimeRange, setSelectedTimeRange] = useState('all');

  const sessions = JSON.parse(useFetch('/api/sessions'));

  let selectedSessionData = useFetch('/api/sessions/' + selectedSession);
  let selectedJson = null;

  let probeIndicesToRender = [];

  try {
    selectedJson = '[' + selectedSessionData.trim('\n').split('\n').join(',') + ']';
    selectedSessionData = JSON.parse(selectedJson);

    const mostRecentData = selectedSessionData[selectedSessionData.length - 1];

    let minTimeStamp;
    switch(selectedTimeRange){
      case 'all':
        minTimeStamp = 0; 
        break;
      case 'halfHour':
         minTimeStamp = moment(mostRecentData.timestamp).unix() - (60 * 30);
         break;
      case 'hour':
        minTimeStamp = moment(mostRecentData.timestamp).unix() - (60 * 60);
        break;
      case '2hours':
        minTimeStamp = moment(mostRecentData.timestamp).unix() - (60 * 60 * 2);
        break;
      case '4hours':
        minTimeStamp = moment(mostRecentData.timestamp).unix() - (60 * 60 * 4);
        break;
    }

    console.log('asdsadsadsadasd', minTimeStamp, mostRecentData);

    selectedSessionData = selectedSessionData.filter(s => moment(s.timestamp).unix() > minTimeStamp);

    probeIndicesToRender = mostRecentData.probes.map((p, idx) => (p.ambientTempF > 130) ? idx : null).filter(i => i != null);

  } catch(e){
    console.log('error parsing stats', e, selectedJson);
    selectedSessionData = null;
  }
  console.log('selectedSessionData',selectedSessionData, probeIndicesToRender);
return (
<div>
  <DropdownButton onSelect={ (idx) => { setSelectedSession(idx); } } title="Session">
    {
      (sessions && sessions.sessionIds ? sessions.sessionIds : []).map((session, idx) => (
        <Dropdown.Item eventKey={ idx }>{ session }</Dropdown.Item>
      ))
    }
  </DropdownButton>
  <h5>{ (sessions && sessions.sessionIds && selectedSession ? sessions.sessionIds[selectedSession] : '') }</h5>
  <button onClick={ () => setSelectedTimeRange('all') }>All</button>
  <button onClick={ () => setSelectedTimeRange('4hours') }>4 Hours</button>
  <button onClick={ () => setSelectedTimeRange('2hours') }>2 Hours</button>
  <button onClick={ () => setSelectedTimeRange('hour') }>Hour</button>
  <button onClick={ () => setSelectedTimeRange('halfHour') }>Half Hour</button>
  <ResponsiveContainer width="100%" aspect={3}>
      <LineChart data={selectedSessionData}>
          <CartesianGrid />
          <Tooltip />
          <XAxis
            dataKey={ d => moment(d.timestamp).unix() * 1000  }
            tickFormatter={(unixTime) => moment(unixTime).format('HH:mm') }
            label={(unixTime) => moment(unixTime).format('HH:mm') }
            type='number'
            domain={['dataMin', 'dataMax']}
          />
          <YAxis/>
          <Legend />
          <Line dataKey="servo.percent" name="Servo %" stroke="black" dot={false} />
              
          {
            probeIndicesToRender.map((idx) => (
              <Line name={ 'Ambient #' + idx } dataKey={ (data) => data.probes[idx] ? data.probes[idx].ambientTempF : null } stroke="red" dot={false} unit="°f" />
            ))
          }
          {
            probeIndicesToRender.map((idx) => (
              <Line name={ 'Internal #' + idx } dataKey={ (data) => data.probes[idx] ? data.probes[idx].internalTempF : null } stroke="blue" dot={false} unit="°f" />
            ))
          }

      </LineChart>
  </ResponsiveContainer>
</div>
)};

  return (
      <div>
        <h3>Robo-Kamado</h3>
        <h4>Adjust</h4>
        <Adjuster />
        
        <h4>Meater Login</h4>
        <MeaterLogin />

        <h4>Live Data</h4>
        <LiveData />

        <h4>Stats</h4>
        <Stats />
      </div>
  );
}



export default App;
