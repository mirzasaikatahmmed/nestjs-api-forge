import { ApiResponseDto } from './api-response.dto';

describe('ApiResponseDto', () => {
  it('builds a success response with defaults and a timestamp', () => {
    const res = ApiResponseDto.success({ id: 1 });

    expect(res).toMatchObject({
      success: true,
      statusCode: 200,
      message: 'Request successful',
      data: { id: 1 },
    });
    expect(new Date(res.meta.timestamp).toISOString()).toBe(res.meta.timestamp);
  });

  it('merges custom meta and lets it override the timestamp', () => {
    const res = ApiResponseDto.success('ok', 'Done', 200, {
      path: '/x',
      timestamp: 'fixed',
    });

    expect(res.meta).toEqual({ path: '/x', timestamp: 'fixed' });
  });

  it.each([
    ['created', ApiResponseDto.created({ id: 1 }), 201],
    ['accepted', ApiResponseDto.accepted({ id: 1 }), 202],
    ['noContent', ApiResponseDto.noContent(), 204],
  ])('%s uses the matching status code', (_name, res, statusCode) => {
    expect(res.statusCode).toBe(statusCode);
    expect(res.success).toBe(true);
  });

  it('noContent returns null data', () => {
    expect(ApiResponseDto.noContent().data).toBeNull();
  });

  describe('paginated', () => {
    it('computes pagination on a middle page', () => {
      const res = ApiResponseDto.paginated([1, 2], 25, 2, 10);

      expect(res.pagination).toEqual({
        total: 25,
        page: 2,
        limit: 10,
        totalPages: 3,
        hasNextPage: true,
        hasPrevPage: true,
      });
    });

    it('has no next page on the last page and no previous page on the first', () => {
      expect(ApiResponseDto.paginated([], 25, 3, 10).pagination).toMatchObject({
        hasNextPage: false,
        hasPrevPage: true,
      });
      expect(ApiResponseDto.paginated([], 25, 1, 10).pagination).toMatchObject({
        hasNextPage: true,
        hasPrevPage: false,
      });
    });

    it('handles an empty result set', () => {
      expect(ApiResponseDto.paginated([], 0, 1, 10).pagination).toMatchObject({
        totalPages: 0,
        hasNextPage: false,
        hasPrevPage: false,
      });
    });
  });

  it('builds an error response', () => {
    const res = ApiResponseDto.error('Nope', 404, { code: 'NOT_FOUND' });

    expect(res).toMatchObject({
      success: false,
      statusCode: 404,
      message: 'Nope',
      error: { code: 'NOT_FOUND' },
    });
  });
});
