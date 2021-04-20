

"use strict";


Component({
    options: {
        addGlobalClass: true
    },
    properties: {
        type: {
            type: String,
            value: 'error',
            observer: '_typeChange'
        },
        show: {
            type: Boolean,
            value: false,
            observer: '_showChange'
        },
        msg: {
            type: String,
            value: ''
        },
        delay: {
            type: Number,
            value: 2000
        },
        extClass: {
            type: String,
            value: ''
        }
    },
    data: {
        typeClassMap: {
            'warn': 'cweui-toptips_warn',
            'info': 'cweui-toptips_info',
            'success': 'cweui-toptips_success',
            'error': 'cweui-toptips_error'
        }
    },
    attached: function attached() {
        var data = this.data;
        this.setData({
            className: data.typeClassMap[data.type] || ''
        });
    },

    methods: {
        _typeChange: function _typeChange(newVal) {
            this.setData({
                className: this.data.typeClassMap[newVal] || ''
            });
            return newVal;
        },
        _showChange: function _showChange(newVal) {
            this._showToptips(newVal);
        },
        _showToptips: function _showToptips(newVal) {
            var _this = this;

            if (newVal && this.data.delay) {
                setTimeout(function () {
                    _this.setData({
                        show: false
                    }, function () {
                        _this.triggerEvent('hide', {}, {});
                    });
                }, this.data.delay);
            }
            this.setData({
                show: newVal
            });
        }
    }
});