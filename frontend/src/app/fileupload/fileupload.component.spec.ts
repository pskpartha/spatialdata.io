import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { routing } from '../app.routing';
import { HeaderComponent } from '../header/header.component';
import {FileuploadComponent} from './fileupload.component';
import {ObjectlistComponent} from '../objectlist/objectlist.component';
import { ObjecteditComponent } from '../objectedit/objectedit.component';
import { NewobjectComponent} from '../newobject/newobject.component';
import {MapcComponent} from '../mapc/mapc.component';
import {FeaturelistComponent} from '../featurelist/featurelist.component';
import { DemoMaterialModule } from '../app.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
describe('FileuploadComponent', () => {
  
  let component: FileuploadComponent;
  let fixture: ComponentFixture<FileuploadComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[routing,
        DemoMaterialModule,FormsModule, ReactiveFormsModule,
        HttpClientModule],
      declarations: [
        HeaderComponent,
        FileuploadComponent,
        ObjectlistComponent,
        ObjecteditComponent,
        NewobjectComponent,
        MapcComponent,
        FeaturelistComponent
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' },
        {
          provide: LocationStrategy, useClass: HashLocationStrategy
      }
    ]
    }).compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(FileuploadComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create the FileUploadComponent', () => {
    expect(component).toBeTruthy();
  });

  it('Map component should should present', () => {
    const app = fixture.debugElement.nativeElement;
    const mapEl = app.querySelector('app-mapc'); 
    expect(mapEl).toBeTruthy();
  });

  it('Feature List component should present', () => {
    const app = fixture.debugElement.nativeElement;
    const featurelistEl = app.querySelector('app-featurelist'); 
    expect(featurelistEl).not.toBeFalsy();
  });

  it('GeoJSON upload button should present', () => {
    const app = fixture.debugElement.nativeElement;
    const btnEl = app.querySelector('#geojson-uploadBtn'); 
    expect(btnEl).not.toBeFalsy();
  });

  it('KML upload button should present', () => {
    const app = fixture.debugElement.nativeElement;
    const btnEl = app.querySelector('#kml-uploadBtn'); 
    expect(btnEl).not.toBeFalsy();
  });
});
