import { Test, TestingModule } from '@nestjs/testing';
import { DescenteController } from './descente.controller';

describe('DescenteController', () => {
  let controller: DescenteController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DescenteController],
    }).compile();

    controller = module.get<DescenteController>(DescenteController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
