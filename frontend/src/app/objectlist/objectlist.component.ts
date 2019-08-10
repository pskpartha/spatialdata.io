import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator, MatDialog, MatDialogConfig, MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { ApidataService } from '../service/apidata.service';
import GeoJSON from 'ol/format/GeoJSON.js';
import { rowsAnimation } from '../animations/template.animations';
import { DataService } from '../service/data.service';
import { ObjecteditComponent } from '../objectedit/objectedit.component';
import { FormControl, FormGroup, FormBuilder,Validators  } from '@angular/forms';
import tokml from 'tokml';
import {MatSort, MatTableDataSource} from '@angular/material';
export interface PeriodicElement {
  id: string;
  name: string;
}

@Component({
  selector: 'app-objectlist',
  templateUrl: './objectlist.component.html',
  styleUrls: ['./objectlist.component.css'],
  animations: [rowsAnimation]
})


export class ObjectlistComponent implements OnInit {
  objectList: any[] = [];
  objectArray: any[] = [];
  singleObjectData:any ={};
  showShareOption:boolean = false;
  backApiEndPoint:string = "https://mod-sille-back.herokuapp.com/api/userobject/";
  shareobjectform = new FormGroup({
    apilink: new FormControl(),
    objectdata: new FormControl(),
  });
  
  displayedColumns: string[] = ['id', 'name','edit','delete','share'];
  dataSource = new MatTableDataSource(this.objectList);
  @ViewChild(MatSort) sort: MatSort;
  @ViewChild(MatPaginator) paginator: MatPaginator;

  constructor(private apiService: ApidataService, private dataService: DataService,
    public dialog: MatDialog, public snackBar: MatSnackBar,
    public formBuilder:FormBuilder) { 

    }

  ngOnInit() {
    // this.getAllObjectList();
    this.apiService.getAllObject()
    .subscribe(data => {
      this.objectList = data.data;
     
      this.dataSource = new MatTableDataSource(this.objectList);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });

    
    this.shareobjectform = this.formBuilder.group({
      apilink: '',
      objectdata: ''
    });
  }
  applyFilter(filterValue: string) {
    this.dataSource.filter = filterValue.trim().toLowerCase();
  }
  getAllObjectList() {
    console.log("ALL object calling");
    this.apiService.getAllObject()
    .subscribe(data => {
      this.objectList = data.data;
      this.dataSource = new MatTableDataSource(this.objectList);
      this.dataSource.sort = this.sort;
      this.dataSource.paginator = this.paginator;
    });
   
  }

  deleteObject(id: number) {
    let config = new MatSnackBarConfig();
    config.duration = 10000;
    this.apiService.deleteObject(id).subscribe(data => {
      this.getAllObjectList();
      this.snackBar.open(data.message, 'OK', {
        duration: 3000
      });
    });
  }

  editObject(id: number) {
    const dialogConfig = new MatDialogConfig();
    dialogConfig.width = '99vw';
    // dialogConfig.height = '95vh';
    dialogConfig.data = {
      objectID: id
    };

    const dialogRef = this.dialog.open(ObjecteditComponent, dialogConfig);

  }

  shareObject(id){
    this.apiService.getObject(id).subscribe(data => {
      // console.log(data);
      this.singleObjectData = {
        "type": "FeatureCollection",
        "features": [data.data.geo_location]
      };

      console.log(this.singleObjectData);
      this.shareobjectform.setValue({
        apilink: this.backApiEndPoint+data.data.object_id,
        objectdata: JSON.stringify(this.singleObjectData)
      });

    });
    this.showShareOption = true;
  }

  downloadDataGEOJSON(){
    console.log("##DOWNLOAD", JSON.stringify(this.singleObjectData));
    let formatedpoint = JSON.stringify(this.singleObjectData, null, 2);
    this.downloadfileGenerate("objectdata.geojson", formatedpoint);
          
  }

  downloadDataKML(){
    // console.log(this.singleObjectData);
    var kmldata = tokml(this.singleObjectData);
    // let formatedpoint = JSON.stringify(this.singleObjectData, null, 2);
    this.downloadfileGenerate("objectdata.kml", kmldata);
          
  }

  downloadfileGenerate(filename, text){
      var element = document.createElement('a');
      element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(text));
      element.setAttribute('download', filename);
      element.style.display = 'none';
      document.body.appendChild(element);
      element.click();
      document.body.removeChild(element); 
  }


}
