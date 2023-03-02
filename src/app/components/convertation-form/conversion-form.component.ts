import {Component, OnDestroy, OnInit} from '@angular/core';
import {FormControl, FormGroup} from "@angular/forms";
import {CoursesService} from "../../services/courses.service";
import {ConversionForm, CoursesInfo} from "../../interfaces";
import {Subscription} from "rxjs";

@Component({
  selector: 'app-conversion-form',
  templateUrl: './conversion-form.component.html',
  styleUrls: ['./conversion-form.component.scss']
})
export class ConversionFormComponent implements OnInit, OnDestroy {
  readonly currencies = ['USD', 'UAH', 'EUR', 'PLN']

  conversionForm: FormGroup;
  courses: CoursesInfo;
  isFirstLastChanged: boolean;

  private coursesSubscription: Subscription;
  private readonly COUNT_NUMBERS_AFTER_DOT = 4

  constructor(private currencyService: CoursesService) {
  }

  ngOnInit() {
    this.currencyService.getCourse(this.currencies[0], [this.currencies[1]]).subscribe({
      next: (courses: CoursesInfo) => {
        this.currencyService.courses = courses
      }
    })

    this.coursesSubscription = this.currencyService.courses$.subscribe({
      next: (courses: CoursesInfo) => {
        console.log(courses)
        this.courses = courses
      }
    })

    this.conversionForm = new FormGroup<ConversionForm>({
      firstInput: new FormControl(0),
      secondInput: new FormControl(0),
      firstSelect: new FormControl(this.currencies[0]),
      secondSelect: new FormControl(this.currencies[1]),
    })
  }

  ngOnDestroy() {
    this.coursesSubscription.unsubscribe()
  }

  onChange(isFirst?: boolean) {
    if (isFirst != undefined) {
      this.isFirstLastChanged = isFirst
    }

    this.configureFields(this.isFirstLastChanged)
  }

  private roundToDecimalPlaces(number: number, decimalPlaces: number): number {
    const factor = Math.pow(10, decimalPlaces);
    return Math.round(number * factor) / factor;
  }

  private configureFields(isFirst: boolean) {
    const {firstSelect, secondSelect} = this.conversionForm.value

    const isCourseExist = !!this.courses[firstSelect]?.[secondSelect]

    if (isCourseExist) {
      this.setInputsValues(isFirst)
    } else {
      this.currencyService.getCourse(firstSelect, [secondSelect]).subscribe({
        next: (courses) => {
          this.currencyService.courses = courses
          this.setInputsValues(isFirst)
        }
      })
    }
  }

  private setInputsValues(isFirst: boolean = this.isFirstLastChanged) {
    const {firstInput, secondInput, firstSelect, secondSelect} = this.conversionForm.value

    if (isFirst) {
      const convertedValue = this.roundToDecimalPlaces(this.courses[firstSelect][secondSelect] * firstInput, this.COUNT_NUMBERS_AFTER_DOT)
      this.conversionForm.patchValue({secondInput: convertedValue}, {emitEvent: false})
      console.log(`${firstInput} ${firstSelect} => ${convertedValue} ${secondSelect}`)
    } else {
      const convertedValue = this.roundToDecimalPlaces(this.courses[secondSelect][firstSelect] * secondInput, this.COUNT_NUMBERS_AFTER_DOT)
      this.conversionForm.patchValue({firstInput: convertedValue}, {emitEvent: false})
      console.log(`${secondInput} ${secondSelect} => ${convertedValue} ${firstSelect}`)
    }
  }
}
