
__webpack_require__.r(__webpack_exports__);
function Ret(retCode, retCodeSub, retMessageSub, zimId, faceRetCode) {
    this.retCode = retCode || 'SYSTEM_ERROR';
    this.retMessageSub = retMessageSub || '';
    this.retCodeSub = retCodeSub || '';
    this.zimId = zimId || '';
    this.faceRetCode = faceRetCode || '';
}
/* harmony default export */ __webpack_exports__["default"] = (function (ap) {
    var callBridge = ap.callBridge;

    var api = {
        faceVerify: {
            d: function d(_opt, cb) {
                var bioInfo = null;
                // 第一步，获取生物识别sdk的metaInfo
                callBridge('zimIdentity', {
                    action: 'getBioInfo'
                }, function (res) {
                    if (res && res.actionResult) {
                        //对bioinfo进行预处理
                        if (typeof res.actionResult === 'string') {
                            try {
                                bioInfo = JSON.parse(res.actionResult);
                            } catch (error) {}
                        } else {
                            bioInfo = res.actionResult;
                        }
                        //bioInfo 非空
                        if (bioInfo) {
                            //第二步，调用可用性查询rpc
                            callBridge('tinyRpc', {
                                type: 'faceVerifyInit',
                                requestData: [{
                                    bizId: _opt.bizId,
                                    bizType: _opt.bizType || '',
                                    sceneCode: 'internal+alipay+certify+miniprogram',
                                    metaInfo: bioInfo,
                                    isRealName: true,
                                    prodFlowName: 'FACEVERIFY_LV2'
                                }],
                                headers: {}
                            }, function (res) {
                                // 可用性通过
                                if (res.retCode === 'OK_SUCCESS') {
                                    // 唤起刷脸sdk
                                    callBridge('zimIdentity', {
                                        verifyId: res.zimId,
                                        verifyType: 'standard'
                                    }, function (faceRet) {
                                        cb(new Ret(res.retCode, res.retCodeSub, res.retMessageSub, res.zimId, faceRet.code));
                                    });
                                } else if (res.retCode === 'NOT_REAL_NAME') {
                                    // 非实名用户返回
                                    cb(new Ret(res.retCode, res.retCodeSub, res.retMessageSub, res.zimId));
                                } else {
                                    // 其他可用性不过的情况
                                    if (res.unusableProds && res.unusableProds.length > 0 && res.unusableProds[0].productUsableResult && res.unusableProds[0].productUsableResult.retCode) {
                                        var r = res.unusableProds[0].productUsableResult;
                                        cb(new Ret(r.retCode, r.retCodeSub, r.retMessageSub));
                                    } else {
                                        cb(new Ret());
                                    }
                                }
                            });
                        } else {
                            cb(new Ret());
                        }
                    } else {
                        cb(new Ret());
                    }
                });
            },

            ns: 'ap'
        }
    };
    return api;
});

