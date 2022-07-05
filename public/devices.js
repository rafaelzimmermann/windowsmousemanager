var regedit = require('regedit');
var hid = require('node-hid');
const path = require('path');
const fs = require('fs');
const os = require('os');
const { data } = require('./vbsfiles')

let DeviceBuilder = class {
    constructor() {
        this.data = {}
    }

    path(value) {
        this.data["path"] = value
        return this
    }

    manufacturer(value) {
        this.data["manufacturer"] = value
        return this
    }

    vendorId(value) {
        this.data["vendorId"] = value
        return this
    }

    productId(value) {
        this.data["productId"] = value
        return this
    }
    
    naturalScroll(value) {
        this.data["naturalScroll"] = value
        return this
    }

    deviceRegistryConfig(value) {
        this.data["deviceRegistryConfig"] = value
        return this
    }

    get build() {
        return this.data
    }

}


var createRegeditResourcesDir = () => {
    const appPrefix = 'win_mouse_manager';
    try {
        return fs.mkdtempSync(path.join(os.tmpdir(), appPrefix));
    } catch {
        console.log("Failed to start.")
        return undefined
    }
}
const REGEDIT_VBS = createRegeditResourcesDir();

var deployVBS = () => {
    const files = JSON.parse(JSON.parse(Buffer.from(data, 'base64').toString('utf8')))
    Object.entries(files).forEach((entry) => {
        let fileName = entry[0]
        let fileData = entry[1]
        console.log(fileName)
        console.log(fileData)
        let buff = new Buffer.from(fileData, 'base64');
        fs.writeFileSync(path.join(REGEDIT_VBS, fileName), buff.toString('utf8'))
    })    

}

const DEVICES_PATH = 'HKLM\\SYSTEM\\CurrentControlSet\\Enum\\HID'



console.log(regedit.setExternalVBSLocation(REGEDIT_VBS))
const registry = regedit.promisified;


var keyExists = (v) => {
    return v[Object.keys(v)[0]]['exists'] == true
}

var toKey = (list) => {
    return list.join('\\')
}

async function listRegistry(regPath) {
    const result = await registry.list([regPath])
    return result
}

async function getDeviceParameters(regs) {
    const innerResults = await Promise.all(regs.map((key) => listRegistry(key)))
    return await Promise.all(innerResults.filter(keyExists).map((innerResult) => {
        let innerPath = Object.keys(innerResult)[0]
        return innerResult[innerPath]['keys'].map((v) => {
            return listRegistry(toKey([innerPath, v,'Device Parameters'])).then((d) => {
                k = Object.keys(d)[0]
                d[k]['path'] = toKey([innerPath, v])
                d[k]['parametersPath'] = k
                d[k]['parentPath'] = innerPath
                d[k]['parentRegistry'] = innerResult
                return d[k]
            })
        })
    }).flat());
}

async function addDeviceProperties(devices) {
    return Promise.all(devices.map((d) => {
        k = Object.keys(d['parentRegistry'])[0]
        kk = d['parentRegistry'][k]['keys'][0]
        return listRegistry(toKey([k, kk])).then((di) => {
            k = Object.keys(di)[0]
            d['parentProperties'] = di[k]
            return d;
        })
    }))
}

async function listHID() {
    var devicesRoot = await listRegistry(DEVICES_PATH).then((result) => {
        const devicePath = Object.keys(result)[0]
        return result[devicePath]['keys'].map(k => toKey([devicePath,  k]))
    })

    const devices = await getDeviceParameters(devicesRoot)
    return await addDeviceProperties(devices)
}


async function listMices() {
    var hidDevices = await hid.devices()
    var devices = await listHID().then((devices) => {
        return devices
        .filter(d => {
            return d.values !== undefined && 'FlipFlopWheel' in d['values']})
        .map(d => {
            const re = /.*hid#([^#]+)/
            d['hid-info'] = hidDevices.filter(di => {
                dpath = di['path'].match(re)[1]
                return d['parametersPath'].toLowerCase().includes(dpath.toLowerCase())
            }).pop()
            return d
        })
    })
    let result = devices
        .filter(d => d["hid-info"])
        .map((d) => {
            return new DeviceBuilder()
                .path(d['parametersPath'])
                .manufacturer((d['hid-info'] || {})['manufacturer'])
                .vendorId(d['hid-info']['vendorId'])
                .productId(d['hid-info']['productId'])
                .naturalScroll(d['values']['FlipFlopWheel']['value'] == 1)
                .deviceRegistryConfig(d['values'])
                .build
        })
    return result
}

async function updateRegistry(payload) {
    return await registry.putValue(payload)
}

module.exports = { deployVBS, listMices, updateRegistry }