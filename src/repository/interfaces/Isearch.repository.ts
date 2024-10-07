export interface ISearchRepository {
  advancedSearch(
    tags?: string[],
    fileName?: string,
    contentType?: string
  ): Promise<any[]>;
}
