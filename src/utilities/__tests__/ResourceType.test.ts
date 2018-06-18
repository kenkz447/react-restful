import { ResourceType, SchemaField } from '../ResourceType';
import { Store } from '../Store';

describe('ResourceType', () => {
    const commonPK: SchemaField = {
        property: '_id',
        type: 'PK'
    };

    const branchResourceType = new ResourceType({
        name: 'branch',
        schema: [commonPK, {
            type: 'MANY',
            property: 'users',
            resourceType: 'user'
        }]
    });

    const bookingResourceType = new ResourceType({
        name: 'booking',
        schema: [commonPK, {
            type: 'FK',
            property: 'user',
            resourceType: 'user'
        }]
    });

    const userResourceType = new ResourceType({
        name: 'user',
        schema: [
            commonPK, {
                type: 'FK',
                property: 'branch',
                resourceType: branchResourceType.name
            }, {
                type: 'MANY',
                property: 'bookings',
                resourceType: bookingResourceType.name
            }
        ]
    });

    const store = new Store({
        recordKeyProperty: '_id'
    });

    const testUser = {
        _id: 1,
        username: 'user'
    };

    const testData = {
        ...testUser,
        branch: {
            _id: 56,
            branchName: 'branch'
        },
        booking: [{
            date: '1970-01-01',
            time: '01:00'
        }, {
            date: '1970-01-02',
            time: '16:30'
        }]
    };

    it('instance', () => {
        userResourceType.dataMapping(testData, store);
    });
});