import {ArticleModel} from "./article-model";

export interface NewsApiResponseModel {
  status: string;
  totalResults: number;
  articles: ArticleModel[]
}
