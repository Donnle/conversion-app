import {Component, OnInit} from '@angular/core';
import {CoursesInfo} from '../../interfaces';
import {CoursesService} from "../../services/courses.service";
import {skip} from "rxjs";

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  readonly sourceCurrency = 'UAH'
  readonly currencies = ['USD', 'EUR']

  courses: CoursesInfo;

  constructor(private coursesService: CoursesService) {
  }

  ngOnInit() {
    this.coursesService.getCourse(this.sourceCurrency, this.currencies).subscribe({
      next: (courses: CoursesInfo) => (this.coursesService.courses = courses)
    })

    this.coursesService.courses$.pipe(skip(1)).subscribe({
      next: (courses: CoursesInfo) => (this.courses = courses)
    })
  }
}
