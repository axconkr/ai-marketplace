import { beforeEach, describe, expect, it, jest } from '@jest/globals';

const mockProductUpdate = jest.fn<
  (args: { where: { id: string }; data: { view_count: { increment: number } } }) => Promise<{
    id: string;
    view_count: number;
  }>
>();

jest.mock('../../../lib/prisma', () => ({
  prisma: {
    product: {
      update: mockProductUpdate,
    },
  },
}));

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { incrementViewCount } = require('../../../lib/services/product');

describe('incrementViewCount', () => {
  beforeEach(() => {
    mockProductUpdate.mockReset();
  });

  it('increments the persisted product view counter', async () => {
    const updatedProduct = { id: 'prod_123', view_count: 4 };
    mockProductUpdate.mockResolvedValue(updatedProduct);

    const result = await incrementViewCount('prod_123');

    expect(mockProductUpdate).toHaveBeenCalledWith({
      where: { id: 'prod_123' },
      data: {
        view_count: { increment: 1 },
      },
    });
    expect(result).toEqual(updatedProduct);
  });
});
