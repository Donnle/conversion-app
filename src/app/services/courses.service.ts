import {Injectable} from '@angular/core';
import {HttpClient} from "@angular/common/http";
import {BehaviorSubject, map, Observable, of} from "rxjs";
import {CoursesInfo, CourseResponse, Course, CourseValue} from "../interfaces";

@Injectable({
  providedIn: 'root'
})
export class CoursesService {
  courses$: BehaviorSubject<CoursesInfo> = new BehaviorSubject<CoursesInfo>({});
  private readonly API_KEY = 'bxtozU0xHjRhAFH5opYwH76lKl2tJF3GUb4kD8UN'

  constructor(private http: HttpClient) {
  }

  get courses() {
    return this.courses$.getValue()
  }

  set courses(coursesInfo: CoursesInfo) {
    this.courses$.next(coursesInfo)
  }

  getCourse(source: string, currencies: string[]): Observable<CoursesInfo> {
    console.log('source:', source, 'currencies:', currencies)
    const neededCurrencies = this.removeExistingCurrencies(source, currencies)

    console.log('neededCurrencies: ', neededCurrencies)
    if (neededCurrencies.length === 0) {
      return of(this.courses);
    }

    return this.getCourseRequest(source, neededCurrencies).pipe(map(
      (response: CourseResponse) => {
        const normalizedResponse = this.normalizeCourseResponse(response)
        return this.getAllCourses(source, neededCurrencies, normalizedResponse)
      }
    ))
  }

  private removeExistingCurrencies(source: string, currencies: string[]): string[] {
    const courses = this.courses
    let result: string[] = []

    currencies.forEach((currency: string) => {
      if (courses[source]?.[currency]) {
        return
      }
      result.push(currency)
    })

    return result
  }

  private getAllCourses(source: string, currencies: string[], rates: Course): CoursesInfo {
    const courses: CoursesInfo = this.courses
    const revertedCourses: CoursesInfo = this.calculateRevertCourses(source, rates)

    courses[source] = {...courses[source], ...rates}

    currencies.forEach((currency: string) => {
      courses[currency] = {...courses[currency], ...revertedCourses[currency]}
    })

    return courses
  }

  private normalizeCourseResponse(response: CourseResponse): Course {
    const responseValues: CourseValue[] = Object.values(response.data)

    let result: Course = {}

    responseValues.forEach((value: CourseValue) => {
      result[value.code] = value.value
    })

    return result
  }

  private calculateRevertCourses(source: string, courses: Course): CoursesInfo {
    const coursesEntries = Object.entries(courses)

    let result: CoursesInfo = {}

    coursesEntries.forEach(([currency, value]) => {
      result[currency] = {
        [source]: 1 / value
      }
    })

    return result
  }

  private getCourseRequest(source: string, currencies: string[]): Observable<CourseResponse> {
    return this.http.get<CourseResponse>(`https://api.currencyapi.com/v3/latest`, {
      params: {
        apikey: this.API_KEY,
        base_currency: source,
        currencies: currencies.join(',')
      }
    })
  }
}
