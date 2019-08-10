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
describe('NewobjectComponent', () => {
  
  let component: NewobjectComponent;
  let fixture: ComponentFixture<NewobjectComponent>;


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
    fixture = TestBed.createComponent(NewobjectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create the NewobjectComponent', () => {
    expect(component).toBeTruthy();
  });

  it('Search option should should present', () => {
    const app = fixture.debugElement.nativeElement;
    const searchEl = app.querySelector('#search-item'); 
    expect(searchEl).toBeTruthy();
  });

  it('Map component should present', () => {
    const app = fixture.debugElement.nativeElement;
    const mapEl = app.querySelector('#map'); 
    expect(mapEl).not.toBeFalsy();
  });
});
