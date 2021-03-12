import faker from 'faker';
import { PoolConnection } from 'promise-mysql';

import { lookupCurrency } from './lookupCurrency';

describe('lookupCurrency', () => {
  let connection: { query: jest.Mock };

  beforeEach(() => {
    connection = {
      query: jest.fn(),
    };
  });

  it('should return the first row returned from connection.query', async () => {
    const currencyRows = [
      { code: 'CAD', name: 'Canadian Dollars', symbol: '$', exchangeRate: 1.3 },
      { code: 'USD', name: 'US Dollars', symbol: '$', exchangeRate: 1 },
    ];
    connection.query.mockResolvedValue(currencyRows);
    await expect(lookupCurrency(connection as unknown as PoolConnection, 'CAD')).resolves.toEqual(currencyRows[0]);
    expect(connection.query).toHaveBeenCalledTimes(1);
    expect(connection.query).toHaveBeenCalledWith('SELECT code, name, symbol, exchange exchangeRate FROM currencies WHERE code = ? LIMIT 1', 'CAD');
  });

  it('should throw an error if no match found', async () => {
    connection.query.mockResolvedValue([]);
    await expect(lookupCurrency(connection as unknown as PoolConnection, 'CAD')).rejects.toThrow('Unable to find currency');
  });

  it('should throw an error connection.query rejects', async () => {
    const error = Error(faker.random.words());
    connection.query.mockRejectedValue(error);
    await expect(lookupCurrency(connection as unknown as PoolConnection, 'CAD')).rejects.toThrow(error);
  });
});
