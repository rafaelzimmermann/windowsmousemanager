import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css'
import DeviceList from './devices/DeviceList';
import Device from './devices/Device';
import ReactDOM from 'react-dom/client';


function App() {
  return (
    <div className='App'>
      <DeviceList/>
      <Device/>
    </div>
  );
}

export default App;
