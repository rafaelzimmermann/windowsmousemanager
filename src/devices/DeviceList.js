import React from "react";
import ReactDOM from 'react-dom/client';
const {
    Link
} = ReactDOM
const {ipcRenderer} = window.require('electron')



class DeviceList extends React.Component {
    state = {
        devices: []
    }
    constructor() {
        super()
        this.state.devices = ipcRenderer.sendSync('list-devices').filter(d => d["hid-info"])
        console.log(this.state)
    }
    render() {
        return (
            <div className='DeviceList'>
            <table className="table">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Manufacturer</th>
                    <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.devices.map((d, i) =>
                        <tr key={d['path']}>
                        <th scope="row">{i}</th>
                        <td>
                            <a href={"/device/" + d["path"]}>
                                {(d['hid-info'] || {})['manufacturer'] || '-'}
                            </a>
                        </td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        );
    }
    
  }
  
  export default DeviceList;
  