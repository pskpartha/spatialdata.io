import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatTableDataSource, MatDialog } from '@angular/material';
// import * as $ from "jquery";
import { DataService } from '../service/data.service';
import * as tj from 'togeojson';
import { ApidataService } from '../service/apidata.service';
import * as turf from '@turf/turf';
import { WarningdialogComponent } from '../warningdialog/warningdialog.component';
import { FeaturelistComponent } from '../featurelist/featurelist.component';

import { log } from 'util';
import { from } from 'rxjs';
import { MapService } from '../service/map.service';

// import * as shp from "shpjs";
/* jQuery */
declare var $: any;
declare var shp: any;
declare var cw: any;

@Component({
  selector: 'app-fileupload',
  templateUrl: './fileupload.component.html',
  styleUrls: ['./fileupload.component.css']
})
export class FileuploadComponent implements OnInit {

  // displayedColumns: string[] = ['position', 'name', 'weight', 'symbol'];
  // displayedColumns: string[] = ['position', 'type', 'save'];
  // dataSource = new MatTableDataSource<PeriodicElement>(ELEMENT_DATA);
  // 

  // @ViewChild(MatPaginator) paginator: MatPaginator;
  tableData: any;
  fileText;
  finalData;
  fileFeatures = [];
  dataSource;
  geoarray;
  showfileprogress: boolean = false;
  xmldata = '<?xml version="1.0" encoding="UTF-8"?><kml xmlns="http://www.opengis.net/kml/2.2"><Document><Placemark><ExtendedData></ExtendedData><Polygon><outerBoundaryIs><LinearRing><coordinates>-1.7578125,31.952162238024975 -5.625,16.29905101458183 33.92578125,18.312810846425442 -1.7578125,31.952162238024975</coordinates></LinearRing></outerBoundaryIs></Polygon></Placemark></Document></kml>';
  format = 'kml';


  constructor(
    private dataService: DataService,
    private apiService: ApidataService,
    public dialog: MatDialog,
    private mapService:MapService
  ) { }

  ngOnInit() {
    this.dataService.getData().subscribe(data => {
      // console.log("tableData", data);
    }

    );

  }

  fileUpload(event){
    let uploadedFile = event.srcElement.files[0];
		let fname = uploadedFile.name;
    let fileType= fname.slice((fname.lastIndexOf(".") - 1 >>> 0) + 2);
    console.log(fileType);
      if(fileType ==="geojson"){
        this.fileGEOJSONUpload(event)
      }else if (fileType ==="kml")
      {
        this.fileKMLUpload(event)
      }else {
        let msg = "Unfortunately this file format does not support with Application. Try with KML or GEOJSON data";
        this.openDialog(msg);
      }

  }


  fileKMLUpload(event) {
    this.showfileprogress = true;
    let self = this;
    var readXml = null;
    var reader = new FileReader();
    var selectedFile = event.srcElement.files[0];
    var reader = new FileReader();
    reader.onload = function (e) {
      readXml = reader.result;
      var parser = new DOMParser();
      var doc = parser.parseFromString(readXml, "application/xml");
      var data = JSON.stringify(tj[self.format]((new DOMParser()).parseFromString(readXml, 'text/xml')), null, 4);
      self.finalData = JSON.parse(data);
      self.fileFeatures = self.finalData.features;
      self.dataSource = self.fileFeatures;
      self.dataService.updateData(self.finalData);
      self.showfileprogress = false;
    }
    reader.readAsText(selectedFile);
  }


  fileGEOJSONUpload(event) {
    this.showfileprogress = true;
    // document.getElementById("bar").style.width = 0 + "%";
    var reader = new FileReader();
    reader.readAsText(event.srcElement.files[0]);

    var self = this;
    // Handle progress, success, and errors

    reader.onprogress = function (event) {
      if (event.lengthComputable) {
        var loaded = (event.loaded / event.total);
        if (loaded < 1) {
          // document.getElementById("bar").style.width = (loaded * 100) + "%";
        }
      }
    }

    reader.onload = function () {
      self.showfileprogress = false;
      self.fileText = reader.result;
      // console.log(typeof reader.result === undefined);

      // if (typeof(self.fileText) !== 'undefined') {
      try {
        self.finalData = JSON.parse(self.fileText);
        self.fileFeatures = self.finalData.features;
        // document.getElementById("bar").style.width = 100 + "%";

        self.dataSource = self.fileFeatures;
        // console.log(self.dataSource);
        // self.updateData();
        let newgeojsonObject = {
          'type': 'FeatureCollection',
          'crs': {
            'type': 'name',
            'properties': {
              'name': 'EPSG:3857'
            }
          },
          'features': self.dataSource
        };
        self.dataService.updateData(newgeojsonObject);
      } catch (err) {
        self.showfileprogress = false;
        let msg = "Something wrong with your uploaded file. Please check, Is that the actual file?";
        self.openDialog(msg);

      }
    }
  }

  


  openDialog(message) {
    const dialogRef = this.dialog.open(WarningdialogComponent, {
      width: '250px',
      data: { msg: message}
    });

    dialogRef.afterClosed().subscribe(result => {
      // window.location.href = "/"
    });
  }
  //  var tmppath = URL.createObjectURL(event.target.files[0]);

  

  saveObject(rowdata: any) {
    let jsonData: any = JSON.stringify(rowdata);
    console.log(rowdata.geometry);
    if (rowdata.geometry.type === "Point") {
      var pointcor = turf.point(rowdata.geometry.coordinates);
      var buffered = turf.buffer(pointcor, 0.00621371, { units: 'miles' });
      console.log("true", buffered);
      document.getElementById("turfpoint").textContent = JSON.stringify(jsonData);
    }

    var obj = {
      name: 'New Front Object Name',
      geo_location: rowdata,
      description: "No this time as well"
    };

    // this.apiService.addObject(obj).subscribe(
    //   data => {
    //     console.log(data);
    //   }
    // );
    // console.log("listening", obj);

  }


  fileSHAPEUpload(event) {
    // var fileurl = URL.createObjectURL(event.target.files[0]);
    var absolutePath = $('input[id="shape-file-upload"]').val();
    console.log(absolutePath);
    var fileInput = document.getElementById("shape-file-upload");
    console.log(fileInput);

    // id="shape-file-upload"

    var reader = new FileReader();
    reader.readAsDataURL(event.srcElement.files[0]);
    var me = this;
    reader.onload = function () {
      var fileContent = reader.result;
      console.log(fileContent);
      shp(reader.result).then(function (geojson) {
        console.log(geojson);

      });
    }
  }
}







