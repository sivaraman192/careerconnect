import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, '../data/db.json');

const readData = () => {
  try {
    if (!fs.existsSync(dbPath)) {
      return { users: [], jobs: [], applications: [], savedjobs: [] };
    }
    return JSON.parse(fs.readFileSync(dbPath, 'utf8'));
  } catch (error) {
    return { users: [], jobs: [], applications: [], savedjobs: [] };
  }
};

const writeData = (data) => {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
};

export class MockModel {
  constructor(collectionName) {
    this.collectionName = collectionName.toLowerCase();
  }

  generateId() {
    return Array.from({ length: 24 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }

  async find(filter = {}) {
    const data = readData();
    let items = data[this.collectionName] || [];
    
    if (Object.keys(filter).length > 0) {
      items = items.filter(item => {
        return Object.entries(filter).every(([key, val]) => {
          if (val && typeof val === 'object') {
            if (val.$in) {
              return val.$in.includes(item[key]);
            }
            if (val.$ne) {
              return item[key] !== val.$ne;
            }
            if (val.$regex) {
              const flags = val.$options || '';
              const regex = new RegExp(val.$regex, flags);
              return regex.test(item[key]);
            }
          }
          if (key === '$or' && Array.isArray(val)) {
            return val.some(subFilter => {
              return Object.entries(subFilter).every(([subKey, subVal]) => {
                if (subVal && typeof subVal === 'object' && subVal.$regex) {
                  const flags = subVal.$options || '';
                  const regex = new RegExp(subVal.$regex, flags);
                  return regex.test(item[subKey]);
                }
                if (subVal instanceof RegExp) {
                  return subVal.test(item[subKey]);
                }
                return item[subKey] === subVal;
              });
            });
          }
          if (val instanceof RegExp) {
            return val.test(item[key]);
          }
          // Strict equality fallback
          return item[key] === val;
        });
      });
    }

    return new QueryChain(items);
  }

  async findOne(filter = {}) {
    const items = await this.find(filter);
    const item = items[0] || null;
    return item ? new DocumentChain(item, this.collectionName) : null;
  }

  async findById(id) {
    if (!id) return null;
    const data = readData();
    const items = data[this.collectionName] || [];
    const item = items.find(item => item._id === id.toString()) || null;
    return item ? new DocumentChain(item, this.collectionName) : null;
  }

  async create(docData) {
    const data = readData();
    if (!data[this.collectionName]) {
      data[this.collectionName] = [];
    }
    const newDoc = {
      _id: this.generateId(),
      ...docData,
      createdAt: new Date().toISOString()
    };
    data[this.collectionName].push(newDoc);
    writeData(data);
    return new DocumentChain(newDoc, this.collectionName);
  }

  async findByIdAndUpdate(id, updateData, options = {}) {
    const data = readData();
    const items = data[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id.toString());
    if (index === -1) return null;
    
    // Support MongoDB $set operators or direct fields
    const fieldsToUpdate = updateData.$set || updateData;
    const updated = {
      ...items[index],
      ...fieldsToUpdate,
    };
    items[index] = updated;
    writeData(data);
    return new DocumentChain(updated, this.collectionName);
  }

  async findByIdAndDelete(id) {
    const data = readData();
    const items = data[this.collectionName] || [];
    const index = items.findIndex(item => item._id === id.toString());
    if (index === -1) return null;
    const deleted = items.splice(index, 1)[0];
    writeData(data);
    return deleted;
  }

  async deleteOne(filter = {}) {
    const data = readData();
    const items = data[this.collectionName] || [];
    const index = items.findIndex(item => {
      return Object.entries(filter).every(([key, val]) => item[key] === val);
    });
    if (index === -1) return { deletedCount: 0 };
    items.splice(index, 1);
    writeData(data);
    return { deletedCount: 1 };
  }

  async deleteMany(filter = {}) {
    const data = readData();
    const items = data[this.collectionName] || [];
    const initialCount = items.length;
    const remaining = items.filter(item => {
      return !Object.entries(filter).every(([key, val]) => item[key] === val);
    });
    data[this.collectionName] = remaining;
    writeData(data);
    return { deletedCount: initialCount - remaining.length };
  }

  async countDocuments(filter = {}) {
    const items = await this.find(filter);
    return items.length;
  }
}

class QueryChain {
  constructor(results) {
    this.results = results.map(item => JSON.parse(JSON.stringify(item)));
  }

  sort(sortOption) {
    if (sortOption && typeof sortOption === 'object') {
      const [field, dir] = Object.entries(sortOption)[0];
      this.results.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA < valB) return dir === -1 ? 1 : -1;
        if (valA > valB) return dir === -1 ? -1 : 1;
        return 0;
      });
    } else if (typeof sortOption === 'string') {
      const isDescending = sortOption.startsWith('-');
      const field = isDescending ? sortOption.slice(1) : sortOption;
      this.results.sort((a, b) => {
        const valA = a[field];
        const valB = b[field];
        if (valA < valB) return isDescending ? 1 : -1;
        if (valA > valB) return isDescending ? -1 : 1;
        return 0;
      });
    }
    return this;
  }

  populate(populateOption) {
    const data = readData();
    let fieldsToPopulate = [];
    if (typeof populateOption === 'string') {
      fieldsToPopulate = [populateOption];
    } else if (Array.isArray(populateOption)) {
      fieldsToPopulate = populateOption;
    } else if (populateOption && typeof populateOption === 'object') {
      fieldsToPopulate = [populateOption.path];
    }

    this.results.forEach(item => {
      fieldsToPopulate.forEach(field => {
        let targetCollection = '';
        if (field === 'postedBy' || field === 'userId') {
          targetCollection = 'users';
        } else if (field === 'jobId') {
          targetCollection = 'jobs';
        }
        
        if (targetCollection && item[field]) {
          const refId = item[field].toString();
          const refDoc = data[targetCollection]?.find(doc => doc._id === refId);
          if (refDoc) {
            const docCopy = { ...refDoc };
            if (targetCollection === 'users') {
              delete docCopy.password;
            }
            item[field] = docCopy;
          }
        }
      });
    });
    return this;
  }

  then(onfulfilled) {
    return Promise.resolve(this.results).then(onfulfilled);
  }
}

class DocumentChain {
  constructor(doc, collectionName) {
    Object.assign(this, doc);
    this._collectionName = collectionName;
  }

  async save() {
    const data = readData();
    const items = data[this._collectionName] || [];
    const idx = items.findIndex(item => item._id === this._id);
    const docData = { ...this };
    delete docData._collectionName;
    
    if (idx !== -1) {
      items[idx] = docData;
    } else {
      items.push(docData);
    }
    data[this._collectionName] = items;
    writeData(data);
    return this;
  }

  async comparePassword(candidatePassword) {
    const bcrypt = await import('bcryptjs');
    return bcrypt.default.compare(candidatePassword, this.password);
  }
}
