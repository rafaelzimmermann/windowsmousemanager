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
                d[k]['path'] = toKey([path, v])
                d[k]['parametersPath'] = k
                d[k]['parentPath'] = path
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
    return await listHID().then((devices) => {
        return devices
        .filter(d => {
            return d.values !== undefined && 'FlipFlopWheel' in d['values']})
        .map(d => {
            const re = /.*hid#([^#]+)/
            d['hid-info'] = hidDevices.filter(di => {
                path = di['path'].match(re)[1]
                return d['parametersPath'].toLowerCase().includes(path.toLowerCase())
            }).pop()
            return d
        })
    })
}

exports.listMices = listMices