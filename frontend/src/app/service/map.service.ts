import { Injectable } from '@angular/core';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults as defaultControls } from 'ol/control.js';
import GeoJSON from 'ol/format/GeoJSON.js';
// import { Point, Polygon} from 'ol/geom';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { Subscription } from 'rxjs';
import { DataService } from './data.service';
import Overlay from 'ol/Overlay.js';
import { Select } from 'ol/interaction';
import { click } from 'ol/events/condition';
import { log } from 'util';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as GJV from 'geojson-validation';
import * as turf from '@turf/turf';

// import { geometry } from '@turf/turf';
import { ApidataService } from '../service/apidata.service';
import * as geom from 'ol/geom'
import { MatDialog, MatSnackBar } from '@angular/material';
import { WarningdialogComponent } from '../warningdialog/warningdialog.component';
import { FeaturelistService } from '../service/featurelist.service';
import XYZ from 'ol/source/XYZ';
import BingMaps from 'ol/source/BingMaps.js';
import { BING_KEY, BING_PROJECTION } from '../app.constants';
import { LocationService } from './location.service';

@Injectable({
  providedIn: 'root'
})
export class MapService {

  map: Map;
  uploadVectorSource: VectorSource;
  uploadVectorLayer: VectorLayer;
  bingMapsLayer: TileLayer;
  locationName:any;
  aerialWithLabels;
  roadOnDemand;
  constructor(
    private featurelistService: FeaturelistService,
    private locationService:LocationService,
  ) {
  
  }


  public initMap() {
    this.aerialWithLabels =  new BingMaps({
      projection: BING_PROJECTION,
      key: BING_KEY,
      imagerySet: 'AerialWithLabels'
    });

    this.roadOnDemand = new BingMaps({
      projection: BING_PROJECTION,
      key: BING_KEY,
      imagerySet: 'RoadOnDemand'
    });
    this.map = this.createMap();
    return this.map;
  }


  createUploadDataLayer(geoObject: any) {
    // console.log(geoObject);
    this.removeUploadDataLayer();

    var image = new CircleStyle({
      radius: 6,
      fill: new Fill({
        color: '#ffdd59'
      }),
      stroke: new Stroke({ color: '#f53b57', width: 2 })
    });

    var styles = {
      'Point': new Style({
        image: image

      }),
      'LineString': new Style({
        stroke: new Stroke({
          color: '#ef5777',
          width: 3
        })
      }),
      'MultiLineString': new Style({
        display: 'none',
        // stroke: new Stroke({
        //   color: 'green',
        //   width: 1
        // })
      }),
      'MultiPoint': new Style({
        display: 'none',
        // image: image
      }),
      'MultiPolygon': new Style({
        display: 'none',
        // stroke: new Stroke({
        //   color: 'yellow',
        //   width: 1
        // }),
        // fill: new Fill({
        //   color: 'rgba(255, 255, 0, 0.1)'
        // })
      }),
      'Polygon': new Style({
        stroke: new Stroke({
          color: 'rgba(11, 232, 129,1.0)',
          width: 3
        }),
        fill: new Fill({
          color: 'rgba(210, 218, 226,.5)'
        })
      }),
      'GeometryCollection': new Style({      //have to check there for geometry collection
        // display: 'none',
        stroke: new Stroke({
          color: 'magenta',
          width: 2
        }),
        fill: new Fill({
          color: 'magenta'
        }),
        image: new CircleStyle({
          radius: 10,
          fill: null,
          stroke: new Stroke({
            color: 'magenta'
          })
        })
      }),
      'Circle': new Style({
        stroke: new Stroke({
          color: 'red',
          width: 2
        }),
        fill: new Fill({
          color: 'rgba(255,0,0,0.2)'
        })
      })
    };

    var styleFunction = function (feature) {
      return styles[feature.getGeometry().getType()];
    };
    
    // console.log("geoObject",geoObject);

    if (geoObject.features) {
    let tt = geoObject.features[0].geometry.type;
  
    if (tt ==="Point"){
      let hexvalue = this.numberofdigit(Number(geoObject.features[0].geometry.coordinates[0]))> 4 ? true : false;
      this.uploadVectorSource  = this.layerVectorSource(geoObject,hexvalue);
      // console.log(n);
    }else if (tt ==="Polygon"){   
      let hexvalue = this.numberofdigit(Number(geoObject.features[0].geometry.coordinates[0][0][0])) > 4 ? true : false;
      this.uploadVectorSource  = this.layerVectorSource(geoObject,hexvalue);
      // console.log(n);
    } else if (tt ==="LineString"){
      let hexvalue = this.numberofdigit(Number(geoObject.features[0].geometry.coordinates[0][0]))> 4 ? true : false;
      this.uploadVectorSource= this.layerVectorSource(geoObject,hexvalue);
      // console.log(n);
     
    }
  }

    // this.uploadVectorSource = new VectorSource({
    //   features: (new GeoJSON()).readFeatures(geoObject, {
    //     dataProjection: 'EPSG:4326',
    //     featureProjection: 'EPSG:3857'
    //   })
    // });

    this.uploadVectorLayer = new VectorLayer({
      source: this.uploadVectorSource,
      style: styleFunction,
      myKey: 'uploaddatalayer',
    });



    this.map.on('singleclick', (event) => {
      const feature = this.map.forEachFeatureAtPixel(event.pixel, (someFeature, layer) => someFeature,
        {
          layerFilter: function (layer) { return layer.get('myKey') === 'uploaddatalayer'; 
        }
        
        }
      );

      if (feature) {
        
        const pointProperties = feature.getGeometry().getType();
        let featureStr = "none";

        let obType = feature.getGeometry().getType();
        featureStr = feature.getGeometry().getCoordinates();
        let obId = feature.getId();
        // console.log("mapservice",feature.getId());

        let convertedGeo = new geom[obType](featureStr).transform('EPSG:3857', 'EPSG:4326');
        let obCor = convertedGeo.getCoordinates();

        // console.log("SIZE::",this.dataService.getObjectSize(feature));

        // console.log(convertedGeo);
        // console.log("convertedGeo",obCor)
        // let obName = this.getAreaName();
        let locLat;
        let locLong;
        if (obType ==="Point"){
          locLat = obCor[1];
          locLong = obCor[0];
        }else if (obType ==="Polygon"){
          locLat = obCor[0][0][1];
          locLong = obCor[0][0][0];
        } else if (obType ==="LineString"){
          locLat = obCor[0][1];
          locLong = obCor[0][0];
        }
        
        this.locationService.geoCodePoint(locLat,locLong).subscribe(data =>{

          let featureObject = {
            objectId:obId,
            objectName: data.display_name,
            objectType: obType,
            objectLoc: JSON.stringify(obCor)
          }
          this.featurelistService.sendFeature(featureObject);

        });
      
        

        // console.log("# event.coordinate: ", pointProperties);
      }
    });



    this.getFocused(this.uploadVectorLayer);
    this.map.addLayer(this.uploadVectorLayer);
  }

