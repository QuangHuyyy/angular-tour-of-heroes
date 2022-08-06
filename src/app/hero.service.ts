import {Injectable} from '@angular/core';
import {Hero} from "../hero";
import {Observable, of} from "rxjs";
import {MessageService} from "./message.service";
import {HttpClient, HttpHeaders} from "@angular/common/http";
import {catchError, tap} from "rxjs/operators";

@Injectable({
  providedIn: 'root'
})
export class HeroService {
  private heroesUrl = 'api/heroes';  // URL to web api

  httpOptions = {
    headers: new HttpHeaders({'Content-Type': 'application/json'})
  };

  constructor(
    private http: HttpClient,
    private messageService: MessageService
  ) {
  }

  getHeroes(): Observable<Hero[]> {
    // const heroes = of(HEROES); // of(Heroes) <=> Observable<Hero[]>
    // this.messageService.add("Hero service: fetched heroes");
    // return heroes;

    // using HttpClient
    return this.http.get<Hero[]>(this.heroesUrl)
      .pipe(
        tap(_ => {
          console.log(_);
          this.log('fetched heroes');
        }),
        catchError(this.handleError<Hero[]>('getHeroes', []))
      );
  }

  getHero(id: number): Observable<Hero> {
    // const hero = HEROES.find(h => h.id === id)!;
    // this.messageService.add(`HeroService: fetched hero id = ${hero === undefined ? undefined : hero.id}`);
    // return of(hero);

    const url = `${this.heroesUrl}/${id}`;
    return this.http.get<Hero>(url)
      .pipe(
        tap(_ => {
          console.log(_);
          this.log(`fetched hero id = ${id}`);
        }),
        catchError(this.handleError<Hero>(`getHero id = ${id}`))
      );
  }

  updateHero(hero: Hero): Observable<any> {
    return this.http.put(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap(_ => {
          console.log(this.httpOptions);
          this.log(`Update hero id = ${hero.id}`)
        }),
        catchError(this.handleError<any>('updateHero'))
      )
  }

  addHero(hero: Hero): Observable<Hero> {
    return this.http.post<Hero>(this.heroesUrl, hero, this.httpOptions)
      .pipe(
        tap((newHero: Hero) => this.log(`added hero w/ id=${newHero.id}`)),
        catchError(this.handleError<Hero>('addHero'))
      )
  }

  deleteHero(id: number): Observable<Hero> {
    const url = `${this.heroesUrl}/${id}`;
    return this.http.delete<Hero>(url, this.httpOptions)
      .pipe(
        tap(_ => this.log(`deleted hero id=${id}`)),
        catchError(this.handleError<Hero>('deleteHero'))
      );
  }

  searchHero(keyword: string): Observable<Hero[]> {
    if(!keyword.trim()){
      return of([]);
    }else {
      return this.http.get<Hero[]>(`${this.heroesUrl}/?name=${keyword}`)
        .pipe(
          tap(x => x.length ? this.log(`found heroes matching "${ keyword }"`)
          : this.log(`no heroes matching "${keyword}"`)),
          catchError(this.handleError<Hero[]>('searchHeroes', []))
        );
    }
  }

  /**
   * Handle Http operation that failed.
   * Let the app continue.
   *
   * @param operation - name of the operation that failed
   * @param result - optional value to return as the observable result
   */
  private handleError<T>(operation = 'operation', result?: T) {
    return (error: any): Observable<T> => {

      // TODO: send the error to remote logging infrastructure
      console.error(error); // log to console instead

      // TODO: better job of transforming error for user consumption
      this.log(`${operation} failed: ${error.message}`);

      // Let the app keep running by returning an empty result.
      return of(result as T);
    };
  }

  log(message: string): void {
    this.messageService.add(`HeroService: ${message}`);
  }
}
