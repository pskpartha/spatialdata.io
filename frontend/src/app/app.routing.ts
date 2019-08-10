import { Routes, RouterModule } from '@angular/router';

import { FileuploadComponent } from './fileupload/fileupload.component';
import { ObjectlistComponent } from './objectlist/objectlist.component';
import { NewobjectComponent } from './newobject/newobject.component';

const appRoutes: Routes = [
    {path: '', component: FileuploadComponent },
    {path: 'objectlist', component: ObjectlistComponent},
    {path: 'newobject', component: NewobjectComponent},
    {path: '**', redirectTo: '' }
];

export const routing = RouterModule.forRoot(appRoutes);