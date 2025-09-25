import { Test, TestingModule } from '@nestjs/testing';
import { PublicationideaService } from './publicationidea.service';

describe('PublicationideaService', () => {
  let service: PublicationideaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [PublicationideaService],
    }).compile();

    service = module.get<PublicationideaService>(PublicationideaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
