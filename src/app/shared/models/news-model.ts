export interface NewsModel {
  source: { id: any; name: string };
  author: any;
  title: string;
  description: string;
  url: string;
  urlToImage: string;
  publishedAt: Date;
  content: string;
}
