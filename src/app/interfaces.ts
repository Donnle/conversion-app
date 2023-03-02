import {FormControl} from "@angular/forms";

export interface CoursesInfo {
  [key: string]: Course
}

export interface Course {
  [key: string]: number
}

export interface CourseValue {
  code: string,
  value: number
}

export interface CourseResponse {
  data: {
    [key: string]: CourseValue
  },
}

export interface ConversionForm {
  firstInput: FormControl<number | null>,
  secondInput: FormControl<number | null>,
  firstSelect: FormControl<string | null>,
  secondSelect: FormControl<string | null>,
}
