/*
 * @Author: kingweicai 
 * @Date: 2019-05-16 16:18:46 
 * @Last Modified by: kingweicai
 * @Last Modified time: 2019-07-09 17:40:57
 */
 const path = require('path');

 const testSuit = {
   name: 'suit74',
   compilerConfig: {
     cmd: ['-d', '-cc', '0', '-msn','-gn', '$gwx'],
     'FILESBASE': path.join(__dirname, './proj'),
     outputDir: path.join(__dirname, './out'),
     'FILES': [
       './index.wxml',
       './index1.wxml',
     ]
   },
   noWcc: true,
   units: [{
     name: './index.wxml',
     renderPath: './index.wxml',
     renderData: function () {
       let env = {};
       let dd = {};
       let global = {};
       return {
         env: env,
         dd: dd,
         global: global
       };
     },
     standardOut: {"tag":"wx-page","children":[{"tag":"wx-view","attr":{"class":"className","hoverClass":"none","hoverStopPropagation":"false"},"children":[{"tag":"wx-view","attr":{},"children":["\n    10000\n  "],"n":[],"raw":{},"generics":{}}],"n":[],"raw":{},"generics":{},"isStatic":true,"rawHash":"999efe7bf24ebef9986dc214d2b44a81333865afd719c88a37479d5259707acd"}]},
   },
   {
    name: './index1.wxml',
    renderPath: './index1.wxml',
    renderData: function () {
      let env = {
        array: [
          {key: 0},
        ]
      };
      let dd = {};
      let global = {};
      return {
        env: env,
        dd: dd,
        global: global
      };
    },
    standardOut: {"tag":"wx-page","children":[{"tag":"virtual","children":[{"tag":"virtual","wxKey":0,"children":[{"tag":"wx-view","attr":{},"children":[{"tag":"virtual","children":[{"tag":"virtual","wxKey":0,"children":[{"tag":"wx-view","attr":{},"children":[{"tag":"virtual","children":[{"tag":"virtual","wxKey":0,"children":[{"tag":"wx-view","attr":{},"children":["\n              111111111111111111111111111111111\n            "],"n":[],"raw":{},"generics":{},"isStatic":true,"rawHash":"56e494fdb3266c1ecd078029b50158821415f34b68fbf6c1b6f64a596c65b671"}]}],"wxXCkey":2}],"n":[],"raw":{},"generics":{},"isStatic":true,"rawHash":"29642edb705c16af740ba0fcbd267e1943776fad18d7880e9ff5c0aba2f6e6b9"}]}],"wxXCkey":2}],"n":[],"raw":{},"generics":{},"isStatic":true,"rawHash":"da1e3ee274dd19547977dac0a8c8aad24edff0a2282f1c8cf38f8e233c25d287"}]}],"wxXCkey":2},{"tag":"virtual","children":[{"tag":"virtual","children":[{"tag":"wx-view","attr":{},"children":[{"tag":"wx-view","attr":{},"children":[{"tag":"virtual","children":[{"tag":"virtual","children":[{"tag":"wx-view","attr":{},"children":[{"tag":"wx-view","attr":{},"children":[{"tag":"virtual","children":[{"tag":"virtual","children":[{"tag":"wx-view","attr":{},"children":[{"tag":"wx-view","attr":{},"children":["121212121212"],"n":[],"raw":{},"generics":{}}],"n":[],"raw":{},"generics":{}}]}],"wxXCkey":2}],"n":[],"raw":{},"generics":{}}],"n":[],"raw":{},"generics":{}}]}],"wxXCkey":2}],"n":[],"raw":{},"generics":{}}],"n":[],"raw":{},"generics":{},"isStatic":true,"rawHash":"e09c141a7f4d29277e8b84ff04c5b9b5506fe48a4ac0f15e928406141035d30a"}]}],"wxXCkey":2},{"tag":"wx-view","attr":{},"children":[{"tag":"wx-scroll-view","attr":{"bindscroll":"","bindscrolltolower":"","bindscrolltoupper":"","class":"","enableBackToTop":"false","lowerThreshold":"50","scrollIntoView":"","scrollLeft":"0","scrollTop":"0","scrollWithAnimation":"false","scrollX":"false","scrollY":"false","upperThreshold":"50"},"children":[{"tag":"wx-live-player","attr":{"autoplay":"false","bindfullscreenchange":"","bindnetstatus":"","bindstatechange":"","class":"","maxCache":"3","minCache":"1","mode":"live","muted":"false","objectFit":"contain","orientation":"vertical","src":""},"children":[],"n":[],"raw":{},"generics":{}}],"n":[],"raw":{},"generics":{}}],"n":[],"raw":{},"generics":{},"isStatic":true,"rawHash":"068f668169acf3d700354c388d9c1c7e28b737b96d6ea2b78f23e65830458b58"}]}
   },]
 };
 
 module.exports = testSuit;