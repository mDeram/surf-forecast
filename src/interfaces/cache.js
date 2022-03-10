const clone = require('clone');

class CacheItem {
    constructor(data) {
        this.update(data);
    }
    update(data) {
        this.data = data;
        this.timestamp = Date.now();
    }
}

class Cache {
    constructor(retriever, validityDuration) {
        this.store = {};
        this.retriever = retriever;
        this.validityDuration = validityDuration * 1000;
    }
    isStored(param) {
        return this.store.hasOwnProperty(param);
    }
    isTimestampValid(item) {
        return Date.now() - item.timestamp < this.validityDuration;
    }
    async updateStore(item, param) {
        item.update(await this.retriever(param));
    }
    async addStore(param) {
        let newItem = new CacheItem(await this.retriever(param));
        this.store[param] = newItem;
        return newItem;
    }
    async retrieve(param) {
        let item;
        if (this.isStored(param)) {
            if (!this.isTimestampValid(this.store[param])) {
                await this.updateStore(item, param);
            }
            item = this.store[param];
        } else {
            item = await this.addStore(param);
        }

        return clone(item.data);
    }
}

module.exports = Cache;
