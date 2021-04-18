
__webpack_require__.r(__webpack_exports__);
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! react */ './node_modules/react/index.js');
/* harmony import */ const react__WEBPACK_IMPORTED_MODULE_0___default = /* #__PURE__ */__webpack_require__.n(react__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! create-react-class */ './node_modules/create-react-class/index.js');
/* harmony import */ const create_react_class__WEBPACK_IMPORTED_MODULE_1___default = /* #__PURE__ */__webpack_require__.n(create_react_class__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ const _utils_loadScript__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @/utils/loadScript */ './src/utils/loadScript.tsx');


/**
 * 将 anchorX anchorY 设置转成 offset
 * 容器地图 API 中 anchor : 设置Marker覆盖物的锚点比例。 锚点是定位图标接触地图平面的点。
 *                         图标的左上顶点为（0,0）点，右下点为（1,1）点
 * web 地图 API 中 offset : 位置偏移量，默认值为Pixel(-10,-34)。(0,0)时marker左上角对准position的位置，
 *                         该属性表示将marker移动多少像素之后，可以使锚点对准position
 * Marker 默认图标的宽高为 20px, 34px
 * anchor 默认值为 0.5, 1.0
 * offset 默认值为 -10, -34 即图标下的中间点作为锚点
 */
function anchorToOffset(x, y, w, h) {
  if (x === undefined) {
    x = 0.5;
  }
  if (y === undefined) {
    y = 1.0;
  }
  if (w === undefined) {
    w = 20;
  }
  if (h === undefined) {
    h = 34;
  }
  return {
    x: -w * x,
    y: -h * y,
  };
}
const noop = function noop() {};
const g = self;
function loadAMap(callback) {
  Object(_utils_loadScript__WEBPACK_IMPORTED_MODULE_2__.default)('https://webapi.amap.com/maps?v=1.3&key=f48f7bb209b683d7192bf2efa14c2b91', callback);
}
const Map = create_react_class__WEBPACK_IMPORTED_MODULE_1___default()({
  getDefaultProps: function getDefaultProps() {
    return {
      longitude: 116.39,
      latitude: 39.9,
      scale: 16,
      showLocation: false,
      markers: [],
      polyline: [],
      circles: [],
      controls: [],
      polygon: [],
      includePoints: [],
    };
  },
  componentDidMount: function componentDidMount() {
    const _this = this;

    loadAMap(() => {
      _this.drawMap();
      _this.drawed = true;
    });
  },
  componentDidUpdate: function componentDidUpdate(prevProps) {
    const _this2 = this;

    if (!this.drawed) return; // 如果 map 迟迟未初始化（第一个 drawMap 未执行完），这个时候执行 update 逻辑没有什么意义，且可能报错
    // 不能进行重绘， 会造成闪烁，根据每个 props 执行对应更新
    const { props } = this;
    const { longitude } = props;
    const { latitude } = props;
    const { scale } = props;
    const { markers } = props;
    const { polyline } = props;
    const { polygon } = props;
    const { circles } = props;
    const { controls } = props;
    const { includePoints } = props;
    const { showLocation } = props;

    const { AMap } = g;
    if (!AMap || !AMap.Map) {
      return;
    }
    if (prevProps.longitude !== longitude || prevProps.latitude !== latitude) {
      // change center
      this.map.setCenter([longitude, latitude]);
    }
    if (prevProps.scale !== scale) {
      // change scale
      this.map.setZoom(scale);
    }
    if (prevProps.markers !== markers) {
      // change markers
      (this.markers || []).map((marker) => {
        return marker.setMap(null);
      });
      this.drawMarkers();
    }
    if (prevProps.polyline !== polyline) {
      // change polyline
      (this.polyline || []).map((pl) => {
        return pl.setMap(null);
      });
      this.drawPolyline();
    }
    if (prevProps.polygon !== polygon) {
      // change polygon
      (this.polygon || []).map((pl) => {
        return pl.setMap(null);
      });
      this.drawPolygon();
    }
    if (prevProps.circles !== circles) {
      // change circles
      (this.circles || []).map((circle) => {
        return circle.setMap(null);
      });
      this.drawPolyline();
    }
    if (prevProps.controls !== controls) {
      // change controls
      (this.controls || []).map((control) => {
        return _this2.map.removeControl(control);
      });
      this.drawControls();
    }
    if (prevProps.includePoints !== includePoints) {
      (this.fitMarkers || []).map((marker) => {
        return marker.setMap(null);
      });
      this.drawIncludePoints();
    }
    if (prevProps.showLocation !== showLocation) {
      this.showLocation();
    }
  },
  componentWillUnmount: function componentWillUnmount() {
    const _this3 = this;

    const { controls } = this.props;

    const { AMap } = g;
    if (controls && controls.map) {
      controls.forEach((_, index) => {
        if (_this3[`controlListener${index}`]) {
          AMap.event.removeListener(_this3[`controlListener${index}`]);
        }
      });
    }
    if (this.map) {
      this.map = null;
    }
  },
  getHexAlpha: function getHexAlpha(color) {
    // wx: 8位十六进制表示，后两位表示alpha值
    if (color && color.length === 9) {
      const hexColor = color.substring(0, 7);
      const alpha = 1 - (255 - parseInt(color.substring(7, 9), 16)) / 255;
      return {
        hex: hexColor,
        alpha,
      };
    }
    return { hex: '#000000', alpha: 0 };
  },
  getCenterLocation: function getCenterLocation(callback) {
    if (this.map) {
      // getCenterLocation 获取当前地图中心的经纬度
      const center = this.map.getCenter();
      callback({
        longitude: center.lng,
        latitude: center.lat,
      });
    } else {
      callback({
        error: 'not init',
      });
    }
  },
  drawPolyline: function drawPolyline() {
    const _this4 = this;

    const { AMap } = g;
    const { map } = this;
    const { polyline } = this.props;
    this.polyline = [];
    if (polyline && polyline.map) {
      polyline.forEach((item) => {
        const lineArr = item.points.map((point) => {
          return [point.longitude, point.latitude];
        });
        const mapPolyline = new AMap.Polyline({
          path: lineArr,
          strokeColor: _this4.getHexAlpha(item.color).hex,
          strokeOpacity: _this4.getHexAlpha(item.color).alpha,
          strokeWeight: item.width || 5,
          strokeStyle: item.dottedLine ? 'dashed' : 'solid',
        });
        mapPolyline.setMap(map);
        _this4.polyline.push(mapPolyline);
      });
    }
  },
  drawPolygon: function drawPolygon() {
    const _this5 = this;

    const { AMap } = g;
    const { map } = this;
    const { polygon } = this.props;
    this.polygon = [];
    if (polygon && polygon.map) {
      polygon.forEach((item) => {
        const lineArr = item.points.map((point) => {
          return [point.longitude, point.latitude];
        });
        const mapPolygon = new AMap.Polygon({
          path: lineArr,
          strokeColor: _this5.getHexAlpha(item.color).hex,
          strokeOpacity: _this5.getHexAlpha(item.color).alpha,
          strokeWeight: item.width || 5,
          fillColor: _this5.getHexAlpha(item.fillColor).hex,
          fillOpacity: _this5.getHexAlpha(item.fillColor).alpha,
        });
        mapPolygon.setMap(map);
        _this5.polygon.push(mapPolygon);
      });
    }
  },
  drawCircles: function drawCircles() {
    const _this6 = this;

    const { AMap } = g;
    const { map } = this;
    const { circles } = this.props;
    this.circles = [];
    if (circles && circles.map) {
      circles.forEach((circle) => {
        // wx 不设置 color 或者 fillColor 那么就透明了
        const mapCircle = new AMap.Circle({
          center: [circle.longitude, circle.latitude],
          radius: circle.radius,
          strokeColor: _this6.getHexAlpha(circle.color).hex,
          strokeOpacity: _this6.getHexAlpha(circle.color).alpha,
          strokeWeight: circle.strokeWidth || 5,
          fillColor: _this6.getHexAlpha(circle.fillColor).hex,
          fillOpacity: _this6.getHexAlpha(circle.fillColor).alpha,
        });
        mapCircle.setMap(map);
        _this6.circles.push(mapCircle);
      });
    }
  },
  drawControls: function drawControls() {
    const _this7 = this;

    const { AMap } = g;
    const { map } = this;
    const _props = this.props;
    const { controls } = _props;
    const { onControlTap } = _props;
    const { $mp } = _props;

    this.controls = [];
    if (controls && controls.map) {
      controls.forEach((control, index) => {
        const content = document.createElement('div');
        if (control.id) {
          content.id = control.id;
        }
        content.innerHTML = `<img src="${location.origin}/${control.iconPath}"\n              style="width: 100%; height: 100%; vertical-align: middle" />`;
        content.style.position = 'absolute';
        content.style.left = `${control.position.left}px`;
        content.style.top = `${control.position.top}px`;
        content.style.width = `${control.position.width}px`;
        content.style.height = `${control.position.height}px`;
        content.style.zIndex = 170;
        if (control.clickable && onControlTap) {
          _this7[`controlListener${index}`] = AMap.event.addDomListener(content, 'click', () => {
            onControlTap($mp.getNormalizedEvent('controlTap', control.id ? {
              controlId: control.id,
            } : {}));
          });
        }
        var customControl = {
          dom: content,
          addTo: function addTo() {
            map.getContainer().appendChild(customControl.dom);
          },
          removeFrom: function removeFrom(map) {
            map.getContainer().removeChild(customControl.dom);
          },
        };
        map.addControl(customControl);
        _this7.controls.push(customControl);
      });
    }
  },
  drawIncludePoints: function drawIncludePoints() {
    const { AMap } = g;
    const { props } = this;
    const { map } = this;
    this.fitMarkers = [];
    const { includePoints } = props;
    if (includePoints && includePoints.map) {
      const fitMarkersArr = includePoints.map((point) => {
        return new AMap.Circle({
          center: [point.longitude, point.latitude],
          map,
          radius: 1,
          strokeColor: 'red',
          strokeOpacity: 0,
          fillColor: 'red',
          fillOpacity: 0,
        });
      });
      if (includePoints.length === 1) {
        const point = includePoints[0];
        map.setCenter([point.longitude, point.latitude]);
      } else {
        map.setFitView(fitMarkersArr);
      }
      this.fitMarkers = fitMarkersArr;
    }
  },
  drawMarkers: function drawMarkers() {
    const _this8 = this;

    const { AMap } = g;
    const { map } = this;
    const _props2 = this.props;
    const { markers } = _props2;
    const _props2$onMarkerTap = _props2.onMarkerTap;
    const onMarkerTap = _props2$onMarkerTap === undefined ? noop : _props2$onMarkerTap;
    const { $mp } = _props2;
    const _props2$onCalloutTap = _props2.onCalloutTap;
    const onCalloutTap = _props2$onCalloutTap === undefined ? noop : _props2$onCalloutTap;
    const { id } = _props2;

    this.markers = [];
    if (markers && markers.map) {
      markers.forEach((item) => {
        const offset = anchorToOffset(item.anchorX, item.anchorY, item.width, item.height);
        const marker = new AMap.Marker({
          position: [item.longitude, item.latitude],
          map,
          content: item.iconPath ? `<img src="${$mp.getNormalizedSrc(item.iconPath)}"\n                width="${item.width}" height="${item.height}" style="opacity: ${item.alpha}" />` : '',
          title: item.title || '',
          angle: item.rotate || 0,
          extData: {
            id: item.id || '',
          },
          offset: new AMap.Pixel(offset.x, offset.y),
        });
        marker.on('click', () => {
          const target = {
            targetDataset: {},
            id,
            tagName: 'map',
            dataset: {},
          };
          onMarkerTap(item.id ? {
            markerId: item.id,
            type: 'markerTap',
            timeStamp: new Date().getTime(),
            target,
            currentTarget: target,
            latitude: item.latitude,
            longitude: item.longitude,
          } : {});
        });
        if (item.callout && item.callout.content) {
          const content = document.createElement('div');
          content.innerHTML = item.title ? `<span style="font-size: 14px;">${item.title}</span><br/>${item.callout.content}` : item.callout.content;
          AMap.event.addDomListener(content, 'click', () => {
            const target = {
              targetDataset: {},
              id,
              tagName: 'map',
              dataset: {},
            };
            onCalloutTap({
              type: 'calloutTap',
              timeStamp: new Date().getTime(),
              target,
              currentTarget: target,
              markerId: item.id,
              latitude: item.latitude,
              longitude: item.longitude,
            });
          });
          const infoWindow = new AMap.InfoWindow({
            content,
          });
          marker.on('click', () => {
            infoWindow.open(map, [item.longitude, item.latitude]);
          });
        }
        _this8.markers.push(marker);
      });
    }
  },

  // 将地图中心移动到当前定位点
  moveToLocation: function moveToLocation() {
    const { map } = this;
    const _props3 = this.props;
    const { longitude } = _props3;
    const { latitude } = _props3;

    if (map) {
      const lnglatXY = [longitude, latitude];
      map.setCenter(lnglatXY);
    }
  },
  gestureEnable: function gestureEnable() {
    // web 无
  },
  showsScale: function showsScale(_ref) {
    const _this9 = this;

    const _ref$data = _ref.data;
    const data = _ref$data === undefined ? {} : _ref$data;

    const { AMap } = g;
    const { map } = this;
    AMap.plugin(['AMap.Scale'], () => {
      if (!_this9.scale) {
        _this9.scale = new AMap.Scale({
          visible: !!data.isShowsScale,
        });
        map.addControl(_this9.scale);
      }
      if (data.isShowsScale) {
        _this9.scale.show();
      } else {
        _this9.scale.hide();
      }
    });
  },
  showsCompass: function showsCompass(_ref2) {
    const _ref2$data = _ref2.data;
    const data = _ref2$data === undefined ? {} : _ref2$data;

    // 是否显示指南针
    // web 无
    if (data.isShowsCompass) {} else {}
  },
  showRoute: function showRoute(_ref3) {
    const _this10 = this;

    const { startLat } = _ref3;
    const { startLng } = _ref3;
    const { endLat } = _ref3;
    const { endLng } = _ref3;
    const _ref3$routeColor = _ref3.routeColor;
    const routeColor = _ref3$routeColor === undefined ? '#6db74d' : _ref3$routeColor;

    const { AMap } = g;
    // 显示路线
    const { map } = this;
    AMap.plugin(['AMap.Walking'], () => {
      if (!_this10.walking) {
        _this10.walking = new AMap.Walking({
          map,
          autoFitView: true,
          outlineColor: routeColor,
        });
      }
      _this10.walking.search([startLng, startLat], [endLng, endLat]);
    });
  },
  clearRoute: function clearRoute() {
    if (this.walking) {
      this.walking.clear();
    }
  },
  showLocation: function showLocation() {
    const { AMap } = g;
    const { map } = this;
    const { props } = this;
    let geolocation;
    if (props.showLocation) {
      AMap.plugin(['AMap.Geolocation'], () => {
        geolocation = new AMap.Geolocation({
          showButton: false,
        });
        map.addControl(geolocation);
      });
    } else if (geolocation) {
      map.removeControl(geolocation);
    }
  },
  drawMap: function drawMap() {
    const { AMap } = g;
    if (!AMap || !AMap.Map) {
      return;
    }
    const { props } = this;
    const { longitude } = props;
    const { latitude } = props;
    const { id } = props;

    const map = new AMap.Map(this.rootMapElement, {
      zoom: props.scale,
      center: [longitude, latitude],
    });
    this.map = map;
    if (props.onTap) {
      map.on('click', (e) => {
        const target = {
          targetDataset: {},
          id,
          tagName: 'map',
          dataset: {},
        };
        props.onTap({
          type: 'tap',
          timeStamp: new Date().getTime(),
          target,
          currentTarget: target,
          latitude: e.lnglat.getLat(),
          longitude: e.lnglat.getLng(),
        });
      });
    }
    if (props.onRegionChange) {
      map.on('dragstart', () => {
        const _map$getCenter = map.getCenter();
        const { lng } = _map$getCenter;
        const { lat } = _map$getCenter;

        props.onRegionChange({
          type: 'begin',
          scale: map.getZoom(),
          latitude: lat,
          longitude: lng,
        });
      });
      map.on('dragend', () => {
        const _map$getCenter2 = map.getCenter();
        const { lng } = _map$getCenter2;
        const { lat } = _map$getCenter2;

        props.onRegionChange({
          type: 'end',
          scale: map.getZoom(),
          latitude: lat,
          longitude: lng,
        });
      });
    }
    // show-location
    this.showLocation();
    // markers 标记点
    this.drawMarkers();
    // polyline
    this.drawPolyline();
    // polygon
    this.drawPolygon();
    // circles
    this.drawCircles();
    // controls
    this.drawControls();
    // include-points 缩放视野以包含所有给定的坐标点 (wx 和 makers 分开的)
    this.drawIncludePoints();
  },
  render: function render() {
    const _this11 = this;

    const { props } = this;
    const { style } = props;
    return react__WEBPACK_IMPORTED_MODULE_0___default.a.createElement('div', { className: props.className,
      ref: function ref(el) {
        _this11.rootMapElement = el;
      },
      style });
  },
});
/* harmony default export */ __webpack_exports__.default = (Map);
