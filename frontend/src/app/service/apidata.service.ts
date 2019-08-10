import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import {
  API_ENDPOINT
} from '../app.constants';
import { DataService } from './data.service';

const httpOptions = {
  headers: new HttpHeaders({
    'Content-Type': 'application/json',
    'Authorization': 'my-auth-token'
  })
};


@Injectable({
  providedIn: 'root'
})

export class ApidataService {

  constructor(private http: HttpClient, private dataService: DataService) { }

  // GET: getting all object
  getAllObject(): Observable<any> {
    return this.http.get<any>(API_ENDPOINT + 'userobject')
      .pipe(
        catchError(this.handleError)
      );
  }

  // GET: getting single object
  getObject(id: number): Observable<any> {
    return this.http.get<any>(API_ENDPOINT + 'userobject/' + id)
      .pipe(
        catchError(this.handleError)
      );
  }

  // GET: delete single object
  deleteObject(id: number): Observable<any> {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let options = {
      headers: httpHeaders
    };
    const url = API_ENDPOINT + 'userobject/' + id;
    return this.http.delete<any>(url, options)
      .pipe(
        catchError(this.handleError)
      );
  }


  // POST: add a object to the database 
  addObject(objectdetails: any): Observable<any> {
    let httpHeaders = new HttpHeaders()
      .set('Content-Type', 'application/json');
    let options = {
      headers: httpHeaders
    };
    return this.http.post<any>(API_ENDPOINT + 'userobject', objectdetails, options)
      .pipe(
        catchError(this.handleError)
      );
  }

//PUT: update object details
updateObject(id:number, objectdetails: any): Observable<any> {
  let httpHeaders = new HttpHeaders()
    .set('Content-Type', 'application/json');
  let options = {
    headers: httpHeaders
  };
  const url = API_ENDPOINT + 'userobject/' + id;
  return this.http.put<any>(url, objectdetails, options)
    .pipe(
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
