import { objectToQueryParams } from './objectToQueryParams';

const getParamsAsObject = (url: string) => {
    url = url.substring(url.indexOf('?') + 1);

    var re = /([^&=]+)=?([^&]*)/g;
    var decodeRE = /\+/g;

    var decode = (str: string) => {
        return decodeURIComponent(str.replace(decodeRE, ' '));
    };

    var params = {}, e;
    while (e = re.exec(url)) {
        var k = decode(e[1]), v = decode(e[2]);
        if (k.substring(k.length - 2) === '[]') {
            k = k.substring(0, k.length - 2);
            (params[k] || (params[k] = [])).push(v);
        } else { params[k] = v; }
    }

    var assign = (obj: {}, keyPath: string[], value: unknown) => {
        var lastKeyIndex = keyPath.length - 1;
        for (var i = 0; i < lastKeyIndex; ++i) {
            var key = keyPath[i];
            if (!(key in obj)) {
                obj[key] = {};
            }
            obj = obj[key];
        }
        obj[keyPath[lastKeyIndex]] = value;
    };

    const paramsKeys = Object.keys(params);
    for (const prop of paramsKeys) {
        var structure = prop.split('[');
        if (structure.length > 1) {
            const levels: string[] = [];

            structure.forEach((item, i) => {
                var key = item.replace(/[?[\]\\ ]/g, '');
                levels.push(key);
            });

            assign(params, levels, params[prop]);
            delete (params[prop]);
        }
    }

    return params;
};

export const urlToQueryParams = (url: string, paramFilters?: string[]) => {
    const obj = getParamsAsObject(url);
    const allParams = objectToQueryParams(obj);
    
    if(!paramFilters) {
        return allParams;
    }
    
    const filteredParams = allParams.filter(o => paramFilters.includes(o.parameter!));

    return filteredParams;
};