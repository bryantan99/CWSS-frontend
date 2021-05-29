import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class NewsfeedService {

  private NEWS_API_KEY: string = "094d9235385648448cbe6cf0e88cca46";

  constructor(private http: HttpClient) { }

  getHealthNews(country?: string, category?: string):Observable<any> {
    let urlLink = "https://newsapi.org/v2/top-headlines?apiKey=" + this.NEWS_API_KEY;

    if (country) {
      urlLink += "&country=" + country;
    }

    if (category) {
      urlLink += "&category=" + category;
    }

    return this.http.get(urlLink);
  }
}
