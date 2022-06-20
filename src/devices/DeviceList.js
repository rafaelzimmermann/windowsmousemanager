import React from "react";

const {ipcRenderer} = window.require('electron')



class DeviceList extends React.Component {
    state = {
        devices: []
    }
    constructor() {
        super()
        this.state.devices = ipcRenderer.sendSync('list-devices')
    }
    render() {

        return (
            <div className='DeviceList'>
            <table className="table">
                <thead>
                    <tr>
                    <th scope="col">#</th>
                    <th scope="col">Device Path</th>
                    <th scope="col"></th>
                    </tr>
                </thead>
                <tbody>
                    {this.state.devices.map((d, i) =>
                        <tr>
                        <th scope="row">{i}</th>
                        <td>{d['path']}</td>
                        </tr>
                    )}
                </tbody>
            </table>
            </div>
        );
    }
    
  }
  
  export default DeviceList;
  