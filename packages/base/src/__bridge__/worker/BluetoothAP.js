
__webpack_require__.r(__webpack_exports__);
/* harmony export (binding) */ __webpack_require__.d(__webpack_exports__, "default", function() { return BluetoothAP; });
function transformAdvertisData(devices) {
    if (devices) {
        devices.forEach(function (val) {
            val.advertisData = val.manufacturerData;
        });
    }
}
function BluetoothAP() {
    return {
        openBluetoothAdapter: {},
        closeBluetoothAdapter: {},
        getBluetoothAdapterState: {},
        startBluetoothDevicesDiscovery: {},
        stopBluetoothDevicesDiscovery: {},
        getBluetoothDevices: {
            a: function a(res) {
                transformAdvertisData(res.devices);
            }
        },
        getConnectedBluetoothDevices: {
            a: function a(res) {
                transformAdvertisData(res.devices);
            }
        },
        connectBLEDevice: {},
        disconnectBLEDevice: {},
        writeBLECharacteristicValue: {},
        readBLECharacteristicValue: {},
        notifyBLECharacteristicValueChange: {},
        getBLEDeviceServices: {},
        getBLEDeviceCharacteristics: {},
        onBLECharacteristicValueChange: {
            // 真正的事件名，会把首字母自动转成小写，因此这里使用 map 可避免这个问题
            m: 'BLECharacteristicValueChange'
        },
        offBLECharacteristicValueChange: {
            m: 'BLECharacteristicValueChange'
        },
        onBluetoothAdapterStateChange: {},
        offBluetoothAdapterStateChange: {},
        onBLEConnectionStateChanged: {
            m: 'BLEConnectionStateChanged'
        },
        offBLEConnectionStateChanged: {
            m: 'BLEConnectionStateChanged'
        },
        onBluetoothDeviceFound: {
            a: function a(res) {
                res.advertisData = res.manufacturerData;
            }
        },
        offBluetoothDeviceFound: {},
        startBeaconDiscovery: {},
        stopBeaconDiscovery: {},
        getBeacons: {},
        onBeaconUpdate: {
            m: 'beaconUpdate'
        },
        offBeaconUpdate: {
            m: 'beaconUpdate'
        },
        onBeaconServiceChange: {
            m: 'beaconServiceChange'
        },
        offBeaconServiceChange: {
            m: 'beaconServiceChange'
        }
    };
}

