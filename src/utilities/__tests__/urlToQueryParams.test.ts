import { urlToQueryParams } from '../urlToQueryParams';

describe('urlToQueryParams', () => {
    it('should work correctly with a url', () => {
        const params = urlToQueryParams('https://random.url.com?Target=Offer&Method=findAll&filters%5Bhas_goals_enabled%5D%5BTRUE%5D=1&filters%5Bstatus%5D=active&fields%5B%5D=id&fields%5B%5D=name&fields%5B%5D=default_goal_name');

        expect(params).toEqual([
            {
                parameter: 'Target',
                type: 'query',
                value: 'Offer',
            },
            {
                parameter: 'Method',
                type: 'query',
                value: 'findAll',
            },
            {
                parameter: 'fields',
                type: 'query',
                value: [
                    'id',
                    'name',
                    'default_goal_name',
                ],
            },
            {
                parameter: 'filters',
                type: 'query',
                value: {
                    'has_goals_enabled': {
                        'TRUE': '1',
                    },
                    'status': 'active',
                }
            }
        ]);
    });

    it('should work correctly with a filters', () => {
        const params = urlToQueryParams(
            'https://random.url.com?Target=Offer&Method=findAll&filters%5Bhas_goals_enabled%5D%5BTRUE%5D=1&filters%5Bstatus%5D=active&fields%5B%5D=id&fields%5B%5D=name&fields%5B%5D=default_goal_name',
            ['Target', 'fields']
        );

        expect(params).toEqual([
            {
                parameter: 'Target',
                type: 'query',
                value: 'Offer',
            },
            {
                parameter: 'fields',
                type: 'query',
                value: [
                    'id',
                    'name',
                    'default_goal_name',
                ],
            }
        ]);
    });

    it('should return empty array with invalid url', () => {
        const params = urlToQueryParams('');
        expect(params).toEqual([]);
    });
});