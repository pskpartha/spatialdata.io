import { Component, OnInit, Inject } from '@angular/core';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import * as interaction from 'ol/interaction';
import { Draw, Modify, Select, Snap } from 'ol/interaction.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import { MatSliderChange } from '@angular/material';
// import * as shpwrite from 'shp-write';
// import shpwrite from 'shp-write';
import * as geom from 'ol/geom';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatSnackBar
} from '@angular/material';
import { DataService } from '../service/data.service';
import { ApidataService } from '../service/apidata.service';
import { BING_KEY, BING_PROJECTION } from '../app.constants';
import BingMaps from 'ol/source/BingMaps.js';
import { DownloadService } from '../service/download.service';
import { MapService } from '../service/map.service';

@Component({
  selector: 'app-editfeature',
  templateUrl: './editfeature.component.html',
  styleUrls: ['./editfeature.component.css']
})
export class EditfeatureComponent implements OnInit {
  aerialWithLabels = new BingMaps({
    projection: BING_PROJECTION,
    key: BING_KEY,
    imagerySet: 'AerialWithLabels'
  });
  roadOnDemand = new BingMaps({
    projection: BING_PROJECTION,
    key: BING_KEY,
    imagerySet: 'RoadOnDemand'
  });

  openStreetMap = new OSM();

  currentlayer: string = "Aerial";
  layers = ["Aerial", "Road", "OpenStreetMap"];

  bingMapLayer = new TileLayer({
    source: this.aerialWithLabels
  });
  // mat slider config

  autoTicks = false;
  disabled = false;
  invert = false;
  max;
  min;
  showTicks = false;
  step = 1;
  thumbLabel = true;
  value;
  vertical = false;

  // 
  geometry:any;
  uploadVectorSource: any;
  uploadVectorLayer: any;
  map: any;

  select: interaction.Select;
  modify: interaction.Modify;

  public featureSource: any;
  public geodata: any;
  currentObjectSize;
  geodataareaname: string;
  areaname: string;
  originalData: any;
  cobjectsize:string = "";
  constructor(private dialogRef: MatDialogRef<EditfeatureComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    public snackBar: MatSnackBar,
    public dataService: DataService,
    public apiService: ApidataService,
    public downloadService: DownloadService,
    public mapService:MapService
  ) {
    this.geodata = data.feature;
    this.areaname = data.areaname;
    this.originalData = data.originalData;
  }

  onSliderChange(event: MatSliderChange) {
    let newConvertedData = this.dataService.convertToPolyGon(this.originalData, Number(event.value));
    let geojsonObject = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:3857'
        }
      },
      'features': [newConvertedData]
    };

    let newuploadVectorSource = new VectorSource({
      features: (new GeoJSON()).readFeatures(geojsonObject, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    });
    this.uploadVectorSource.clear();
    this.uploadVectorLayer.setSource(newuploadVectorSource);
    this.cobjectsize = this.getCurrentObjectSize();
  }

  ngOnInit() {
    
    setTimeout(() => {
      if (this.originalData.geometry.type === "Point") {
        this.max = 1000;
        this.min = 100;
        this.value = 200;
      } else if (this.originalData.geometry.type === "LineString") {
        // console.log(this.originalData.geometry.type);
        this.max = 100;
        this.min = 10;
        this.value = 25;
      } else {
        this.max = 100;
        this.min = 10;
        this.value = 25;
      }
      this.editMap(this.geodata);
      this.cobjectsize = this.getCurrentObjectSize();

    }, 50);
    
  }

  layerChanged(currentlayer) {
    if (currentlayer === "Aerial") {
      this.bingMapLayer.setSource(this.aerialWithLabels);
    } else if (currentlayer === "Road") {
      this.bingMapLayer.setSource(this.roadOnDemand);
    } else if (currentlayer === "OpenStreetMap") {
      this.bingMapLayer.setSource(this.openStreetMap);
    } else {
      this.bingMapLayer.setSource(this.aerialWithLabels);
    }
  }

  editMap(newfeature) {

    let styles = [
      /* We are using two different styles for the polygons:
       *  - The first style is for the polygons themselves.
       *  - The second style is to draw the vertices of the polygons.
       *    In a custom `geometry` function the vertices of a polygon are
       *    returned as `MultiPoint` geometry, which will be used to render
       *    the style.
       */
      new Style({
        stroke: new Stroke({
          color: 'rgba(245, 59, 87,1.0)',
          width: 3
        }),
        fill: new Fill({
          color: 'rgba(255, 221, 89,0.5)'
        })
      }),
    ];

    var geojsonObject = {
      'type': 'FeatureCollection',
      'crs': {
        'type': 'name',
        'properties': {
          'name': 'EPSG:3857'
        }
      },
      'features': [newfeature]
    };

    this.uploadVectorSource = new VectorSource({
      features: (new GeoJSON()).readFeatures(geojsonObject, {
        dataProjection: 'EPSG:4326',
        featureProjection: 'EPSG:3857'
      })
    });

    this.uploadVectorLayer = new VectorLayer({
      source: this.uploadVectorSource,
      style: styles,
      myKey: 'editdatalayer',
    });


    this.select = new interaction.Select({
      wrapX: false,
    });

    this.modify = new interaction.Modify({
      features: this.select.getFeatures()
    });



    // Create a map

    this.map = new Map({
      interactions: interaction.defaults().extend([this.select, this.modify]),
      target: 'feat-edit-map',
      layers: [
        this.bingMapLayer,
        this.uploadVectorLayer
      ],
      view: new View({
        zoom: 2,
        center: [0, 0]
      })
    });

    this.getFocused(this.uploadVectorLayer);
    var format = new GeoJSON();

    // this.featureSource = this.uploadVectorLayer.getSource().getFeatures();


    this.modify.on('modifyend', (event) => {
      this.disabled = true;
      // this.featureSource = this.uploadVectorLayer.getSource().getFeatures();
      // let featureStr = this.uploadVectorLayer.getSource();
      // let features = featureStr.getFeatures();
      // this.currentObjectSize = this.dataService.getObjectSize(features);
      // console.log(this.currentObjectSize);
      this.cobjectsize = this.getCurrentObjectSize();
    });
  }


