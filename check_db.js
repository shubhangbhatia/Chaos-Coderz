const mongoose = require('mongoose');
require('dotenv').config();

const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';

async function checkDB() {
    try {
        await mongoose.connect(mongoURI);
        console.log('Connected to:', mongoURI);
        const collections = await mongoose.connection.db.listCollections().toArray();
        console.log('Collections:', collections.map(c => c.name));

        const User = mongoose.model('User', new mongoose.Schema({}), 'usermain');
        const userCount = await User.countDocuments();
        console.log('User count in usermain:', userCount);

        const collections2 = await mongoose.connection.db.listCollections().toArray();
        // Check for any collection that might look like transactions
        const txCollection = collections.find(c => c.name.toLowerCase().includes('transaction'));
        if (txCollection) {
            console.log(`Found collection: ${txCollection.name}`);
            const count = await mongoose.connection.db.collection(txCollection.name).countDocuments();
            console.log(`Document count in ${txCollection.name}:`, count);
        } else {
            console.log('No transaction collection found.');
        }

        process.exit(0);
    } catch (err) {
        console.error('Error:', err);
        process.exit(1);
    }
}

checkDB();
