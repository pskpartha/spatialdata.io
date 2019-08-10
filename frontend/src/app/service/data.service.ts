import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';
import { CONVERSION_UNIT, POINT_BUFFER, LINE_BUFFER } from '../app.constants'
import * as turf from '@turf/turf';
import { MapService } from './map.service';
import { getArea, getLength } from 'ol/sphere.js';
import * as geom from 'ol/geom';
import { log } from 'util';
@Injectable({
  providedIn: 'root'
})
export class DataService {

  constructor(private mapService: MapService) { }
  private dataSub = new Subject<any>();
  private convertData = new Subject<any>();
  public geometry: any;
  public geoArarry: any[] = [];
  updateData(geoObject: any) {
    this.dataSub.next(geoObject);
  }


  clearData() {
    this.dataSub.next();
  }

  getData(): Observable<any> {
    return this.dataSub.asObservable();
  }

  convertGEOdata(data: any) {
    let geom = data.transform('EPSG:3857', 'EPSG:4326');
    let dta = geom.getCoordinates();
    return dta;
  }

  reverseGEOdata(data: any) {
    let geom = data.transform('EPSG:4326', 'EPSG:3857');
    let dta = geom.getCoordinates();
    return dta;
  }

  convertToPolyGon(data: any, bufferSizeMeter?: number) {
  
    // default 200 meter
    let bufferSizeKmPoint = bufferSizeMeter ? bufferSizeMeter / 1000 : 0.2;
    // default 25 meter
    let bufferSizeKmLine = bufferSizeMeter ? bufferSizeMeter / 1000 : 0.025;

    let conOb = {};

    if (data.geometry.type === 'Point') {
      let point = turf.point(data.geometry.coordinates);
      conOb = turf.buffer(point, bufferSizeKmPoint, { units: CONVERSION_UNIT });
    } else if (data.geometry.type === 'LineString') {

      let linecor = turf.lineString(data.geometry.coordinates);
      conOb = turf.buffer(linecor, bufferSizeKmLine, { units: CONVERSION_UNIT });
    } else {
      let polycor = turf.polygon(data.geometry.coordinates);
      conOb = turf.buffer(polycor, bufferSizeKmLine, { units: CONVERSION_UNIT });
      // conOb = data;
    }
    return conOb;
  }




  getObjectSize(feature: any) {
    let featureStr = feature[0].getGeometry().getCoordinates();
    let convertedGeo = new geom['Polygon'](featureStr).transform('EPSG:3857', 'EPSG:4326');
    let obCor = convertedGeo.getCoordinates();
    let polygon = turf.polygon(obCor);
    let area = turf.area(polygon);
    let objectsize = (Number(area) * 0.0000010).toFixed(4);
    return objectsize;
  }


  dataKupJhap(data: any) {
    this.geoArarry = [];
    // console.log("###", this.geoArarry.length);
    // console.log(JSON.stringify(data.features));
    data.features.forEach((item) => {
      let geoType = item.geometry.type;
      if ((geoType === "Polygon") || (geoType === "Point") || (geoType === "LineString")) {
        let p = this.noNeedToChange(item);

        this.geoArarry.push(p);
        // console.log(item);
      } else if (geoType === 'MultiPolygon') {

        // console.log(item);
        let p = this.multiPolygoTopolygons(item);
        // console.log("newpolygon",p);
        //  console.log("newpolygon",JSON.stringify(p));
        this.geoArarry.push(p);
      } else if (geoType === 'MultiPoint') {
        //  console.log("####",item);
        let p = this.multiPointToPoints(item);
        this.geoArarry.push(p);
      }
      else if (geoType === 'MultiLineString') {
        //  console.log("####",item);
        let p = this.multiLineToLines(item);
        // console.log("####",p );
        this.geoArarry.push(p);
      }
      else if (geoType === 'GeometryCollection') {
        let p = this.geometryCollectionToSimple(item);
        this.geoArarry.push(p);
        // console.log(JSON.stringify(p));

      }
      
    });
    return [].concat(...this.geoArarry);
  }

