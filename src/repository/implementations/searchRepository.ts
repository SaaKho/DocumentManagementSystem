import { db, documents } from "../../drizzle/schema";
import { ilike, arrayContains } from "drizzle-orm";
import { ISearchRepository } from "../interfaces/Isearch.repository";

export class SearchRepository implements ISearchRepository {
  async advancedSearch(
    tags?: string[],
    fileName?: string,
    contentType?: string
  ): Promise<any[]> {
    let query: any = db.select().from(documents);

    if (tags && tags.length > 0) {
      query = query.where(arrayContains(documents.tags as any, tags as any));
    }

    if (fileName) {
      query = query.where(ilike(documents.fileName, `%${fileName}%`));
    }

    if (contentType) {
      query = query.where(ilike(documents.contentType, `%${contentType}%`));
    }

    const results = await query.execute();
    return results;
  }
}
