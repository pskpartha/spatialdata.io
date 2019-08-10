import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatPaginator, MatDialog, MatDialogConfig, MatSnackBar, MatSnackBarConfig } from '@angular/material';
import { Subscription } from 'rxjs';
import { FeaturelistService } from '../service/featurelist.service';
import { rowsAnimation } from '../animations/template.animations';
import { MapService } from '../service/map.service';
import { EditfeatureComponent } from '../editfeature/editfeature.component';
import { DataService } from '../service/data.service';
import { ApidataService } from '../service/apidata.service';
import * as turf from '@turf/turf';
import { LocationService } from '../service/location.service';

declare var $: any;
@Component({
  selector: 'app-featurelist',
  templateUrl: './featurelist.component.html',
  styleUrls: ['./featurelist.component.css'],
  animations: [rowsAnimation]
})
export class FeaturelistComponent {
  // mat slider

  // 
  bboxstatusDisable: boolean= true;
  convexstatusDisable: boolean = true;
  features: any[] = [];
  subscription: Subscription;
  featureCollectionEnvelop:any;
  featName = "Put area name"
  constructor(private featurelistService: FeaturelistService,
    private mapService: MapService,
    public dialog: MatDialog,
    public snackBar: MatSnackBar,
    public dataService: DataService,
    public apiService: ApidataService,
    public locationService:LocationService
  ) {
    // subscribe to home component messages
    this.subscription = this.featurelistService.getFeature().subscribe(feature => {
      if (feature) {
        // unshift(TheNewObject)
        // console.log(feature);
        if (this.features.length < 100) {
          this.features.unshift(feature);
        } else {
          this.features.pop();
          this.features.unshift(feature);
        }
      } else {
        this.features = [];
      }
    });
  }

  ngOnInit(){

  }


  getSelectedRow(feat: any) {
    let formattedfeat = {
      "obid":feat.objectId,
      "type": "Feature",
      "properties": {
        "name": feat.objectName
      },
      "geometry": {
        "type": feat.objectType,
        "coordinates": JSON.parse(feat.objectLoc)
      }  
    }
    // console.log(feat);
    let newObFeature: any = this.dataService.convertToPolyGon(formattedfeat);
// console.log(newObFeature);
// console.log();


    const dialogRef = this.dialog.open(EditfeatureComponent, {
      width: '98vw',
      maxWidth: '98vw',
      data: { feature: newObFeature, areaname: feat.objectName ,originalData:formattedfeat}
    });

    dialogRef.afterClosed().subscribe(data => {

    });
  }


  saveObject(feat: any) {
    console.log(feat);
    let formattedfeat = {
      "type": "Feature",
      "properties": {
        "name": feat.objectName
      },
      "geometry": {
        "type": feat.objectType,
        "coordinates": JSON.parse(feat.objectLoc)
      }
    }

    let newObFeature: any = this.dataService.convertToPolyGon(formattedfeat);


    var obj = {
      name: feat.objectName,
      geo_location: newObFeature,
      description: "No this time as well"
    };

    this.apiService.addObject(obj).subscribe(
      data => {
        // console.log(data);
        if (data.status === "success") {
          // this.showSuccessMsg = true;
          this.snackBar.open("Your object saved successfully ! Check form OBJECT LIST option.", 'OK', {
            duration: 5000
          });
        }
      }
    );

  }

  removeLayer() {
    this.mapService.removeUploadDataLayer();
  }



