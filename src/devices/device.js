

class Device {

    constructor(data) {
        this.data = data
    }

    get path() {
        return this.data["path"]
    }

    get manufacturer() {
        return this.data["manufacturer"]
    }

    get vendorId() {
        return this.data["vendorId"]
    }
    
    get deviceRegistryConfig() {
        return this.data["deviceRegistryConfig"]
    }

    get naturalScroll() {
        return this.data["naturalScroll"]
    }

    get deviceRegistryConfig() {
        return this.data["deviceRegistryConfig"]
    }

    updateNaturalScroll(value) {
        this.data["naturalScroll"] = value
        this.deviceRegistryConfig.FlipFlopWheel.value = value ? 1 : 0
    }

}

export default Device