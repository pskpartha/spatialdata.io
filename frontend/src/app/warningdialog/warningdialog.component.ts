import { Component, OnInit,Inject } from '@angular/core';
import {MatDialog,
  MatDialogRef,
  MAT_DIALOG_DATA,
  VERSION,
  MatSnackBar
} from '@angular/material';
@Component({
  selector: 'app-warningdialog',
  templateUrl: './warningdialog.component.html',
  styleUrls: ['./warningdialog.component.css']
})
export class WarningdialogComponent implements OnInit {

  constructor(
    public dialogRef: MatDialogRef<WarningdialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any) {}

  // onNoClick(): void {
  //   this.dialogRef.close();
  // }

  ngOnInit() {
  }

}
