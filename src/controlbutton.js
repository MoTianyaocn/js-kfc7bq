import {
  Circle as CircleStyle,
  Fill,
  RegularShape,
  Stroke,
  Style,
  Text,
} from 'ol/style';
import { Control, FullScreen } from 'ol/control';
import { Draw, Modify } from 'ol/interaction';
import { LineString, Point } from 'ol/geom';
import { Vector as VectorSource } from 'ol/source';
import { Vector as VectorLayer } from 'ol/layer';
import { getArea, getLength } from 'ol/sphere';
import MousePosition from 'ol/control/MousePosition';
import { createStringXY, toStringHDMS } from 'ol/coordinate';
import { GPX, GeoJSON, IGC, KML, TopoJSON } from 'ol/format';
import { DragAndDrop, defaults as defaultInteractions } from 'ol/interaction';

import map from '../index.js';

let mouseposition = document.createElement('div');
let MapElement = document.querySelector('#map');
MapElement.appendChild(mouseposition);
mouseposition.setAttribute('id', 'mouseposition');
mouseposition.style.position = 'absolute';
mouseposition.style.right = '44px';
mouseposition.style.top = '14px';
mouseposition.style.zIndex = 1;
mouseposition.style.margin = 'auto';
mouseposition.style.fontSize = '11px';
mouseposition.style.color = 'RGB(255,255,255)';

const MousePositionControl = new MousePosition({
  coordinateFormat: createStringXY(6),
  //coordinateFormat: toStringHDMS(coord),
  projection: 'EPSG:4326',
  // comment the following two lines to have the mouse position
  // be placed within the map.
  className: 'custom-mouse-position',
  target: mouseposition,
});

const style = new Style({
  fill: new Fill({
    color: 'rgba(255, 255, 255, 0.2)',
  }),
  stroke: new Stroke({
    color: 'rgba(255, 255, 0, 0.5)',
    lineDash: [10, 10],
    width: 2,
  }),
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(255, 255, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(255, 255, 255, 0.2)',
    }),
  }),
});

const labelStyle = new Style({
  text: new Text({
    font: '14px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [3, 3, 3, 3],
    textBaseline: 'bottom',
    offsetY: -15,
  }),
  image: new RegularShape({
    radius: 8,
    points: 3,
    angle: Math.PI,
    displacement: [0, 10],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
  }),
});

const tipStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const modifyStyle = new Style({
  image: new CircleStyle({
    radius: 5,
    stroke: new Stroke({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
  text: new Text({
    text: '拖拽修改',
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.7)',
    }),
    padding: [2, 2, 2, 2],
    textAlign: 'left',
    offsetX: 15,
  }),
});

const segmentStyle = new Style({
  text: new Text({
    font: '12px Calibri,sans-serif',
    fill: new Fill({
      color: 'rgba(255, 255, 255, 1)',
    }),
    backgroundFill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
    padding: [2, 2, 2, 2],
    textBaseline: 'bottom',
    offsetY: -12,
  }),
  image: new RegularShape({
    radius: 6,
    points: 3,
    angle: Math.PI,
    displacement: [0, 8],
    fill: new Fill({
      color: 'rgba(0, 0, 0, 0.4)',
    }),
  }),
});

const segmentStyles = [segmentStyle];
const showSegments = 'checked';

const formatLength = function (line) {
  const length = getLength(line);
  let output;
  if (length > 100) {
    output = Math.round((length / 1000) * 100) / 100 + ' km';
  } else {
    output = Math.round(length * 100) / 100 + ' m';
  }
  return output;
};

const formatArea = function (polygon) {
  const area = getArea(polygon);
  let output;
  if (area > 10000) {
    output = Math.round((area / 1000000) * 100) / 100 + ' km\xB2';
  } else {
    output = Math.round(area * 100) / 100 + ' m\xB2';
  }
  return output;
};

const source = new VectorSource();

// source.on('change', function (event) {
//   event.source.getFeatures();
// });

const modify = new Modify({
  source: source,
  style: modifyStyle,
});

let draw; // global so we can remove it later
let tipPoint;

function styleFunction(feature, segments, drawType, tip) {
  const styles = [style];
  const geometry = feature.getGeometry();
  const type = geometry.getType();
  let point, label, line;
  if (!drawType || drawType === type) {
    if (type === 'Polygon') {
      point = geometry.getInteriorPoint();
      label = formatArea(geometry);
      line = new LineString(geometry.getCoordinates()[0]);
    } else if (type === 'LineString') {
      point = new Point(geometry.getLastCoordinate());
      label = formatLength(geometry);
      line = geometry;
    }
  }
  if (segments && line) {
    let count = 0;
    line.forEachSegment(function (a, b) {
      const segment = new LineString([a, b]);
      const label = formatLength(segment);
      if (segmentStyles.length - 1 < count) {
        segmentStyles.push(segmentStyle.clone());
      }
      const segmentPoint = new Point(segment.getCoordinateAt(0.6));
      segmentStyles[count].setGeometry(segmentPoint);
      segmentStyles[count].getText().setText(label);
      styles.push(segmentStyles[count]);
      count++;
    });
  }
  if (label) {
    labelStyle.setGeometry(point);
    labelStyle.getText().setText(label);
    styles.push(labelStyle);
  }
  if (
    tip &&
    type === 'Point' &&
    !modify.getOverlay().getSource().getFeatures().length
  ) {
    tipPoint = geometry;
    tipStyle.getText().setText(tip);
    styles.push(tipStyle);
  }
  return styles;
}

function addInteraction(typeSelect) {
  let drawType = typeSelect;

  if (drawType !== 'None') {
    const activeTip =
      '原处再点完成，新处点击继续 ' +
      (drawType === 'Polygon' ? 'polygon' : 'line');
    const idleTip = '点击开始';
    let tip = idleTip;
    draw = new Draw({
      source: source,
      type: drawType,
      style: function (feature) {
        return styleFunction(feature, showSegments, drawType, tip);
      },
    });
    draw.on('drawstart', function () {
      //source.clear();
      modify.setActive(false);
      tip = activeTip;
    });
    draw.on('drawend', function () {
      modifyStyle.setGeometry(tipPoint);
      modify.setActive(true);
      map.once('pointermove', function () {
        modifyStyle.setGeometry();
      });
      tip = idleTip;
      map.removeInteraction(draw);
    });
  }
  modify.setActive(true);
  map.addInteraction(draw);
}

class Controlbutton extends Control {
  constructor(opt_options) {
    const options = opt_options || {};

    let element = document.createElement('div');

    super({
      element: element,
      target: options.target,
    });

    let FullDisplay = document.createElement('button');
    FullDisplay.innerHTML = '✠';
    FullDisplay.title = '全屏显示';
    FullDisplay.setAttribute('id', 'FullDisplay');
    FullDisplay.setActive = true;
    FullDisplay.addEventListener(
      'click',
      this.handleFullDisplay.bind(this, FullDisplay),
      false
    );

    let MouseDisplay = document.createElement('button');
    MouseDisplay.innerHTML = '⚓';
    MouseDisplay.title = '显示坐标';
    MouseDisplay.setAttribute('id', 'MouseDisplay');
    MouseDisplay.setActive = true;
    MouseDisplay.addEventListener(
      'click',
      this.handleMouse.bind(this, MouseDisplay),
      false
    );

    let DragBtn = document.createElement('button');
    DragBtn.innerHTML = '💍';
    DragBtn.title = '拖入数据';
    DragBtn.setAttribute('id', 'DragBtn');
    DragBtn.setActive = true;
    DragBtn.addEventListener(
      'click',
      this.handleDragBtn.bind(this, DragBtn),
      false
    );

    let WriteFBtn = document.createElement('button');
    WriteFBtn.innerHTML = '⇓';
    WriteFBtn.title = '下载数据';
    WriteFBtn.setAttribute('id', 'writeFBtn');
    WriteFBtn.setActive = true;
    WriteFBtn.addEventListener(
      'click',
      this.handlewriteFBtn.bind(this, WriteFBtn),
      false
    );

    let Linestring = document.createElement('button');
    Linestring.style.position = 'absolute';
    Linestring.style.top = '105px';
    Linestring.innerHTML = '📏';
    Linestring.title = '量线距离';
    Linestring.setAttribute('id', 'LineString');
    Linestring.setActive = true;
    Linestring.addEventListener(
      'click',
      this.handleMeasures.bind(this, Linestring),
      false
    );

    let Polygon = document.createElement('button');
    Polygon.style.position = 'absolute';
    Polygon.style.top = '128px';
    Polygon.innerHTML = '㎢';
    Polygon.title = '测量面积';
    Polygon.setAttribute('id', 'Polygon');
    Polygon.setActive = true;
    Polygon.addEventListener(
      'click',
      this.handleMeasures.bind(this, Polygon),
      false
    );

    element.className = 'LineAndPolygon ol-unselectable ol-control';
    element.appendChild(FullDisplay);
    element.appendChild(MouseDisplay);
    element.appendChild(DragBtn);
    element.appendChild(WriteFBtn);

    element.appendChild(Linestring);
    element.appendChild(Polygon);

    element.style.top = '4em';
    element.style.left = '0.5em';
  }

  //全屏按钮监听函数
  handleFullDisplay(FullDisplay, event) {
    event.preventDefault();
    let fullScreen = new FullScreen();
    if (FullDisplay.setActive === true) {
      map.addControl(fullScreen);
      FullDisplay.style.backgroundColor = 'yellow';
      FullDisplay.setActive = false;
    } else {
      map.removeControl(fullScreen);
      FullDisplay.setActive = true;
      FullDisplay.style.backgroundColor = null;
    }
  }

  //鼠标坐标显示按钮监听函数
  handleMouse(MouseDisplay, event) {
    event.preventDefault();
    if (MouseDisplay.setActive === true) {
      map.addControl(MousePositionControl);
      MouseDisplay.setActive = false;
      MouseDisplay.style.backgroundColor = 'yellow';
    } else {
      map.removeControl(MousePositionControl);
      MapElement = null;
      mouseposition = null;
      MouseDisplay.setActive = true;
      MouseDisplay.style.backgroundColor = null;
    }
  }

  //拖修按钮监听函数
  handleDragBtn(DragBtn, event) {
    event.preventDefault();
    //console.log();
    let layer = new VectorLayer({
      source: source,
    });
    let Drag = new DragAndDrop({
      formatConstructors: [GPX, GeoJSON, IGC, KML, TopoJSON],
      source: source,
    });
    map.addLayer(layer);
    if (DragBtn.setActive === true) {
      DragBtn.setActive = false;
      DragBtn.style.backgroundColor = 'yellow';
      map.addInteraction(Drag);
      map.addInteraction(modify);
    } else {
      map.removeInteraction(modify);
      map.removeInteraction(Drag);
      source.clear();
      DragBtn.setActive = true;
      DragBtn.style.backgroundColor = null;
    }
  }

  //下载按钮监听函数
  handlewriteFBtn(writeFBtn, event) {
    event.preventDefault();

    if (writeFBtn.setActive === true) {
      writeFBtn.setActive = false;
      writeFBtn.style.backgroundColor = 'yellow';
      let format = new GeoJSON({ featureProjection: 'EPSG:3857' });
      let features = source.getFeatures();
      //console.log(features);
      let json = format.writeFeatures(features);
      console.log(json);
      writeFBtn.href =
        'data:application/json;charset=utf-8,' + encodeURIComponent(json);
    } else {
      writeFBtn.style.backgroundColor = null;
      writeFBtn.setActive = true;
    }
  }

  //测量按钮监听函数
  handleMeasures(darwtype, event) {
    event.preventDefault();
    let line = 'LineString';
    let Polygon = 'Polygon';
    let dPolygon = document.getElementById('Polygon');
    let dLineString = document.getElementById('LineString');

    if (darwtype.setActive === true) {
      this.MeasuresDraw_(darwtype.id);

      if (darwtype.id === line) {
        darwtype.style.backgroundColor = 'yellow';
        dPolygon.style.backgroundColor = null;
        dPolygon.setActive = false;
      }
      if (darwtype.id === Polygon) {
        darwtype.style.backgroundColor = 'yellow';
        dLineString.style.backgroundColor = null;
        dLineString.setActive = false;
      }
      darwtype.setActive = false;
    } else {
      source.clear();
      map.removeInteraction(draw);
      map.removeInteraction(modify);
      //map.removeLayer(map.getLayers());
      draw = null;
      tipPoint = null;

      darwtype.setActive = true;
      darwtype.style.backgroundColor = null;
      if (darwtype.id === line) {
        dPolygon.style.backgroundColor = null;
        dPolygon.setActive = true;
      }
      if (darwtype.id === Polygon) {
        dLineString.style.backgroundColor = null;
        dLineString.setActive = true;
      }
    }
  }

  MeasuresDraw_(typeSelect) {
    const vector = new VectorLayer({
      source: source,
      style: function (feature) {
        return styleFunction(feature, showSegments);
      },
    });
    map.addLayer(vector);
    map.addInteraction(modify);
    addInteraction(typeSelect);
  }
}

export default Controlbutton;