getCurrentObjectSize(){
  let featureStr = this.uploadVectorLayer.getSource();
  let features = featureStr.getFeatures();
  this.currentObjectSize = this.dataService.getObjectSize(features);
  return this.currentObjectSize;
}

  // focused map where is all objets are
  getFocused(layer: any) {
    var extent = layer.getSource().getExtent();
    this.map.getView().fit(extent, { size: this.map.getSize(), maxZoom: 16 })
  }



  saveObject(name) {
    this.featureSource = this.uploadVectorLayer.getSource().getFeatures();
    let featType = this.featureSource[0].getGeometry().getType();
    let featCor = this.featureSource[0].getGeometry().getCoordinates();
    var convertedGeo = new geom[featType](featCor).transform('EPSG:3857', 'EPSG:4326');
    let obCor = convertedGeo.getCoordinates();

    let feat = {
      "type": "Feature",
      "properties": {
        "name": this.areaname
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": obCor
      }
    }
    var obj = {
      name: this.areaname,
      geo_location: feat,
      description: "No this time as well"
    };
    this.apiService.addObject(obj).subscribe(
      data => {
        if (data.status === "success") {
          // this.showSuccessMsg = true;
          this.snackBar.open("Your object saved successfully ! Check form OBJECT LIST option.", 'OK', {
            duration: 5000
          });
        }
      }
    );
  }
  downloadData(format: string) {
    this.featureSource = this.uploadVectorLayer.getSource().getFeatures();
    let featType = this.featureSource[0].getGeometry().getType();
    let featCor = this.featureSource[0].getGeometry().getCoordinates();
    var convertedGeo = new geom[featType](featCor).transform('EPSG:3857', 'EPSG:4326');
    let obCor = convertedGeo.getCoordinates();

    let feat = {
      "type": "Feature",
      "properties": {
        "name": this.areaname
      },
      "geometry": {
        "type": "Polygon",
        "coordinates": obCor
      }
    }
    let featureCollection = {
      "type": "FeatureCollection",
      "features": [feat]
    }
    if (format === 'geojson') {
      this.downloadService.downloadDataGEOJSON(featureCollection);
    } else if (format === 'kml') {
      this.downloadService.downloadDataKML(featureCollection);
    }

  }

  updateFeatureinfo(data:any){
    if (localStorage.getItem("alldata") != null) {
      let localArray = JSON.parse(localStorage.getItem("alldata"));

      let newArray:any = this.dataService.arrayAfterRemove(localArray.features, data);
    
      this.featureSource = this.uploadVectorLayer.getSource().getFeatures();
      let featType = this.featureSource[0].getGeometry().getType();
      let featCor = this.featureSource[0].getGeometry().getCoordinates();
      var convertedGeo = new geom[featType](featCor).transform('EPSG:3857', 'EPSG:4326');
      let obCor = convertedGeo.getCoordinates();
  
      let feat = {
        "id":this.dataService.getAfeatureID(),
        "type": "Feature",
        "properties": {
          "name": this.areaname
        },
        "geometry": {
          "type": "Polygon",
          "coordinates": obCor
        }
      }

      // console.log(feat);
      newArray.push(feat);

      let newobject = {
        "type": "FeatureCollection",
        // "crs": { "type": "name", "properties": { "name": "EPSG:3857" } },
        "features": newArray
      }  
      localStorage.setItem("alldata", JSON.stringify(newobject));


        setTimeout(() => {
          this.mapService.updateLayer();
        }, 200);
        
    }
    
  }
  

 
 


}
