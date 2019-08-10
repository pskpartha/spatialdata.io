import { TestBed, async } from '@angular/core/testing';
import { AppComponent } from './app.component';
import { APP_BASE_HREF } from '@angular/common';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { routing } from './app.routing';
import { HeaderComponent } from './header/header.component';
import {FileuploadComponent} from './fileupload/fileupload.component';
import {ObjectlistComponent} from './objectlist/objectlist.component';
import { ObjecteditComponent } from './objectedit/objectedit.component';
import { NewobjectComponent} from './newobject/newobject.component';
import {MapcComponent} from './mapc/mapc.component';
import {FeaturelistComponent} from './featurelist/featurelist.component';
import { DemoMaterialModule } from './app.module';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {HttpClientModule} from '@angular/common/http';
describe('AppComponent', () => {
  
  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports:[routing,
        DemoMaterialModule,FormsModule, ReactiveFormsModule,
        HttpClientModule],
      declarations: [
        AppComponent,
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

  it('Should create the app component', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.componentInstance;
    expect(app).toBeTruthy();
  }));
  
  it('Header component should be there', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.nativeElement;
    const headerEl = app.querySelector('app-header'); 
    expect(headerEl).toBeTruthy();
  }));

  it('Router Outlet should be there', async(() => {
    const fixture = TestBed.createComponent(AppComponent);
    const app = fixture.debugElement.nativeElement;
    const routerEl = app.querySelector('router-outlet'); 
    expect(routerEl).toBeTruthy();
  }));

});