  geometryCollectionToSimple(items: any) {
    let convertedeoCollectionArray: any[] = [];

    let geoCollectionArray: any[] = items.geometry.geometries;


    geoCollectionArray.forEach((item) => {
      let itemType = item.type;
      // console.log(itemType);
      if ((itemType === "Polygon") || (itemType === "Point") || (itemType === "LineString")) {
        let formattedItem = {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": itemType,
            "coordinates": item.coordinates
          }
        }
        let p = this.noNeedToChange(formattedItem);

        convertedeoCollectionArray.push(p);
        // console.log(item);
      } else if (itemType === 'MultiPolygon') {
        let formattedItem = {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": itemType,
            "coordinates": item.coordinates
          }
        }
        // console.log(item);
        let p = this.multiPolygoTopolygons(formattedItem);
        // console.log("newpolygon",p);
        //  console.log("newpolygon",JSON.stringify(p));
        convertedeoCollectionArray.push(p);
      } else if (itemType === 'MultiPoint') {
        let formattedItem = {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": itemType,
            "coordinates": item.coordinates
          }
        }
        //  console.log("####",item);
        let p = this.multiPointToPoints(formattedItem);
        convertedeoCollectionArray.push(p);
      }
      else if (itemType === 'MultiLineString') {
        let formattedItem = {
          "type": "Feature",
          "properties": {},
          "geometry": {
            "type": itemType,
            "coordinates": item.coordinates
          }
        }
        //  console.log("####",item);
        let p = this.multiLineToLines(formattedItem);
        convertedeoCollectionArray.push(p);
      }



    });


    // console.log("###converted", convertedeoCollectionArray.length);
    // console.log("###converted",JSON.stringify([].concat(...convertedeoCollectionArray)));
    return [].concat(...convertedeoCollectionArray);

  }


  getAfeatureID(){
    let gid = Math.random().toString(36).substr(2, 9);
    return gid;
  }

  noNeedToChange(items: any) {
    // console.log(items)
    let polyarray = [];

    let feat = {
      "id":this.getAfeatureID(),
      "type": "Feature",
      "properties": items.properties,
      "geometry": items.geometry
    };
    polyarray.push(feat);
    return polyarray;
  }


  multiPolygoTopolygons(items: any) {
    let length = items.geometry.coordinates.length
    // console.log(length);
    if (length){
    let polyarray = [];
    let feat;
    items.geometry.coordinates.forEach((coords) => {
      feat = {
        "id":this.getAfeatureID(),
        "type": "Feature",
        "properties": {},
        "geometry": { 'type': 'Polygon', 'coordinates': coords }
      };
      polyarray.push(feat);
    }
    )
    return polyarray;
  }
  }

  multiPointToPoints(items: any) {
    let length = items.geometry.coordinates.length
    if (length){
    let polyarray = [];
    let feat;
    items.geometry.coordinates.forEach((coords) => {
      feat = {
        "id":this.getAfeatureID(),
        "type": "Feature",
        "properties": {},
        "geometry": { 'type': 'Point', 'coordinates': coords }
      };
      // this.newgeodata.features.push(feat);
      // console.log(JSON.stringify(feat));

      polyarray.push(feat);
    }
    )
    return polyarray;
  }
  }


  multiLineToLines(items: any) {
    let length = items.geometry.coordinates.length
    if (length){
    let polyarray = [];
    let feat;
      items.geometry.coordinates.forEach((coords) => {
        
        feat = {
          "id":this.getAfeatureID(),
          "type": "Feature",
          "properties": {},
          "geometry": { 'type': 'LineString', 'coordinates': coords }
        };
        polyarray.push(feat);
      })
      return polyarray;
    }  
  }

 arrayAfterRemove(arr:any, value) {
    return arr.filter(function(ele){
        return ele.id != value;
    });
 }

}
