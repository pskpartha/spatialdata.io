import { Injectable } from '@angular/core';
import tokml from 'tokml';
// import * as shpwrite from 'shp-write';
import {shpwrite} from 'shp-write';

@Injectable({
  providedIn: 'root'
})
export class DownloadService {
  constructor() { }



  downloadDataGEOJSON(data: any) {
    let formatedpoint = JSON.stringify(data, null, 2);
    return this.downloadfileGenerate("objectdata.geojson", formatedpoint);
  }
  downloadDataKML(data: any) {
    console.log(data);
    
    var kmldata = tokml(data);
    return this.downloadfileGenerate("objectdata.kml", kmldata);
  }

  downloadfileGenerate(filename, text) {
    var element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
    element.setAttribute('download', filename);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  }

  downloadDataShape(data: any) {
    var options = {
      folder: 'myshapes',
      types: {
        point: 'mypoints',
        polygon: 'mypolygons',
        line: 'mylines'
      }
    }
    // a GeoJSON bridge for features
    // shpwrite.download(data, options);
  }

}

