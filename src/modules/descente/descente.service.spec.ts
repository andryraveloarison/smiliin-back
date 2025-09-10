import { Test, TestingModule } from '@nestjs/testing';
import { DescenteService } from './descente.service';

describe('DescenteService', () => {
  let service: DescenteService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DescenteService],
    }).compile();

    service = module.get<DescenteService>(DescenteService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
