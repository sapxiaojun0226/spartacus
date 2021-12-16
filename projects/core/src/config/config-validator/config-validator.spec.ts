import { validateConfig } from './config-validator';

describe('config validator', () => {
  it('should not warn if there is no validators', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    validateConfig({}, []);
    expect(console.warn).not.toHaveBeenCalled();
  });

  it('should warn if there is a validation error', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    validateConfig({}, [(_c) => 'error']);
    expect(console.warn).toHaveBeenCalledWith('error');
  });

  it('should warn only for errors', () => {
    jest.spyOn(console, 'warn').mockImplementation(() => {});
    const mockInvalid = (_c) => 'error';
    const mockValidValidator = (_c) => {};
    validateConfig({}, [mockInvalid, mockValidValidator, mockInvalid]);
    expect(console.warn).toHaveBeenCalledTimes(2);
  });
});
