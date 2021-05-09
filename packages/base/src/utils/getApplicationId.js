const g = self;
const applicationId = 1000000;

export function getCachedApplicationId() {
  return applicationId;
}

export default function getApplicationId(callback) {
  if (applicationId) {
    return callback(applicationId);
  }
  // g.registration.pushManager.getSubscription().then(function (subscription) {
  //     if (subscription && subscription.applicationId) {
  //         applicationId = subscription.applicationId;
  //         callback(applicationId);
  //     } else {
  //         setTimeout(function () {
  //             getApplicationId(callback);
  //         }, 150);
  //     }
  // }).catch(function (e) {
  //     Object(_gerror__WEBPACK_IMPORTED_MODULE_1__["default"])(e);
  // });
}
