import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
@Injectable({
  providedIn: 'root'
})
export class LocationService {

  private serviceUrl: string;

	constructor(private http: HttpClient) { 
		this.serviceUrl = "https://nominatim.openstreetmap.org";
	}

	/* https://wiki.openstreetmap.org/wiki/Nominatim */
	/* https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=-34.44076&lon=-58.70521 */

	geoCodePoint(lat: number, lon: number): Observable<any> {
    const endpoint = `${this.serviceUrl}/reverse?format=jsonv2&lat=${lat}&lon=${lon}`;
    // console.log(endpoint);
    return this.http.get<any>(endpoint).pipe(
      catchError(this.handleError)
    );
}


	geoCodeString(address: string): Observable<any> {
		const endpoint = `${this.serviceUrl}/search?q=${address}&format=jsonv2&polygon_geojson=1`;
		return this.http.get(endpoint).pipe(
      catchError(this.handleError)
    );
  }
  


  private handleError(error: any) {
    console.error('server error:', error);
    if (error.error instanceof Error) {
      const errMessage = error.error.message;
      return Observable.throw(errMessage);
    }
    return Observable.throw(error || 'Node.js server error');
  }
}
