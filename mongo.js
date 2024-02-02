// mongo.js

const { MongoClient } = require('mongodb');

class Mongo {
  constructor() {
    this.client = new MongoClient(process.env.MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true });
  }

  async connect() {
    await this.client.connect();
    // Select the database and collection
    const db = this.client.db('spacehelper');
    this.collection = db.collection('guildSettings');
  }
}

module.exports = new Mongo();
