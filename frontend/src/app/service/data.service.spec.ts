import {
    HttpClientTestingModule,
    HttpTestingController
} from "@angular/common/http/testing";
import { TestBed, inject, fakeAsync, tick } from "@angular/core/testing";
import { HttpClient } from "@angular/common/http";
import { DataService } from './data.service';
import { geometry } from "@turf/turf";

describe('DataService', () => {
    let httpTestingController: HttpTestingController;
    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [HttpClientTestingModule],
            providers: [DataService]
        });
    });

    it('DataService should be created', inject([DataService], (service: DataService) => {
        expect(service).toBeTruthy();
    }));

    it('convertToPolyGon() should convert Point or LineString to Polygon', inject([DataService], (service: DataService) => {
        let input: any = { "type": "Feature", "properties": { "name": "Tannu, Räsna küla, Räsna, Põltsamaa vald, Jõgeva maakond, Estonia" }, "geometry": { "type": "Point", "coordinates": [25.831378152679747, 58.68416902687926] } };
        let result: any = service.convertToPolyGon(input, 20);
        // input geometry type should not same with result geometry type
        expect(input.geometry.type).not.toEqual(result.geometry.type);
    }));


    it('convertToPolyGon() will not convert if it is Polygon', inject([DataService], (service: DataService) => {
        // if input geometry type polygon then data should remain same
        let inputPolygon: any = {
            "type": "Feature",
            "properties": {},
            "geometry": {
                "type": "Polygon",
                "coordinates": [
                    [
                        [
                            25.303509235382077,
                            54.693864097154055
                        ],
                        [
                            25.303444862365723,
                            54.693082804280124
                        ],
                        [
                            25.305140018463135,
                            54.69298359141017
                        ],
                        [
                            25.305075645446777,
                            54.69396330787116
                        ],
                        [
                            25.303359031677246,
                            54.69387649850695
                        ],
                        [
                            25.303509235382077,
                            54.693864097154055
                        ]
                    ]
                ]
            }
        };
        let resultPolygon: any = service.convertToPolyGon(inputPolygon);
        expect(inputPolygon.geometry.type).toEqual(resultPolygon.geometry.type);
    }));

    it('multiPointToPoints() should convert  MultiPoints->Point, Point ..', inject([DataService], (service: DataService) => {
        let input:any = {
            "type": "Feature", "properties": {}, "geometry": {
                "type": "MultiPoint",
                "coordinates": [
                    [100.0, 0.0], [101.0, 1.0]
                ]
            }
        }

        let output:any = service.multiPointToPoints(input);
        // console.log("##Point",output);
        // type should different
        expect(input.geometry.type).not.toEqual(output[0].geometry.type);
        expect(input.geometry.coordinates.length).toEqual(output.length);

    }));

    it('multiLineToLines() should convert  MultiLineString->LineString, LineString ..', inject([DataService], (service: DataService) => {
        let input:any = {
            "type": "Feature", "properties": {}, "geometry": {
                "type": "MultiLineString",
                "coordinates": [
                    [ [100.0, 0.0], [101.0, 1.0] ],
                    [ [102.0, 2.0], [103.0, 3.0] ]
                ]
             }
        };

        let output:any = service.multiLineToLines(input);
        // console.log("##line",output);
        
        // type should different
        expect(input.geometry.type).not.toEqual(output[0].geometry.type);
        // console.log(input.geometry.coordinates.length);
        expect(input.geometry.coordinates.length).toEqual(output.length);
        // console.log(output.length);
    }));

    it('multiPolygoTopolygons() should convert  MultiPolygon->Polygon,Polygon ..', inject([DataService], (service: DataService) => {
        let input:any =  {
            "type": "Feature", "properties": {}, "geometry": {
            "type": "MultiPolygon",
            "coordinates": [
                [
                    [ [102.0, 2.0], [103.0, 2.0], [103.0, 3.0], [102.0, 3.0], [102.0, 2.0] ]
                ],
                [
                    [ [100.0, 0.0], [101.0, 0.0], [101.0, 1.0], [100.0, 1.0], [100.0, 0.0] ],
                    [ [100.2, 0.2], [100.8, 0.2], [100.8, 0.8], [100.2, 0.8], [100.2, 0.2] ]
                ]
            ]
         }}

        let output:any = service.multiPolygoTopolygons(input);
        // type should different
        expect(input.geometry.type).not.toEqual(output[0].geometry.type);
        // console.log(input.geometry.coordinates.length);
        expect(input.geometry.coordinates.length).toEqual(output.length);
        // console.log(output.length);
    }));

    it('geometryCollectionToSimple() should convert  GeometryCollection->Point,Polygon,LineString ..', inject([DataService], (service: DataService) => {
        let input:any =  {
            "type": "Feature", "properties": {}, "geometry": {
                "type": "GeometryCollection",
                "geometries": [
                    {
                        "type": "Point",
                        "coordinates": [100.0, 0.0]
                    },
                    {
                        "type": "LineString",
                        "coordinates": [
                            [101.0, 0.0], [102.0, 1.0]
                        ]
                    }
                ]
             }}

        let output:any = service.geometryCollectionToSimple(input);
        // type should different
        expect(input.geometry.type).not.toEqual(output[0].geometry.type);
        // console.log(input.geometry.coordinates.length);
        expect(input.geometry.geometries.length).toEqual(output.length);
        // console.log(output.length);
    }));


});
