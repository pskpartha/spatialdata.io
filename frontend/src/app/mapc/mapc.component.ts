import { Component, OnInit, OnDestroy } from '@angular/core';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import { defaults as defaultControls } from 'ol/control.js';
import GeoJSON from 'ol/format/GeoJSON.js';
// import { Point, Polygon} from 'ol/geom';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { Circle as CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import { Subscription } from 'rxjs';
import { DataService } from '../service/data.service';
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
import { MapService } from '../service/map.service';
import { BING_KEY, BING_PROJECTION } from '../app.constants';

import BingMaps from 'ol/source/BingMaps.js';
import { DownloadService } from '../service/download.service';

@Component({
  selector: 'app-mapc',
  templateUrl: './mapc.component.html',
  styleUrls: ['./mapc.component.css']
})


export class MapcComponent implements OnInit {
  // objectForm: FormGroup;
  objectform = new FormGroup({
    objectName: new FormControl(),
    objectType: new FormControl(),
    objectLoc: new FormControl()
  });
  geoArarry: any[] = [];
  progressbarShow: boolean;
  showSuccessMsg: boolean;
  vectorLayer;
  map: any;
  map2: any;
  subscription: Subscription;
  obName: any;
  obType: any;
  obCor: any;
  objectsize: number;
  showWarningMsg: boolean = false;
  vectorSource: VectorSource;
  // geomvalue: geom.Geometry;
  geojsonObject: any;




  currentlayer: string = "Aerial";
  layers = ["Aerial", "Road", "OpenStreetMap"];
  constructor(
    private mapService: MapService,
    private dataService: DataService,
    private formBuilder: FormBuilder,
    private apiService: ApidataService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public featurelistService: FeaturelistService,
    public downloadService:DownloadService
  ) {
    // this.createForm();
  }


  // get objectName() { return this.objectForm.get('objectName'); }
  // get objectType() { return this.objectForm.get('objectType'); }
  // get objectLoc() { return this.objectForm.get('objectLoc'); }


  layerChanged(currentlayer) {
    if (currentlayer === "Aerial") {
      let aerialWithLabels = new BingMaps({
        projection: BING_PROJECTION,
        key: BING_KEY,
        imagerySet: 'AerialWithLabels'
      });
      this.mapService.bingMapsLayer.setSource(aerialWithLabels);
    } else if (currentlayer === "Road") {
      let roadOnDemand = new BingMaps({
        projection: BING_PROJECTION,
        key: BING_KEY,
        imagerySet: 'RoadOnDemand'
      });
      this.mapService.bingMapsLayer.setSource(roadOnDemand);
    } else if (currentlayer === "OpenStreetMap") {
      let
        openStreetMap = new OSM();
      this.mapService.bingMapsLayer.setSource(openStreetMap);
    }

    // console.log("Layer",currentlayer)
  }


  ngOnInit() {
    this.map2 = this.mapService.initMap();
// console.log("A");
    if (localStorage.getItem("alldata") != null ) {
      // console.log("b");
      let data:any = JSON.parse(localStorage.getItem("alldata"));
      // console.log(data);
      if (data.features) {
        // console.log("c");
        // `theHref` is truthy and has truthy property _length_
        // console.log("Length",data.features.length);
        this.mapService.updateLayer();
    }
     
        
      
      
    }

    // --------------------------------------------------
    this.subscription = this.dataService.getData().subscribe(data => {
      this.geojsonObject = JSON.parse(JSON.stringify(data));
      let formattedFeaturesArray = this.dataService.dataKupJhap(this.geojsonObject);
      // console.log("###", formattedFeaturesArray);
      let newobject = {
        "type": "FeatureCollection",
        // "crs": { "type": "name", "properties": { "name": "EPSG:3857" } },
        "features": formattedFeaturesArray
      }
      if (GJV.valid(newobject)) {
        localStorage.setItem("alldata", JSON.stringify(newobject));

      } else {
        let message = "Geometry data are not valid";
        this.openDialog(message);
      }

      if (localStorage.getItem("alldata") != null) {
        this.getLocalStorageSize();
      }
      // console.log("calling from sub");
      this.mapService.updateLayer();
    });
  }



 


  // focused map where is all objets are
  getFocused(layer: any) {
    var extent = layer.getSource().getExtent();
    this.map.getView().fit(extent, { size: this.map.getSize(), maxZoom: 12 })
  }


  getLocalStorageSize() {
    // if (localStorage)
    var _lsTotal = 0, _xLen, _x; for (_x in localStorage) { if (!localStorage.hasOwnProperty(_x)) { continue; } _xLen = ((localStorage[_x].length + _x.length) * 2); _lsTotal += _xLen; console.log(_x.substr(0, 50) + " = " + (_xLen / 1024).toFixed(2) + " KB") };
    // console.log("Total = " + (_lsTotal / 1024).toFixed(2) + " KB");
  }

  createForm() {
    this.objectform = this.formBuilder.group({
      objectName: '',
      objectType: '',
      objectLoc: ''
    });
  }

  saveData() {
    this.progressbarShow = true;
    let name = this.objectform.get('objectName').value;
    let type = this.objectform.get('objectType').value;
    let cor = this.objectform.get('objectLoc').value;

    let obFeature = {
      "type": "Feature",
      "properties": {
        "name": name
      },
      "geometry": {
        "type": type,
        "coordinates": JSON.parse(cor)
      }
    };




    let newObFeature: any = this.dataService.convertToPolyGon(obFeature);

    var polygon = turf.polygon(newObFeature.geometry.coordinates);
    var area = turf.area(polygon);
    this.objectsize = Number(area) * 0.0000010;


    if (this.objectsize < 1001) {
      var obj = {
        name: name,
        geo_location: newObFeature,
        description: "No this time as well"
      };

      // console.log(this.obName);
      if (newObFeature) {
        this.apiService.addObject(obj).subscribe(
          data => {
            // console.log(data);
            if (data.status === "success") {
              this.resetForm();
              // this.showSuccessMsg = true;
              this.snackBar.open("Your object saved successfully ! Check form OBJECT LIST option.", 'OK', {
                duration: 5000
              });
              this.progressbarShow = false;
            }
          }
        );
      }

    } else {
      this.progressbarShow = false;
      // this.showWarningMsg = true;
      this.resetForm();
      this.snackBar.open("Your object will not save. It is larger the 1001 KM (square) |EDITED SIZE :" + this.objectsize + "KM (square)", 'OK', {
        duration: 5000
      });

    }

  }
  openDialog(message) {
    const dialogRef = this.dialog.open(WarningdialogComponent, {
      width: '250px',
      data: { msg:  message}
    });

    dialogRef.afterClosed().subscribe(result => {
      // window.location.href = "/"
    });
  }

  resetForm() {
    this.objectform.setValue({
      objectName: '',
      objectType: '',
      objectLoc: JSON.stringify('')
    });
  }
  //for destroying subscription
  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }
  ngAfterViewInit() {
    this.map2.setTarget('geomap');
  }

  downloadData(dataformat){
    if( dataformat === 'geojson'){
      if (localStorage.getItem("alldata") != null) {
        let data = JSON.parse(localStorage.getItem("alldata") );
        this.downloadService.downloadfileGenerate('FeatureCollection.geojson', JSON.stringify(data) );
      }
      
    } else if ( dataformat === 'kml'){
      if (localStorage.getItem("alldata") != null) {
      let data = JSON.parse(localStorage.getItem("alldata") );
      this.downloadService.downloadDataKML(data);
    }
    }
   
  }
}
