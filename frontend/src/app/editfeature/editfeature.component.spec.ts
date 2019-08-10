import { async, ComponentFixture, TestBed } from '@angular/core/testing';
import { APP_BASE_HREF } from '@angular/common';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { routing } from '../app.routing';
import { HeaderComponent } from '../header/header.component';
import {FileuploadComponent} from '../fileupload/fileupload.component';
import {ObjectlistComponent} from '../objectlist/objectlist.component';
import { ObjecteditComponent } from '../objectedit/objectedit.component';
import { NewobjectComponent} from '../newobject/newobject.component';
import {MapcComponent} from '../mapc/mapc.component';
import {FeaturelistComponent} from '../featurelist/featurelist.component';
import { DemoMaterialModule } from '../app.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import {EditfeatureComponent} from './editfeature.component';
import {
  MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  VERSION,
  MatSnackBar
} from '@angular/material';
describe('EditfeatureComponent', () => {
  
  let component: EditfeatureComponent;
  let fixture: ComponentFixture<EditfeatureComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[routing,
        DemoMaterialModule,FormsModule, ReactiveFormsModule,
        HttpClientModule,BrowserAnimationsModule ],
      declarations: [
        HeaderComponent,
        FileuploadComponent,
        ObjectlistComponent,
        ObjecteditComponent,
        NewobjectComponent,
        MapcComponent,
        FeaturelistComponent,
        EditfeatureComponent
      ],
      providers: [
        { provide: APP_BASE_HREF, useValue : '/' },
        {
          provide: LocationStrategy, useClass: HashLocationStrategy
      },
      {provide: MatDialogRef, useValue: {}},
      {
        provide: MAT_DIALOG_DATA,
        useValue: {} // Add any data you wish to test if it is passed/used correctly
      }
    ]
    }).compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(EditfeatureComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create the EditfeatureComponent', () => {
    expect(component).toBeTruthy();
  });

  it('buffer-size-add-option should should present', () => {
    const app = fixture.debugElement.nativeElement;
    const bufferEl = app.querySelector('#buffer-size-add-option'); 
    expect(bufferEl).toBeTruthy();
  });

  it('download-btn-from-editfeature should present', () => {
    const app = fixture.debugElement.nativeElement;
    const downEl = app.querySelector('#download-btn-from-editfeature'); 
    expect(downEl).not.toBeFalsy();
  });

  it('Map component should present', () => {
    const app = fixture.debugElement.nativeElement;
    const mapEl = app.querySelector('#feat-edit-map'); 
    expect(mapEl).not.toBeFalsy();
  });

});
