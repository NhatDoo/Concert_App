import { Module } from '@nestjs/common';
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';
import { ConcertSearchService } from './elasticsearch.service';

@Module({
    imports: [
        NestElasticsearchModule.register({
            node: process.env.ELASTICSEARCH_NODE || 'http://localhost:9200',

        }),
    ],
    providers: [ConcertSearchService],
    exports: [ConcertSearchService, NestElasticsearchModule],
})
export class ElasticsearchModule { }
