import { Component, OnInit } from '@angular/core';
import Map from 'ol/Map';
import OSM from 'ol/source/OSM';
import TileLayer from 'ol/layer/Tile';
import LayerGroup from 'ol/layer/Group';
import XYZ from 'ol/source/XYZ';
import View from 'ol/View';
import LayerSwitcher from 'ol-layerswitcher';
import { BaseLayerOptions, GroupLayerOptions } from 'ol-layerswitcher';
import ScaleLine from 'ol/control/ScaleLine';
import ImageLayer from 'ol/layer/Image';
import ImageWMS from 'ol/source/ImageWMS';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import Style from 'ol/style/Style';
import { Stroke, Fill } from 'ol/style';

import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements OnInit {
  public map!: Map;
  public vectorLayers: Array<{ layer: VectorLayer<VectorSource>, title: string, layerName:string }> = [];
  public rasterLayers: Array<{ layer: ImageLayer<ImageWMS>, title: string, layerName: string }> = [];
  public personalVectorLayers: Array<{ layer: VectorLayer<VectorSource>, title: string, layerName: string }> = [];
  public personalRasterLayers: Array<{ layer: ImageLayer<ImageWMS>, title: string, layerName: string }> = []; 
  public showMousePosition: boolean = false;
  public showLayers: boolean = true;
  public showCharts: boolean = true;
  public showDataTable: boolean = true;
  public combinedVectors: Array<{ layer: VectorLayer<VectorSource>, title: string, layerName: string }> = [];
  attributeData: any[] = [];
  geojsonLayer: VectorLayer<VectorSource> | undefined;

  constructor(private http: HttpClient) { }

  ngOnInit(): void {
    this.initilizeMap();
    this.loadGeoServerLayers();
    this.loadRasterLayers();
    this.loadPesonalVectorLayers();
  }

  initilizeMap() {
    const mapView = new View({
      center: [716457, 454484],
      zoom: 1,
      //projection:'EPSG:4326'
    });

    const standard = new TileLayer({
      title: 'OSMStandard',
      type: 'base',
      visible: true,
      source: new OSM()
    } as BaseLayerOptions);

    const arcGIS = new TileLayer({
      source: new XYZ({
        url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
        crossOrigin: "Anonymous"
      }),
      type: 'base',
      visible: false,
      title: 'ArcGIS Map'
    } as BaseLayerOptions);

    const googleMap = new TileLayer({
      source: new XYZ({
        url: 'http://mt0.google.com/vt/lyrs=m&hl=en&x={x}&y={y}&z={z}',
        crossOrigin: "Anonymous"
      }),
      type: 'base',
      visible: false,
      title: 'googleMap'
    } as BaseLayerOptions);

    const baseMaps = new LayerGroup({
      title: 'Базовый слой',
      layers: [standard, arcGIS, googleMap]
    } as GroupLayerOptions);

    this.map = new Map({
      target: 'map',
      layers: [baseMaps],
      view: mapView
    });

    const layerSwitcher = new LayerSwitcher({
      activationMode: 'click',
      startActive: false,
      tipLabel: 'Слои',
      groupSelectStyle: 'children',
      collapseTipLabel: 'Скрыть'
    });

    this.map.addControl(layerSwitcher);
    this.scaleMap(this.map);
  }

  loadGeoServerLayers() {
    const url = 'http://localhost:8080/geoserver/topp/wfs?request=getCapabilities';

    this.http.get(url, { responseType: 'text' }).subscribe(response => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(response, 'application/xml');

      const featureTypes = xml.getElementsByTagName('FeatureType');
      Array.from(featureTypes).forEach((featureType: any) => {
        const nameElement = featureType.getElementsByTagName('Name')[0];
        const titleElement = featureType.getElementsByTagName('Title')[0];
        console.log(featureType)
        if (nameElement && titleElement) {
          const layerName = nameElement.textContent;
          const titleName = titleElement.textContent;

          const newLayer = new VectorLayer({
            source: new VectorSource({
              url: `http://localhost:8080/geoserver/topp/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layerName}&maxFeatures=50&outputFormat=application/json`,
              format: new GeoJSON(),
              attributions: '@geoserver'
            }),
            style: new Style({
              fill: new Fill({
                color: 'rgba(0, 0, 255, 0.5)'
              }),
              stroke: new Stroke({
                color: '#319FD3',
                width: 1
              })
            }),
            visible: true
          });
          this.map.addLayer(newLayer);
          this.vectorLayers.push({ layer: newLayer, title: titleName, layerName: layerName });
        }
      });
      this.combinedVectors = [...this.vectorLayers, ...this.personalVectorLayers];
    });
  }

  loadPesonalVectorLayers() {
    const url = 'http://localhost:8080/geoserver/sf/wfs?request=getCapabilities';

    this.http.get(url, { responseType: 'text' }).subscribe(response => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(response, 'application/xml');

      const featureTypes = xml.getElementsByTagName('FeatureType');
      Array.from(featureTypes).forEach((featureType: any) => {
        const nameElement = featureType.getElementsByTagName('Name')[0];
        const titleElement = featureType.getElementsByTagName('Title')[0];

        if (nameElement && titleElement) {
          const layerName = nameElement.textContent;
          const titleName = titleElement.textContent;

          const newLayer = new VectorLayer({
            source: new VectorSource({
              url: `http://localhost:8080/geoserver/sf/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${layerName}&maxFeatures=50&outputFormat=application/json`,
              format: new GeoJSON(),
              attributions: '@geoserver'
            }),
            style: new Style({
              fill: new Fill({
                color: 'rgba(0, 0, 255, 0.5)'
              }),
              stroke: new Stroke({
                color: '#319FD3',
                width: 1
              })
            }),
            visible: true
          });

          this.map.addLayer(newLayer);
          this.personalVectorLayers.push({ layer: newLayer, title: titleName, layerName: layerName });
        }
      });
      this.combinedVectors = [...this.vectorLayers, ...this.personalVectorLayers];
    });
  }
  onControlButtonClick() {

  }
  loadRasterLayers() {
    const url = 'http://localhost:8080/geoserver/nurc/wms?request=getCapabilities';

    this.http.get(url, { responseType: 'text' }).subscribe(response => {
      const parser = new DOMParser();
      const xml = parser.parseFromString(response, 'application/xml');

      const layers = xml.getElementsByTagName('Layer');
      Array.from(layers).forEach((layer: any) => {
        const subLayers = layer.getElementsByTagName('Layer');
        Array.from(subLayers).forEach((subLayer: any) => {
          const nameElement = subLayer.getElementsByTagName('Name')[0];
          const titleElement = subLayer.getElementsByTagName('Title')[0];

          if (nameElement && titleElement) {
            const layerName = nameElement.textContent;
            const titleName = titleElement.textContent;

            const rasterLayer = new ImageLayer({
              source: new ImageWMS({
                url: 'http://localhost:8080/geoserver/nurc/wms',
                params: { 'LAYERS': layerName },
                serverType: 'geoserver',
                crossOrigin: 'anonymous'
              }),
              visible: false // По умолчанию слой невидим
            });
            this.map.addLayer(rasterLayer);
            this.rasterLayers.push({ layer: rasterLayer, title: titleName, layerName: layerName });
           
          }
        });
      });
    });
  }

  scaleMap(map: Map) {
    const control = new ScaleLine({
      units: "metric",
      bar: true,
      text: true,
      minWidth: 140,
    });
    map.addControl(control);
  }

  onMouseEnter() {
    this.showMousePosition = true;
  }

  onMouseLeave() {
    this.showMousePosition = false;
  }

  handleData(data: any) {
    this.attributeData = Array.isArray(data) ? data : [];
  }

  onGeojsonLayerCreated(layer: VectorLayer<VectorSource>) {
    this.geojsonLayer = layer; 
  }
}
