import handler from '../../api/ping';

describe('Ping handler', () => {
  it('returns ok JSON with timestamp', () => {
    const req = {} as any;
    const json = jest.fn();
    const status = jest.fn(() => ({ json }));
    const res = { status } as any;

    handler(req, res);

    expect(status).toHaveBeenCalledWith(200);
    expect(json).toHaveBeenCalled();
    const calledWith = json.mock.calls[0][0];
    expect(calledWith).toHaveProperty('status', 'ok');
    expect(calledWith).toHaveProperty('message');
    expect(calledWith).toHaveProperty('timestamp');
  });
});
