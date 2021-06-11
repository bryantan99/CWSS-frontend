import {Component, OnInit} from '@angular/core';
import {NewsfeedService} from "./newsfeed.service";
import {finalize} from "rxjs/operators";
import {NewsApiResponseModel} from "../../models/news-api-response-model";

@Component({
  selector: 'app-newsfeed',
  templateUrl: './newsfeed.component.html'
})
export class NewsfeedComponent implements OnInit {

  newsApiResponseModel: NewsApiResponseModel;
  isLoading: boolean;
  pageIndex: number;
  readonly PAGE_SIZE: number = 9;
  totalResult: number;

  constructor(private newsfeedService: NewsfeedService) {
  }

  ngOnInit(): void {
    this.initPagination();
    this.getHealthNews();
  }

  public getHealthNews() {
    this.isLoading = true;
    this.newsfeedService.getSearchedHealthNews("Malaysia health", this.pageIndex.toString(10), this.PAGE_SIZE.toString(10))
      .pipe(finalize(() => {
        this.isLoading = false;
      }))
      .subscribe(resp => {
        if (resp.status === "ok") {
          this.newsApiResponseModel = resp;
          this.updateTotalResult();
        }
      }, error => {
        console.log("There's an error when using newsAPI to get news.", error);
        this.newsApiResponseModel = null;
        this.updateTotalResult();
      })
  }

  pageIndexChange(newIndex: number) {
    this.getHealthNews();
  }

  private initPagination() {
    this.pageIndex = 1;
  }

  private updateTotalResult() {
    if (!this.newsApiResponseModel) {
      this.totalResult = 0;
      return;
    }

    if (this.newsApiResponseModel.totalResults > 100) {
      const pageCount = Math.floor(100 / this.PAGE_SIZE);
      this.totalResult = pageCount * this.PAGE_SIZE;
    } else {
      this.totalResult = this.newsApiResponseModel.totalResults;
    }
  }
}
