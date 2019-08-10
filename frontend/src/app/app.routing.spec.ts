import { Location } from '@angular/common';
import { TestBed, fakeAsync, tick } from '@angular/core/testing';
import { Router } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';
import { routing } from './app.routing';
import { AppModule } from './app.module';
import { APP_BASE_HREF } from '@angular/common';
import { LocationStrategy, HashLocationStrategy } from '@angular/common';
describe('The App Routing', () => {
    let router: Router;
    let location: Location;

    beforeEach(() => {
        TestBed.configureTestingModule({
            imports: [AppModule, routing],
            providers: [
                { provide: APP_BASE_HREF, useValue: '/' },
                {
                    provide: LocationStrategy, useClass: HashLocationStrategy
                }
            ]
        });

        router = TestBed.get(Router) as Router;
        location = TestBed.get(Location) as Location;
    });

    it('automatically redirects to home when the app starts',
        fakeAsync(() => {
            router.navigate(['']);
            tick();
            expect(location.path()).toBe('');
        })
    );

    it('navigate to /objectlist when click on ObjectList ',
        fakeAsync(() => {
            router.navigate(['/objectlist']);
            tick();
            expect(location.path()).toBe('/objectlist');
        })
    );

    it('navigate to /newobject when click on CreateIbject ',
        fakeAsync(() => {
            router.navigate(['/newobject']);
            tick();
            expect(location.path()).toBe('/newobject');
        })
    );

    it('navigate to home when nothing match with route ',
        fakeAsync(() => {
            router.navigate(['/fakeroute']);
            tick();
            expect(location.path()).toBe('');
        })
    );

});