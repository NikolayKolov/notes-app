import NodeCache from "node-cache";
// stdTTL - the time for which data is cached in seconds
// store for 1 week, value in seconds = 60 * 60 * 24 * 7
const CACHE_TTL = 60 * 60 * 24 * 7;

class InMemoryCache {
    // private local cache instance
    public static instance: NodeCache;

    // implement singleton pattern
    constructor() {
        console.log('InMemoryCache constructor init')
        if (InMemoryCache.instance == null) {
            console.log('InMemoryCache constructor new NodeCache');
            InMemoryCache.instance = new NodeCache({ stdTTL: CACHE_TTL, checkperiod: 10 });
        }

        console.log('InMemoryCache constructor return');
        return InMemoryCache.instance;
    }
}

// set up a single instance
new InMemoryCache();

// export only an instance of the class
export default InMemoryCache.instance;