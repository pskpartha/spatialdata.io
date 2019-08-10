import { Component, OnInit } from '@angular/core';
import Feature from 'ol/Feature.js';
import Map from 'ol/Map.js';
import View from 'ol/View.js';
import GeoJSON from 'ol/format/GeoJSON.js';
import Circle from 'ol/geom/Circle.js';
import { Tile as TileLayer, Vector as VectorLayer } from 'ol/layer.js';
import { OSM, Vector as VectorSource } from 'ol/source.js';
import { CircleStyle, Fill, Stroke, Style } from 'ol/style.js';
import Draw from 'ol/interaction/Draw.js';
import { FormControl, FormGroup, FormBuilder, Validators } from '@angular/forms';
import * as turf from '@turf/turf';
import * as geom from 'ol/geom';
import { ApidataService } from '../service/apidata.service';
import { debounceTime } from 'rxjs/operators';
import { LocationService } from '../service/location.service';
import proj from 'ol/proj';
import { DataService } from '../service/data.service';
import { BING_KEY, BING_PROJECTION } from '../app.constants';
// import * as tokml from 'tokml';
import BingMaps from 'ol/source/BingMaps.js';
import { DownloadService } from '../service/download.service';

@Component({
  selector: 'app-newobject',
  templateUrl: './newobject.component.html',
  styleUrls: ['./newobject.component.css']
})
export class NewobjectComponent implements OnInit {
  newobjectform = new FormGroup({
    newObjectName: new FormControl('', Validators.required),
    newObjectType: new FormControl(),
    newObjectLoc: new FormControl('', Validators.required),
  });

  public searchvalue: string;
  public mapSearchCtrl: FormControl;
  public searchResults = [];
  public searching: boolean;

  geometryType: string = 'Polygon';
  geoType: string[] = ['Point', 'LineString', 'Polygon'];
  map: any;
  vector_layer: any;
  vector_source: any;
  draw_interaction: any;
  showSuccessMsg: boolean;
  progressbarShow: boolean;
  showWarningMsg: boolean;
  objectsize;
  activeSaveButton:boolean = false;
  activeClearButton:boolean = false;
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