  numberofdigit(num) {
   let number = Math.floor(num);
    return String(number).length;;
  }

layerVectorSource(geoObject, hexavalue){
  if (hexavalue){
    return new VectorSource({
      features: (new GeoJSON()).readFeatures(geoObject, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:4326'
      })
    });
  }
  else {
    return new VectorSource({
      features: (new GeoJSON()).readFeatures(geoObject, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    });

  }
}


  getAreaName(lat:number, long:number){
    this.locationService.geoCodePoint(lat,long).subscribe(res => {
      // console.log(res.name);
      this.locationName = res.name;
    });
    // console.log("this.locationName",this.locationName);
    return this.locationName;
  }



  //remove upload data layer
  removeUploadDataLayer() {
    this.map.removeEventListener('singleclick');
    if (this.uploadVectorSource) {
      this.uploadVectorSource.clear();
    }
    this.map.removeLayer(this.uploadVectorLayer);
  }

  // bing layer  this.aerialWithLabels
  createBingMapLayer(): TileLayer {
    return new TileLayer({
      source:this.aerialWithLabels
    });
  }



  getFocused(layer: any) {
    var extent = layer.getSource().getExtent();
    this.map.getView().fit(extent, { size: this.map.getSize(), maxZoom: 18 })
  }

  getView(): View {
    return new View({
      projection: 'EPSG:3857', //4326  3857
      center: [0, 0],   //long lat
      zoom: 2
    });
  }


  createMap(): Map {
    this.bingMapsLayer = this.createBingMapLayer();

    // this.bingMapsLayer.setSource(this.aerialWithLabels);

    return new Map({
      layers: [
        this.bingMapsLayer 
      
        // this.createUploadDataLayer(),
      ],
      view: this.getView()
    });
  }


updateLayer() {
    if (localStorage.getItem("alldata") != null) {
      let newobject = JSON.parse(localStorage.getItem("alldata"));
      if(newobject){
        this.createUploadDataLayer(newobject);
      }
      
    }
  }

getVectolayerSource(){
  let featureSource = this.uploadVectorLayer.getSource().getFeatures();
  return featureSource;
}


}
