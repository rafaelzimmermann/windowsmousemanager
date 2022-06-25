import React from "react";

const {ipcRenderer} = window.require('electron')



class Device extends React.Component {
    state = {
        device: {}
    }
    constructor(path) {
        super()
        let devices = ipcRenderer.sendSync('list-devices')
        this.state.device = devices[0]
    }
    render() {
        return (
            <div className='Device'>
                <form>
                    <div className="mb-3">
                        <div className="form-check">
                            <input 
                                className="form-check-input" 
                                type="radio" 
                                name="horizontalScroolDirection" 
                                id="natural-scrool">
                            </input>
                            <label className="form-check-label" htmlFor="natural-scrool">
                                Natural Scrool
                            </label>
                        </div>
                        <div className="form-check">
                            <input 
                                className="form-check-input"
                                type="radio"
                                name="horizontalScroolDirection"
                                id="unatual-scrool">
                            </input>
                            <label className="form-check-label" htmlFor="flexRadioDefault2">
                                Default
                            </label>
                        </div>
                    </div>
                </form>
            </div>
        );
    }
    
  }
  
  export default Device;
  