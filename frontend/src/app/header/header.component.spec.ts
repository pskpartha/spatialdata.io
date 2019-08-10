import { inject, async, ComponentFixture, TestBed } from '@angular/core/testing';
import { Router } from '@angular/router';
import { HeaderComponent } from './header.component';
import { APP_BASE_HREF } from '@angular/common';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
import { Routes, RouterModule } from '@angular/router';
import { routing } from '../app.routing';
import { FileuploadComponent } from '../fileupload/fileupload.component';
import { ObjectlistComponent } from '../objectlist/objectlist.component';
import { ObjecteditComponent } from '../objectedit/objectedit.component';
import { NewobjectComponent } from '../newobject/newobject.component';
import { MapcComponent } from '../mapc/mapc.component';
import { FeaturelistComponent } from '../featurelist/featurelist.component';
import { DemoMaterialModule } from '../app.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';
import { Location, CommonModule } from '@angular/common';
import { RouterTestingModule } from '@angular/router/testing';
import { By } from '@angular/platform-browser';
describe('HeaderComponent', () => {

  let component: HeaderComponent;
  let fixture: ComponentFixture<HeaderComponent>;


  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [routing,
        DemoMaterialModule, FormsModule, ReactiveFormsModule,
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
        { provide: APP_BASE_HREF, useValue: '/' },
        {
          provide: LocationStrategy, useClass: HashLocationStrategy
        }
      ]
    }).compileComponents();
  }));


  beforeEach(() => {
    fixture = TestBed.createComponent(HeaderComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('Should create the HeaderComponent', () => {
    expect(component).toBeTruthy();
  });

  it('Home button will go to url', async(inject([Router, Location], (router: Router, location: Location) => {
    fixture.detectChanges();
    fixture.debugElement.query(By.css('#homeLinkId')).nativeElement.click();
    fixture.whenStable().then(() => {
      expect(location.path()).toEqual('');
    });
  })));

  it('CREATE ObJECT should go to /newobject url', async(inject([Router, Location], (router: Router, location: Location) => {
    fixture.detectChanges();

    fixture.debugElement.query(By.css('#createobjectLinkId')).nativeElement.click();
    fixture.whenStable().then(() => {
      // console.log(location.path());
      expect(location.path()).toEqual('/newobject');
    });
  })));

  it('ObJECT LIST should go to /objectlist url', async(inject([Router, Location], (router: Router, location: Location) => {
    fixture.detectChanges();

    fixture.debugElement.query(By.css('#objectlistLinkId')).nativeElement.click();
    fixture.whenStable().then(() => {
      // console.log(location.path());
      expect(location.path()).toEqual('/objectlist');
    });
  })));

});
