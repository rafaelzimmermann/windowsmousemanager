var registry = require('regedit').promisified
var hid = require('node-hid');


const DEVICES_PATH = 'HKLM\\SYSTEM\\CurrentControlSet\\Enum\\HID'


var keyExists = (v) => {
    return v[Object.keys(v)[0]]['exists'] == true
}

var toKey = (list) => {
    return list.join('\\')
}

async function listRegistry(path) {
    const result = await registry.list([path])
    return result
}

async function getDeviceParameters(regs) {
    const innerResults = await Promise.all(regs.map((key) => listRegistry(key)))
    return await Promise.all(innerResults.filter(keyExists).map((innerResult) => {
        path = Object.keys(innerResult)[0]
        return innerResult[path]['keys'].map((v) => {
            return listRegistry(toKey([path, v,'Device Parameters'])).then((d) => {
                k = Object.keys(d)[0]
                d[k]['path'] = path
                d[k]['parametersPath'] = k
                return d[k]
            })
        })
    }).flat());
}

async function listHID() {
    var devicesRoot = await listRegistry(DEVICES_PATH).then((result) => {
        const devicePath = Object.keys(result)[0]
        return result[devicePath]['keys'].map(k => toKey([devicePath,  k]))
    })

    return await getDeviceParameters(devicesRoot)
}

async function listMices() {
    return await listHID().then((devices) => {
        return devices.filter(d => {
            return d.values !== undefined && 'FlipFlopWheel' in d['values']
        })  
    })
}

exports.listMices = listMices