  constructor(
    private newFormBuilder: FormBuilder,
    private apiService: ApidataService,
    private locationService: LocationService,
    private dataService: DataService,
    private downloadService:DownloadService

  ) {
    this.newObjectCreateForm();

    this.mapSearchCtrl = new FormControl();
    this.mapSearchCtrl.valueChanges.
      pipe(debounceTime(500)).subscribe(val => {
        if ((val) && (val.length > 2)) {
          // console.log(val);
          this.doSearch();
        }
        /*TODO: show something if no search matches */
      });
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
  doSearch() {
    this.searching = true;
    this.locationService.geoCodeString(this.searchvalue).subscribe(
      data => {
        this.searchResults = data;
        // console.log(data);

        if (data.length === 0) {
          // this.snackService.showTranslatedSnack("ORDER_ADDOBJECT.NO_RESULTS", "OK");
        }
        this.searching = false;
      },
      error => {
        // this.snackService.showTranslatedSnack("ORDER_ADDOBJECT.NO_SEARCHSERVICE", "OK");
        this.searching = false
      }
    );
  }
  clearSearch() {
    this.searchvalue = "";
    this.searchResults = [];
    this.searching = false
  }

  changeMapLocation(data) {
    if (data.lon) {

      // this.centerMap(Number(24.753574),Number(59.436962));
      this.centerMap(Number(data.lon), Number(data.lat));
      this.searchvalue = data.display_name;
    } else {
      // this.snackService.showTranslatedSnack("ORDER_ADDOBJECT.NO_LOCATION_COORDINATES", "OK");
    }
  }

  centerMap(long?, lat?) {
    // let cor = this.dataService.reverseGEOdata([long,lat])
    var convertedGeo = new geom["Point"]([long, lat]).transform('EPSG:4326', 'EPSG:3857');
    let obCor = convertedGeo.getCoordinates();
    this.map.getView().setCenter(obCor);
    this.map.getView().setZoom(16);
  }

  // getFocused(layer: any) {
  //   var extent = layer.getSource().getExtent();
  //   this.map.getView().fit(extent, { size: this.map.getSize(), maxZoom: 16 })
  // }


  displayFn(location?): string | undefined {

    if ((location) && (typeof location === "object")) {
      if (location.hasOwnProperty('display_name')) {
        return location.display_name;
      } else {
        return undefined;
      }
    } else {
      return location;
    }
  }
  ngOnInit() {

    this.showMap();
    // this.testMap();

  }

  newObjectCreateForm() {
    this.newobjectform = this.newFormBuilder.group({
      newObjectName: '',
      newObjectType: '',
      newObjectLoc: ''
    });

  }

  showMap() {
    let self = this;
    this.vector_source = new VectorSource({ wrapX: false });
    this.vector_layer = new VectorLayer({
      source: this.vector_source,
      style:[new Style({
        stroke: new Stroke({
          color: 'rgba(245, 59, 87,1.0)',
          width: 3
        }),
        fill: new Fill({
          color: 'rgba(255, 221, 89,0.5)'
        })
      }),]
    });
    this.map = new Map({
      layers: [this.bingMapLayer, this.vector_layer],
      target: 'map',
      view: new View({
        center: [0, 0],   //long lat
        zoom: 2
      })
    });

    this.drawFeature();
  }

  drawFeature() {
    this.draw_interaction = new Draw({
      source: this.vector_source,
      type: this.geometryType
    });
    this.map.addInteraction(this.draw_interaction);
    this.draw_interaction.on('drawend', (event) => {
      this.map.removeInteraction(this.draw_interaction);
      this.activeClearButton = true;
      console.log("draw end")
      setTimeout(() => {
        this.checkDraw();
        // $(".sidebar-toggle").addClass("is-blinking");
      }, 200);
      
    });
  }

  checkDraw() {
    // console.log("check draw callinnnn");
    let featureStr = this.vector_layer.getSource();
    var features = featureStr.getFeatures();
    // console.log(features);
    // console.log(features.length);

    if (features.length !== 0) {
      let type = features[0].getGeometry().getType();
      let geomet = features[0].getGeometry().getCoordinates();
      // console.log(geomet);

      var convertedGeo = new geom[type](geomet).transform('EPSG:3857', 'EPSG:4326');

      let congeo = convertedGeo.getCoordinates();
      // console.log(congeo);
      var polygon = turf.polygon(congeo);
      var area = turf.area(polygon);

      
      this.objectsize = (Number(area) * 0.0000010).toFixed(4);

      // console.log(this.objectsize);

      // console.log("area",area);

      // console.log("sKM",this.objectsize);

      let locLat = congeo[0][0][1];
      let locLong = congeo[0][0][0];


      this.locationService.geoCodePoint(locLat, locLong).subscribe(data => {

        let obFeature = {
          "type": "Feature",
          "properties": {
            "name": data.display_name
          },
          "geometry": {
            "type": type,
            "coordinates": congeo
          }
        };


        this.writeOnForm(obFeature, type, data.display_name);
        
      });


      // this.clearDraw();
    }

  }
 
  writeOnForm(obFeature, type, name) {
    this.activeSaveButton = obFeature ? true:false;
    this.newobjectform.setValue({
      newObjectName: name,
      newObjectType: type,
      newObjectLoc: JSON.stringify(obFeature)
    });
  }

  saveDraw() {
    // this.activeSaveButton = false;
    this.progressbarShow = true;
    let name = this.newobjectform.get('newObjectName').value;
    let type = this.newobjectform.get('newObjectType').value;
    let feature = this.newobjectform.get('newObjectLoc').value;


    var obj = {
      name: name,
      geo_location: JSON.parse(feature),
      description: "No this time as well"
    };

    if (obj) {
      this.apiService.addObject(obj).subscribe(
        data => {
          // console.log(data);
          if (data.status === "success") {
            this.activeSaveButton = false;
            this.showSuccessMsg = true;
            this.progressbarShow = false;
          }
        }
      );
    }
  }

  resetForm() {
    this.progressbarShow = false;
    this.newobjectform.setValue({
      newObjectName: '',
      newObjectType: '',
      newObjectLoc: ''
    });
  }



  clearDraw() {
    this.vector_layer.getSource().clear();
    this.resetForm()
    this.drawFeature();
    this.showWarningMsg = false;
    this.activeSaveButton = false;
    this.objectsize = '';
  }
 
  downloadData(format: string) {
    let name = this.newobjectform.get('newObjectName').value;
    // let type = this.newobjectform.get('newObjectType').value;
    let feature = this.newobjectform.get('newObjectLoc').value;
    let parseFeat:any = JSON.parse(feature);

    let feat = {
      "type": "Feature",
      "properties": {
        "name": name
      },
      "geometry": parseFeat.geometry
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



}

