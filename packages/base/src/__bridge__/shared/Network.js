
export const getNetworkType = {
  a: function a(res) {
    if (res.networkInfo) {
      res.networkType = res.networkInfo.toUpperCase();
    }
  },
};
