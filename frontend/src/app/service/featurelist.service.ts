import { Injectable } from '@angular/core';
import { Observable, Subject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class FeaturelistService {
    private subject = new Subject<any>();

    sendFeature(message:any) {
        this.subject.next(message);
    }

    clearFeatures() {
        this.subject.next();
    }

    getFeature(): Observable<any> {
        return this.subject.asObservable();
    }
}