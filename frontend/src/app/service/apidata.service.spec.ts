import {
    HttpClientTestingModule,
    HttpTestingController,
} from '@angular/common/http/testing';
import { TestBed } from '@angular/core/testing';

import { ApidataService } from './apidata.service';
import {
    API_ENDPOINT
} from '../app.constants';
describe('LocationService', () => {
    let service: ApidataService;
    let httpMock: HttpTestingController;
    let serviceUrl = "https://nominatim.openstreetmap.org";
    let searchText = "Tallinn,Kesklinna linnaosa,Tallinn,Harju maakond,Estonia";

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [ApidataService],
        });

        // inject the service
        service = TestBed.get(ApidataService);
        httpMock = TestBed.get(HttpTestingController);
    });

    afterEach(() => {
        service = null;
        httpMock.verify();
    });

    let objectList = [{ id: 1, name: 'Object001' }, { id: 2, name: 'Object002' }, { id: 3, name: 'Object003' }];
    let inputObject = { name: 'Object007' };
    let returnObject = { id: 2, name: 'Object002' };

    it('should return object list', () => {
        const endpoint = API_ENDPOINT + 'userobject';
        service.getAllObject().subscribe(
            (data: any) => {
                expect(data.success).toBe(true);
                expect(data.data.length).not.toBe(null);
                expect(data.data.length).toBe(3);
            },
            (error: any) => { }
        );

        const req = httpMock.expectOne({
            url: endpoint  
        });

        expect(req.request.method).toEqual('GET');

        req.flush({
            success: true,
            data: objectList
        });
    });


    it('should return single object details', () => {
        const endpoint = API_ENDPOINT + 'userobject';
        const id:number = 2;
        service.getObject(id).subscribe(
            (data: any) => {
                expect(data.success).toBe(true);
                expect(data.data.id).toBe(2);
            },
            (error: any) => { }
        );

        const req = httpMock.expectOne({
            url: endpoint+"/"+id  
        });
        expect(req.request.url).toEqual(endpoint+"/2");
        expect(req.request.method).toEqual('GET');

        req.flush({
            success: true,
            data: returnObject
        });
    });

    it('should add object in list', () => {
        const endpoint = API_ENDPOINT + 'userobject';

        service.addObject(inputObject).subscribe(
            (data: any) => {
                expect(data.success).toBe(true);
                expect(data.data.length).not.toBe(null);
            },
            (error: any) => { }
        );

        const req = httpMock.expectOne({
            url: endpoint  
        });

        expect(req.request.method).toEqual('POST');

        req.flush({
            success: true,
            data: inputObject
        });
    });

    it('should update an object details', () => {
        const endpoint = API_ENDPOINT + 'userobject';
        const id:number = 2;
        service.updateObject(id,returnObject).subscribe(
            (data: any) => {
                expect(data.success).toBe(true);
                expect(data.data.length).not.toBe(null);
            },
            (error: any) => { }
        );

        const req = httpMock.expectOne({
            url: endpoint+"/"+id  
        });
        expect(req.request.url).toEqual(endpoint+"/2");
        expect(req.request.method).toEqual('PUT');

        req.flush({
            success: true,
            data: inputObject
        });
    });


    it('should delete an object details', () => {
        const endpoint = API_ENDPOINT + 'userobject';
        const id:number = 2;
        service.deleteObject(id).subscribe(
            (data: any) => {
                expect(data.success).toBe(true);
                expect(data.data.length).not.toBe(null);
            },
            (error: any) => { }
        );

        const req = httpMock.expectOne({
            url: endpoint+"/"+id  
        });
        expect(req.request.url).toEqual(endpoint+"/2");
        expect(req.request.method).toEqual('DELETE');

        req.flush({
            success: true,
            data: inputObject
        });
    });

});

