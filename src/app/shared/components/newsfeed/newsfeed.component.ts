import {Component, OnInit} from '@angular/core';
import {NewsfeedService} from "./newsfeed.service";
import {NewsModel} from "../../models/news-model";
import {finalize} from "rxjs/operators";

@Component({
    selector: 'app-newsfeed',
    templateUrl: './newsfeed.component.html'
})
export class NewsfeedComponent implements OnInit {

    healthNews: NewsModel[];
    isLoading: boolean;

    constructor(private newsfeedService: NewsfeedService) {
    }

    ngOnInit(): void {
        this.getHealthNews();
    }

    public getHealthNews() {
        this.healthNews = [];
        this.isLoading = true;
        this.newsfeedService.getSearchedHealthNews("Malaysia health")
            .pipe(finalize(() => {
                this.isLoading = false;
            }))
            .subscribe(resp => {
                if (resp.status === "ok") {
                    this.healthNews = resp.articles;
                }
            }, error => {
                console.log("There's an error when using newsAPI to get news.", error);
            })
    }
}
