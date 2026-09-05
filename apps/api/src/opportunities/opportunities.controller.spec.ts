import { OpportunitiesController } from './opportunities.controller';
import { OpportunitiesService } from './opportunities.service';

describe('OpportunitiesController', () => {
  it('returns the initial opportunity listing', () => {
    const controller = new OpportunitiesController(new OpportunitiesService());

    expect(controller.findAll()).toHaveLength(3);
  });
});
