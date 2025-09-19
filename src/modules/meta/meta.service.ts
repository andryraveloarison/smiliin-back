import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { getPageInfo } from './utils/facebook/getPageInfo';
import { getAllPage } from './utils/facebook/getAllPage';

@Injectable()
export class MetaService {
  private readonly pageId = process.env.META_PAGE_ID || '276902872181203';
  private readonly token = process.env.META_ACCESS_TOKEN || 'EAAWp7ZBrZCYfgBPQoCUIkE0ZBN8wWCpPLqDTGsgB5tQsXMI09UzGdvSrBf98NvEr6LiKs4KdQgh1YaELXLEFlUmly2Vqs3hPvt5JxB8ZBA7JKu7xu7SZCCjZCMnUWQBicJZCt4nNQXN7TIlEKoRarDkfZBY8TNvGCYRjyydjUfIoPbMXUO0NGX8JCZCggxBH3BDkHJqq8nQoaU3LEaF4WA6Uj10nsja7n5J18g1urlGYZD';

  constructor(private readonly http: HttpService) {}

  async getData() {
    if (!this.token) {
      throw new Error('❌ META_ACCESS_TOKEN manquant');
    }

    const since = '2025-09-09';
    const until = '2025-09-16';

    // Métriques à récupérer
    const metrics = [
      ['page_posts_impressions', 'total'],
      ['page_posts_impressions_unique', 'unique'],
      ['page_posts_impressions_organic_unique', 'organic_unique'],
      ['page_posts_impressions_paid_unique', 'paid_unique'],
    ] as const;

    const fetchMetric = async (metric: string) => {
      const url =
        `https://graph.facebook.com/v23.0/${this.pageId}/insights` +
        `?metric=${metric}&period=day&since=${since}&until=${until}&access_token=${this.token}`;
      const { data } = await firstValueFrom(this.http.get(url));
      return data?.data?.[0]?.values ?? [];
    };

    const results = await Promise.all(metrics.map(([m]) => fetchMetric(m)));

    // Map jour -> lignes
    const byDay = new Map<string, any>();
    const toLocalDay = (endTime: string, tzOffset = 3) => {
      const d = new Date(endTime);
      d.setHours(d.getHours() + tzOffset);
      d.setUTCDate(d.getUTCDate() - 1);
      return d.toISOString().slice(0, 10);
    };

    const addSeries = (vals: any[], key: string) => {
      for (const v of vals) {
        const day = toLocalDay(v.end_time);
        const row = byDay.get(day) ?? { day };
        row[key] = v.value;
        byDay.set(day, row);
      }
    };

    addSeries(results[0], 'total');
    addSeries(results[1], 'unique');
    addSeries(results[2], 'organic_unique');
    addSeries(results[3], 'paid_unique');

    const rows = Array.from(byDay.values()).sort((a, b) =>
      a.day.localeCompare(b.day),
    );
    const sum = (k: string) => rows.reduce((s, r) => s + (r[k] ?? 0), 0);

    return {
      range: { since, until },
      totals: {
        total: sum('total'),
        unique: sum('unique'),
        organic_unique: sum('organic_unique'),
        paid_unique: sum('paid_unique'),
      },
      rows,
    };
  }

  async getPageInfo(pageId: string){
      return getPageInfo(pageId)
  }

  async getAllPage(){
    return getAllPage()
}
}
