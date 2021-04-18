import React from 'react';
import createReactClass from 'create-react-class';

import { isAndroid } from '@/utils/system';
import addEvents from '@/utils/addEvents';
import callBridge from '@/utils/callBridge';

let id = 0;
const cacheMapId = {};
const Map = createReactClass({
  displayName: 'Map',
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
      groundOverlays: [],
    };
  },
  componentDidMount: function componentDidMount() {
    // android bug
    if (isAndroid && !cacheMapId[this.getId()]) {
      this.readyForRender = false;
      this.detachMapReady = addEvents(document, {
        'nbcomponent.canrender': this.onNativeReady,
      });
    } else {
      this.readyForRender = true;
      this.renderMap();
    }
    this.detachEvents = addEvents(document, {
      'nbcomponent.map.bindmarkertap': this.onMarkerTap,
      'nbcomponent.map.bindcontroltap': this.onControlTap,
      'nbcomponent.map.bindregionchange': this.onRegionChange,
      'nbcomponent.map.bindtap': this.onTap,
      'nbcomponent.map.bindcallouttap': this.onCalloutTap,
    });
  },
  componentDidUpdate: function componentDidUpdate() {
    this.renderMap();
  },
  componentWillUnmount: function componentWillUnmount() {
    if (this.detachMapReady) {
      this.detachMapReady.remove();
    }
    // 不能监听 back destroy，手势事件没有 back!
    callBridge('NBComponent.remove', {
      element: this.getId(),
    });
    this.detachEvents.remove();
  },
  getId: function getId() {
    if (this.id) {
      return this.id;
    }
    this.id = this.props.id || `mp_map_${++id}`;
    return this.id;
  },
  onNativeReady: function onNativeReady(e) {
    if (!e || e.elementid === this.getId()) {
      this.readyForRender = true;
      cacheMapId[this.getId()] = true;
      this.renderMap();
    }
  },
  onMarkerTap({ data }) {
    const { element, markerId, latitude, longitude } = data;

    // android bug: no element
    if (this.props.onMarkerTap && (element === this.getId() || !element)) {
      this.props.onMarkerTap(this.props.$mp.getNormalizedEvent('markerTap', {
        latitude,
        longitude,
        markerId,
      }));
    }
  },
  onControlTap: function onControlTap({ data }) {
    const { element, controlId } = data;

    if (this.props.onControlTap && (element === this.getId() || !element)) {
      this.props.onControlTap(this.props.$mp.getNormalizedEvent('controlTap', {
        controlId,
      }));
    }
  },
  onRegionChange: function onRegionChange({ data }) {
    const { element, regionChangedType, latitude, longitude, scale } = data;

    if (element === this.getId() || !element) {
      if (this.props.onRegionChange) {
        this.props.onRegionChange(this.props.$mp.getNormalizedEvent('regionChange', {
          type: regionChangedType,
          latitude,
          longitude,
          scale,
        }));
      }
    }
  },
  onTap: function onTap({ data }) {
    const { element, latitude, longitude } = data;

    if (this.props.onTap && (element === this.getId() || !element)) {
      this.props.onTap(this.props.$mp.getNormalizedEvent('tap', {
        latitude,
        longitude,
      }));
    }
  },
  onCalloutTap: function onCalloutTap({ data }) {
    const { element, markerId, latitude, longitude } = data;

    if (this.props.onCalloutTap && (element === this.getId() || !element)) {
      this.props.onCalloutTap(this.props.$mp.getNormalizedEvent('calloutTap', {
        markerId,
        latitude,
        longitude,
      }));
    }
  },
  clearRenderDelay: function clearRenderDelay() {
    if (this.detachMapReady) {
      this.detachMapReady.remove();
      this.detachMapReady = null;
    }
  },
  renderMap: function renderMap() {
    if (!this.readyForRender) {
      return;
    }
    this.clearRenderDelay();
    const { props } = this;

    callBridge('NBComponent.render', {
      element: this.getId(),
      data: {
        longitude: props.longitude,
        latitude: props.latitude,
        scale: props.scale,
        markers: props.markers,
        polyline: props.polyline,
        circles: props.circles,
        controls: props.controls,
        polygon: props.polygon,
        'show-location': props.showLocation,
        'include-points': props.includePoints,
        'include-padding': props.includePadding,
        'ground-overlays': props.groundOverlays,
        'tile-overlay': props.tileOverlay,
        setting: props.setting,
      },
    });
  },
  render: function render() {
    const { props } = this;

    return React.createElement(
      'object',
      {
        className: `${props.className} nbcomponentanimation-${this.getId()}`,
        style: props.style,
        id: props.id,
        type: 'application/view',
        role: 'application',
      },
      React.createElement('param', { name: 'type', value: 'map' }),
      React.createElement('param', { name: 'id', value: this.getId() }),
    );
  },
});

export default Map;
