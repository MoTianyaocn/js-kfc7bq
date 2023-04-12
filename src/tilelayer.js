import TileLayer from 'ol/layer/Tile';
import LayerGroup from 'ol/layer/Group';
import XYZ from 'ol/source/XYZ';

const key = 'c7675cfa2352641e3742dbf089cda5e0';
const TDT_LAYERGROUP = new LayerGroup({
  layers: [
    new TileLayer({
      source: new XYZ({
        url:
          'http://t{0-7}.tianditu.gov.cn/img_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=img&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
          key,
        tileSize: 256,
      }),
    }), //天地图-影像图层
    new TileLayer({
      source: new XYZ({
        url:
          'http://t{0-7}.tianditu.gov.cn/cva_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cva&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
          key,
        tileSize: 256,
      }),
    }), //天地图-矢量图层
    new TileLayer({
      source: new XYZ({
        url:
          'http://t{0-7}.tianditu.gov.cn/cta_w/wmts?SERVICE=WMTS&REQUEST=GetTile&VERSION=1.0.0&LAYER=cta&STYLE=default&TILEMATRIXSET=w&FORMAT=tiles&TILEMATRIX={z}&TILEROW={y}&TILECOL={x}&tk=' +
          key,
        tileSize: 256,
      }),
    }), //天地图-标记图层
  ],
});

export default TDT_LAYERGROUP;
