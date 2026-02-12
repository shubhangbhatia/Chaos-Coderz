const Bill = require('../modules/Bill');
const User = require('../modules/User');
const { sendBillReminderEmail, sendBillOverdueEmail } = require('./emailService');

// Check for upcoming and overdue bills every 24 hours
const SCHEDULER_INTERVAL = 24 * 60 * 60 * 1000; // 24 hours in milliseconds
const REMINDER_DAYS_BEFORE = 3; // Send reminder 3 days before due date

let schedulerInterval = null;

const checkBillsAndSendEmails = async () => {
    try {
        console.log('🔍 Checking bills for reminders and overdue notifications...');

        const today = new Date();
        today.setHours(0, 0, 0, 0);

        const reminderDate = new Date(today);
        reminderDate.setDate(reminderDate.getDate() + REMINDER_DAYS_BEFORE);

        // Find pending bills that need reminders or are overdue
        const bills = await Bill.find({
            status: 'pending',
            $or: [
                // Bills due within reminder window that haven't been reminded
                {
                    dueDate: { $lte: reminderDate, $gte: today },
                    reminderEmailSent: false
                },
                // Bills that are overdue
                {
                    dueDate: { $lt: today }
                }
            ]
        }).populate('userId');

        console.log(`📋 Found ${bills.length} bills requiring attention`);

        for (const bill of bills) {
            try {
                const user = await User.findById(bill.userId);

                if (!user || !user.email || !user.emailNotifications) {
                    continue;
                }

                const billDueDate = new Date(bill.dueDate);
                billDueDate.setHours(0, 0, 0, 0);

                // Check if bill is overdue
                if (billDueDate < today) {
                    console.log(`🚨 Sending overdue email for bill: ${bill.name}`);
                    await sendBillOverdueEmail(user.email, {
                        name: bill.name,
                        amount: bill.amount,
                        dueDate: bill.dueDate,
                        status: bill.status
                    });
                }
                // Check if bill needs reminder
                else if (billDueDate <= reminderDate && !bill.reminderEmailSent) {
                    console.log(`⏰ Sending reminder email for bill: ${bill.name}`);
                    await sendBillReminderEmail(user.email, {
                        name: bill.name,
                        amount: bill.amount,
                        dueDate: bill.dueDate,
                        status: bill.status
                    });

                    // Mark reminder as sent
                    bill.reminderEmailSent = true;
                    bill.lastEmailSent = new Date();
                    await bill.save();
                }
            } catch (error) {
                console.error(`❌ Error processing bill ${bill._id}:`, error.message);
            }
        }

        console.log('✅ Bill check completed');
    } catch (error) {
        console.error('❌ Error in bill scheduler:', error.message);
    }
};

const startBillScheduler = () => {
    if (schedulerInterval) {
        console.log('⚠️ Bill scheduler already running');
        return;
    }

    console.log('🚀 Starting bill scheduler...');
    console.log(`📅 Scheduler will run every ${SCHEDULER_INTERVAL / (1000 * 60 * 60)} hours`);
    console.log(`⏰ Reminders will be sent ${REMINDER_DAYS_BEFORE} days before due date`);

    // Run immediately on start
    checkBillsAndSendEmails();

    // Then run every 24 hours
    schedulerInterval = setInterval(checkBillsAndSendEmails, SCHEDULER_INTERVAL);

    console.log('✅ Bill scheduler started successfully');
};

const stopBillScheduler = () => {
    if (schedulerInterval) {
        clearInterval(schedulerInterval);
        schedulerInterval = null;
        console.log('🛑 Bill scheduler stopped');
    }
};

module.exports = {
    startBillScheduler,
    stopBillScheduler,
    checkBillsAndSendEmails // Export for manual testing
};
