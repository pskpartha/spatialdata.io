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
import {MapcComponent} from './mapc.component';
import {FeaturelistComponent} from '../featurelist/featurelist.component';
import { DemoMaterialModule } from '../app.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
describe('MapcComponent', () => {
  
  let component: MapcComponent;
  let fixture: ComponentFixture<MapcComponent>;


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
    fixture = TestBed.createComponent(MapcComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create the MapComponent', () => {
    expect(component).toBeTruthy();
  });

  it('Map id should be there', () => {
    const app = fixture.debugElement.nativeElement;
    const routerEl = app.querySelector('#geomap'); 
    expect(routerEl).toBeTruthy();
  });
  it('Layer change option for Map should be there', () => {
    const app = fixture.debugElement.nativeElement;
    const routerEl = app.querySelector('#layer-change-option-id'); 
    expect(routerEl).toBeTruthy();
  });
});
