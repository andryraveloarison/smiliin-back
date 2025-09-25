import { Test, TestingModule } from '@nestjs/testing';
import { PublicationideaController } from './publicationidea.controller';

describe('PublicationideaController', () => {
  let controller: PublicationideaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PublicationideaController],
    }).compile();

    controller = module.get<PublicationideaController>(PublicationideaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
