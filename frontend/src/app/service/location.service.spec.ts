import {
  HttpClientTestingModule,
  HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { LocationService } from './location.service';

describe('LocationService', () => {
  let service: LocationService;
  let httpMock: HttpTestingController;
  let serviceUrl = "https://nominatim.openstreetmap.org";
  let searchText = "Tallinn,Kesklinna linnaosa,Tallinn,Harju maakond,Estonia";
  beforeEach(() => {
      TestBed.configureTestingModule({
          imports: [HttpClientTestingModule],
          providers: [LocationService],
      });

      // inject the service
      service = TestBed.get(LocationService);
      httpMock = TestBed.get(HttpTestingController);
  });

  afterEach(() => {
    service = null;
    httpMock.verify();
  });



  it( 'should return place lat long data successfully', () => {
    // {"location":{"type":"Polygon","coordinates":[[[-108.22880744934083,42.085356517656066],[-108.24940681457522,42.028256541276306],[-108.15052986145021,42.02723643228265],[-108.22880744934083,42.085356517656066]]]},"analysisType":"repeated","scheduleFrequency":4,"period":12}
  
    const endpoint = `${serviceUrl}/search?q=${searchText}&format=jsonv2&polygon_geojson=1`;
    service.geoCodeString(searchText).subscribe(
      (data: any) => { 
        expect(data.success).toBe(true);
        expect(data.message[0].lat.length).not.toBe(null);
        expect(data.message[0].lon.length).not.toBe(null);
      },
      (error: any) => {}
    );

    const req = httpMock.expectOne({
      url: endpoint  // have to fix
    });

    expect(req.request.method).toEqual('GET');

    req.flush({
      success: true,
      message: [
        {
          boundingbox: ["59.3518076", "59.5915769", "24.55017", "24.9262831"],
          category: "place",
          display_name: "Tallinn, Kesklinna linnaosa, Tallinn, Harju maakond, Estonia",
          lat: "59.4250354",
          licence: "Data © OpenStreetMap contributors, ODbL 1.0. https://osm.org/copyright",
          lon: "24.7438692605109",
          osm_id: 2164745,
          osm_type: "relation",
          place_id: 239285562,
          place_rank: 16,
          type: "city"
        }
      ]
    });
  });

  it( 'should return place name successfully', () => {

    let lat:number = 59.4250354;
    let lon:number = 24.7438692605109;

    const endpoint = `${serviceUrl}/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    service.geoCodePoint(lat,lon).subscribe(
      (data: any) => { 
        expect(data.success).toBe(true);
        expect(data.message[0].display_name).toBe("67a, Pärnu mnt, Kesklinn, Tallinn, Kesklinna linnaosa, Tallinn, Harju maakond, 10131, Estonia");
      },
      (error: any) => {}
    );

    const req = httpMock.expectOne({
      url: endpoint  // have to fix
    });

    expect(req.request.method).toEqual('GET');

    req.flush({
      success: true,
      message: [
        {
          boundingbox: ["59.3518076", "59.5915769", "24.55017", "24.9262831"],
          category: "place",
          display_name: "67a, Pärnu mnt, Kesklinn, Tallinn, Kesklinna linnaosa, Tallinn, Harju maakond, 10131, Estonia",
          lat: "59.4250354",
          lon: "24.7438692605109",
          city:"Tallinn"
        }
      ]
    });
  });
});

