import { Component, OnInit ,Inject} from '@angular/core';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import * as interaction from 'ol/interaction';
import {Draw, Modify, Select, Snap} from 'ol/interaction.js';
import {Tile as TileLayer, Vector as VectorLayer} from 'ol/layer.js';
import {OSM, Vector as VectorSource} from 'ol/source.js';
import {Circle as CircleStyle, Fill, Stroke, Style} from 'ol/style.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import * as geom from 'ol/geom';
import {MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  VERSION,
  MatSnackBar
} from '@angular/material';
import { ApidataService } from '../service/apidata.service';
// import { feature } from '@turf/turf';
import * as turf from '@turf/turf';
import { BING_KEY, BING_PROJECTION } from '../app.constants';
// import * as tokml from 'tokml';
import BingMaps from 'ol/source/BingMaps.js';

@Component({
  selector: 'app-objectedit',
  templateUrl: './objectedit.component.html',
  styleUrls: ['./objectedit.component.css']
})
export class ObjecteditComponent implements OnInit {
public obDescription:any;
public featureSource:any;
map: any;
objectId:number;
obname:string;
objectsize:number;

aerialWithLabels =  new BingMaps({
  projection: BING_PROJECTION,
  key: BING_KEY,
  imagerySet: 'AerialWithLabels'
});
roadOnDemand = new BingMaps({
  projection: BING_PROJECTION,
  key: BING_KEY,
  imagerySet: 'RoadOnDemand'
});

openStreetMap =  new OSM();

currentlayer:string = "Aerial";
layers = ["Aerial","Road","OpenStreetMap"];

bingMapLayer = new TileLayer({
  source:this.aerialWithLabels
});


  constructor( private  dialogRef: MatDialogRef<ObjecteditComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any,
    private apiService:ApidataService,public snackBar: MatSnackBar) { 
      this.getDetails(data.objectID);
  }

  ngOnInit() {
    
  }
  layerChanged(currentlayer){
    if(currentlayer==="Aerial"){
      this.bingMapLayer.setSource(this.aerialWithLabels);
    }else if (currentlayer==="Road"){
      this.bingMapLayer.setSource(this.roadOnDemand);
    } else if (currentlayer==="OpenStreetMap"){
      this.bingMapLayer.setSource(this.openStreetMap);
    } else {
      this.bingMapLayer.setSource(this.aerialWithLabels);
    }
  }
  saveObject(id){
  let featureStr = this.featureSource[0].getGeometry().getCoordinates();

  
  let convertedGeo = new geom['Polygon'](featureStr).transform('EPSG:3857', 'EPSG:4326');
  let obCor = convertedGeo.getCoordinates();

  var polygon = turf.polygon(obCor);
  var area = turf.area(polygon);
  this.objectsize = Number(area) * 0.0000010;

  let objectDetails ={
    "type": "Feature",
    "properties": {},
    "geometry": {
        "type": "Polygon",
        "coordinates": obCor
    
    }
};
// if(this.objectsize < 1001){
  this.apiService.updateObject(id,objectDetails).subscribe((data) => {
    this.snackBar.open(data.message, 'OK', {
      duration: 3000
    });
        // console.log(data);
  });

// } else {
//  this.snackBar.open("Your object will not save. It is larger the 1001 KM (square) |EDITED SIZE :"+this.objectsize+"KM (square)", 'OK', {
//       duration: 5000
//     });
// }
  

  }

  getDetails(objectID:number){
    this.apiService.getObject(objectID).subscribe(data => {
      this.obDescription = data.data;
      this.obname = this.obDescription.name;
      this.objectId = objectID;
      this.editMap(this.obDescription.geo_location);
     });

  }
editMap(newfeature){
  let styles = [
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

  var source = new VectorSource({
    features: (new GeoJSON()).readFeatures(geojsonObject, {
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:3857'
    })
  });


  var vector_layer = new VectorLayer({
    source: source,
    style: styles
  });

  var select = new interaction.Select({
    wrapX: false
  });

  var modify = new interaction.Modify({
    features: select.getFeatures()

  });


  // Create a map
  this.map = new Map({
    interactions: interaction.defaults().extend([select, modify]),
    target: 'edit-map',
    layers: [
      this.bingMapLayer,
      vector_layer
    ],
    view: new View({
      zoom: 2,
      center: [0, 0]
    })
  });

 this.getFocused(vector_layer);
  var format = new GeoJSON();
  this.featureSource = vector_layer.getSource().getFeatures();
}

 // focused map where is all objets are
 getFocused(layer: any) {
  var extent = layer.getSource().getExtent();
  this.map.getView().fit(extent, { size: this.map.getSize(), maxZoom: 16 })
}


}
