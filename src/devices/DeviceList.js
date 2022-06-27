import React from "react";
import './DeviceList.css';
import vendorIds from './vendorid'
import Mouse from './icons/mouse'
import ArrowClockwise from "./icons/arrow-clockwise";
const electron = window.require('electron');
const ipcRenderer  = electron.ipcRenderer;



class DeviceList extends React.Component {
    state = {
        devices: [],
        device: {
            "hid-info": {},
            "values":{
                "FlipFlopWheel": {}
            }
        }
    }
    constructor() {
        super()
        ipcRenderer.invoke('list-devices')
            .then((devices) => {
                this.state.devices = (devices || []).filter(d => d["hid-info"])
                this.state.device = this.state.devices[0]
                this.forceUpdate()
            })
            .catch(err => console.log(err))
    }
    render() {
        const selectDevice = (index) => {
            this.state.device = this.state.devices[index]
            this.forceUpdate()
        }
        const changeVerticalScroll = (event) => {
            let device = this.state.device 
            device.values.FlipFlopWheel.value = parseInt(event.target.value);
            let payload = {}
            payload[device["parametersPath"]] = device.values
            ipcRenderer
                .invoke('update-device', payload)
                .then(() => { refresh() })
                .catch(err => console.log(err))
        }
        function toPaddedHexString(num, len) {
            let str = num.toString(16);
            return "0".repeat(len - str.length) + str;
        }
        const vendorName = (vendorId) => {
            vendorId = vendorId || 0
            return vendorIds[toPaddedHexString(vendorId, 4)] || ""
        }
        const selectedClass = (i) => {
            return this.state.devices[i]["path"] === this.state.device["path"] ? "selected" : ""
        }
        const refresh = () => {
            let selectedDevicePath = this.state.device.path

            this.state.devices = (ipcRenderer.sendSync('list-devices-no-cache') || []).filter(d => d["hid-info"])
            this.state.devices.forEach((d) => {
                if (d.path == selectedDevicePath) {
                    this.state.device = d
                }
            })
            if (this.state.device == undefined) {
                this.state.device = this.state.devices[0]
            }
            this.forceUpdate()
        }
        return (
            <div className='DeviceList'>
            <div className="container-fluid">
                <div className="row">
                <div className="col">
                    <table className="table">
                    <thead>
                        <tr>
                        <th scope="col"></th>
                        <th scope="col">Manufacturer</th>
                        <th scope="col" className="clickable-row"><ArrowClockwise onClick={() => refresh()}></ArrowClockwise></th>
                        </tr>
                    </thead>
                    <tbody>
                        {this.state.devices.map((d, i) =>
                            <tr key={d['path']} onClick={() => selectDevice(i)} className={"clickable-row " + selectedClass(i) } index={i}>
                                <th scope="row"><Mouse></Mouse></th>
                                <td>
                                    {(d['hid-info'] || {})['manufacturer'] || vendorName(d["hid-info"]["vendorId"]) }                                        
                                </td>
                                <td></td>
                            </tr>
                        )}
                    </tbody>
                    </table>
                </div>
                <div className="col">
                    <div className='Device'>
                        <nav className="navbar navbar-expand-lg bg-light">
                            <span className="navbar-brand">Device configuration</span> 
                        </nav>
                        <form>
                            <div className="row">
                                <div className="col">
                                    <label className="form-label" htmlFor="product-id">
                                        Manufacturer
                                    </label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        id="product-id"
                                        placeholder="Unknown"
                                        value={this.state.device["hid-info"]["manufacturer"]}
                                        disabled>
                                    </input>
                                    
                                </div>
                            </div>
                            <div className="row">
                                <div className="col">
                                    <label className="form-label" htmlFor="vendor-name">
                                        Vendor Name
                                    </label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        id="vendor-name"
                                        placeholder="Unknown"
                                        value={vendorName(this.state.device["hid-info"]["vendorId"])}
                                        disabled>
                                    </input>
                                </div>
                            </div>
                            <div className="row">
                                <div className="form-check col">
                                    <label className="form-label" htmlFor="product-id">
                                        Product Id
                                    </label>
                                    <input 
                                        type="text"
                                        className="form-control"
                                        id="product-id"
                                        placeholder="Product Id"
                                        value={this.state.device["hid-info"]["productId"]}
                                        disabled>
                                    </input>
                                    
                                </div>
                                <div className="form-check col">
                                <label className="form-label" htmlFor="vendor-id">
                                    Vendor Id
                                </label>
                                <input 
                                        type="text"
                                        className="form-control"
                                        id="vendor-id"
                                        placeholder="Vendor Id"
                                        value={this.state.device["hid-info"]["vendorId"]}
                                        disabled>
                                    </input>
                                    
                                </div>
                            </div>
                            <div className="row">
                                <div className="form-check col">
                                    <input 
                                        className="form-check-input" 
                                        type="radio" 
                                        name="horizontalScroolDirection" 
                                        value="1"
                                        checked={this.state.device["values"]["FlipFlopWheel"]["value"] == 1}
                                        onChange={changeVerticalScroll}
                                        id="natural-scrool">
                                    </input>
                                    <label className="form-check-label" htmlFor="natural-scrool">
                                        Natural Scrool
                                    </label>
                                </div>
                                <div className="form-check col">
                                    <input 
                                        className="form-check-input"
                                        type="radio"
                                        name="horizontalScroolDirection"
                                        checked={this.state.device["values"]["FlipFlopWheel"]["value"] == 0}
                                        onChange={changeVerticalScroll}
                                        value="0"
                                        id="unatual-scrool">
                                    </input>
                                    <label className="form-check-label" htmlFor="flexRadioDefault2">
                                        Default
                                    </label>
                                </div>
                            </div>
                        </form>
                    </div>
                </div>
                </div>
            </div>
            </div>
        );
    }
    
  }
  
  export default DeviceList;
  