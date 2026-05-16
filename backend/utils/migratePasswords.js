/**
 * Migration Script: Hash existing plaintext passwords
 * 
 * Run once after deploying the bcrypt changes:
 *   node backend/utils/migratePasswords.js
 * 
 * This script:
 * 1. Connects to MongoDB
 * 2. Finds all users whose passwords are NOT already hashed
 * 3. Hashes each plaintext password with bcrypt
 * 4. Saves the updated user document
 * 
 * Safe to run multiple times — it skips already-hashed passwords.
 */

require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const SALT_ROUNDS = 12;

// bcrypt hashes always start with "$2a$" or "$2b$"
function isAlreadyHashed(password) {
    return /^\$2[aby]?\$\d{1,2}\$/.test(password);
}

async function migratePasswords() {
    const mongoURI = process.env.MONGO_URI || 'mongodb://localhost:27017/expense-tracker';

    try {
        await mongoose.connect(mongoURI);
        console.log('✅ Connected to MongoDB');

        // Access the raw collection to avoid triggering the pre-save hook
        const User = mongoose.connection.collection('usermain');
        const users = await User.find({}).toArray();

        console.log(`📋 Found ${users.length} total users`);

        let migrated = 0;
        let skipped = 0;

        for (const user of users) {
            if (isAlreadyHashed(user.password)) {
                skipped++;
                console.log(`  ⏭️  ${user.username} — already hashed, skipping`);
                continue;
            }

            const hashedPassword = await bcrypt.hash(user.password, SALT_ROUNDS);
            await User.updateOne(
                { _id: user._id },
                { $set: { password: hashedPassword } }
            );

            migrated++;
            console.log(`  🔒 ${user.username} — password hashed successfully`);
        }

        console.log(`\n🎉 Migration complete!`);
        console.log(`   Migrated: ${migrated}`);
        console.log(`   Skipped (already hashed): ${skipped}`);

    } catch (err) {
        console.error('❌ Migration failed:', err);
    } finally {
        await mongoose.disconnect();
        console.log('🔌 Disconnected from MongoDB');
    }
}

migratePasswords();
