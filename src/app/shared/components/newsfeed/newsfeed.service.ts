import { Injectable } from '@angular/core';
import {Observable} from "rxjs";
import {HttpClient, HttpParams} from "@angular/common/http";

@Injectable({
  providedIn: 'root'
})
export class NewsfeedService {

  readonly NEWS_API_KEY: string = "094d9235385648448cbe6cf0e88cca46";
  readonly NEWS_API_URL = "https://newsapi.org/v2";
  readonly NEWS_API_TOP_HEADLINES = this.NEWS_API_URL + "/top-headlines"
  readonly NEWS_API_SEARCH = this.NEWS_API_URL + "/everything"

  constructor(private http: HttpClient) { }

  getHeadlineHealthNews(country?: string, category?: string):Observable<any> {
    let params = new HttpParams().set("apiKey", this.NEWS_API_KEY);

    if (country) {
      params = params.append("country", country);
    }

    if (category) {
      params = params.append("category", category);
    }

    return this.http.get(this.NEWS_API_TOP_HEADLINES, {params: params});
  }

  getSearchedHealthNews(keyword: string): Observable<any> {
    let params = new HttpParams().set("apiKey", this.NEWS_API_KEY).set("q", keyword);
    return this.http.get(this.NEWS_API_SEARCH, {params: params})
  }
}
