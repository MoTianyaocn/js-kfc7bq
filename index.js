// Import ol stylesheets
import Map from 'ol/Map';
import View from 'ol/View';
import { fromLonLat } from 'ol/proj';
import ResizeObserver from 'resize-observer-polyfill';

// Import may stylesheets
import './style/style.css';
import TDT_LAYERGROUP from './src/tilelayer.js';
import Controlbutton from './src/controlbutton.js';

// Write Javascript code!

const MapElement = document.querySelector('#map');

const map = new Map({
  layers: [TDT_LAYERGROUP],
  target: MapElement,
  view: new View({
    center: fromLonLat([122.19, 30.28]),
    zoom: 12,
    maxZoom: 18.9,
    minZoom: 2,
    Projection: 'EPSG:3857',
    displayProjection: 'EPSG:4326',
  }),
});

const sizeObserver = new ResizeObserver(() => {
  map.updateSize();
});
sizeObserver.observe(MapElement);
//添加测量控件
const controlbutton = new Controlbutton();
map.addControl(controlbutton);
map.renderSync();
export default map;