  deleteObjectFromData(feat: any) {
    // console.log(feat.objectId);
    if (localStorage.getItem("alldata") != null) {
      let localArray = JSON.parse(localStorage.getItem("alldata"));
      let newArray:any = this.dataService.arrayAfterRemove(localArray.features, feat.objectId);
    
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



  ngOnDestroy() {
    // unsubscribe to ensure no memory leaks
    this.subscription.unsubscribe();
  }


  rowSelected(){
    let geoarray = [];
        $('#featureTable tr').each(function(i, elem) {
            let $chkbox = $(this).find('input[type="checkbox"]');
            if ($chkbox.length) {
                let status = $chkbox.prop('checked');

                if (status) {
                    let v = $(this).find("td[data-id='geo_footprint']").text();
                        let texto:any = JSON.parse(v);
                        let feat = {
                          "id":texto.objectId,
                          "type": "Feature",
                          "properties": {
                            "name":texto.objectName
                          },
                          "geometry": {
                            "type": texto.objectType,
                            "coordinates":JSON.parse(texto.objectLoc)
                        }};

                        geoarray.push(feat);
                }}});

                this.featureCollectionEnvelop = geoarray;
                let getLengthOfSelectedItems = geoarray.length;
                if(getLengthOfSelectedItems > 1){
                  this.bboxstatusDisable = false;
                }
                if(getLengthOfSelectedItems > 1){
                  this.convexstatusDisable = false;
                }
                

  }

  convertCollectionToBBOX(){
    let self = this;
    let featColl= {
      "type": "FeatureCollection",
      "features": this.featureCollectionEnvelop
    }  

    // var enveloped:any= turf.convex(featColl)
    let enveloped:any = turf.envelope(featColl);

   
    let locLat;
    let locLong;
    
      locLat = enveloped.geometry.coordinates[0][0][1];
      locLong = enveloped.geometry.coordinates[0][0][0];
    
    
    this.locationService.geoCodePoint(locLat,locLong).subscribe(data =>{
      // console.log(data);
      
            this.featName = data.display_name;
            let formattedfeat = {
              "obid":this.dataService.getAfeatureID(),
              "type": "Feature",
              "properties": {
                "name": "Sample name"
              },
              "geometry": enveloped.geometry
            }
        
            const dialogRef = this.dialog.open(EditfeatureComponent, {
              width: '98vw',
              maxWidth: '98vw',
              data: { feature: enveloped, areaname: this.featName ,originalData: formattedfeat}
            });
        
            dialogRef.afterClosed().subscribe(data => {
              $('#featureTable tr').each(function(i, elem) {
                // console.log("Callingg");
                
                // let $chkbox = $(this).find('input[type="checkbox"]');
                
                // var checked = $(this).is(':checked');
                self.bboxstatusDisable = true;
                self.convexstatusDisable = true;
                // console.log(self.bboxstatusDisable);
        
                $('input[type="checkbox"]').prop('checked', false);
                
              });
            });
    });
 

    

  }

  convertCollectionToConvexHull(){
   
  let self = this;
    let featColl= {
      "type": "FeatureCollection",
      "features": this.featureCollectionEnvelop
    }  

    var enveloped:any= turf.convex(featColl)
    // let enveloped:any = turf.envelope(featColl);
    let locLat;
    let locLong;
    
      locLat = enveloped.geometry.coordinates[0][0][1];
      locLong = enveloped.geometry.coordinates[0][0][0];
    
    
    this.locationService.geoCodePoint(locLat,locLong).subscribe(data =>{
      // console.log(data);
            this.featName = data.display_name;
            let formattedfeat = {
              "obid":this.dataService.getAfeatureID(),
              "type": "Feature",
              "properties": {
                "name": "Sample name"
              },
              "geometry": enveloped.geometry
            }
        
            const dialogRef = this.dialog.open(EditfeatureComponent, {
              width: '98vw',
              maxWidth: '98vw',
              data: { feature: enveloped, areaname: this.featName ,originalData: formattedfeat}
            });
        
            dialogRef.afterClosed().subscribe(data => {
              $('#featureTable tr').each(function(i, elem) {
                // console.log("Callingg");
                
                // let $chkbox = $(this).find('input[type="checkbox"]');
                
                // var checked = $(this).is(':checked');
                self.bboxstatusDisable = true;
                self.convexstatusDisable = true;
                // console.log(self.bboxstatusDisable);
                
                $('input[type="checkbox"]').prop('checked', false);
                
              });
            });
    });
 
    


    

  }


}
