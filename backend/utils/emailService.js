const nodemailer = require('nodemailer');
const ejs = require('ejs');
const path = require('path');

// Create reusable transporter
let transporter = null;

const initializeEmailService = () => {
    try {
        transporter = nodemailer.createTransport({
            service: process.env.EMAIL_SERVICE || 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASSWORD
            }
        });

        console.log('✅ Email service initialized successfully');
        return true;
    } catch (error) {
        console.error('❌ Email service initialization failed:', error.message);
        return false;
    }
};

// Send bill creation confirmation email
const sendBillCreatedEmail = async (userEmail, billData) => {
    try {
        if (!transporter) {
            console.warn('⚠️ Email service not initialized. Skipping email.');
            return false;
        }

        const templatePath = path.join(__dirname, '../views/emails/billCreatedEmail.ejs');
        const html = await ejs.renderFile(templatePath, {
            billName: billData.name,
            billAmount: billData.amount,
            dueDate: new Date(billData.dueDate).toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            status: billData.status,
            isRecurring: billData.isRecurring || false,
            recurringInterval: billData.recurringInterval || 'N/A'
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Finance Genie" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `✅ Bill Created: ${billData.name}`,
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Bill creation email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending bill creation email:', error.message);
        return false;
    }
};

// Send bill reminder email (for upcoming bills)
const sendBillReminderEmail = async (userEmail, billData) => {
    try {
        if (!transporter) {
            console.warn('⚠️ Email service not initialized. Skipping email.');
            return false;
        }

        const dueDate = new Date(billData.dueDate);
        const today = new Date();
        const daysUntilDue = Math.ceil((dueDate - today) / (1000 * 60 * 60 * 24));

        const templatePath = path.join(__dirname, '../views/emails/billReminderEmail.ejs');
        const html = await ejs.renderFile(templatePath, {
            billName: billData.name,
            billAmount: billData.amount,
            dueDate: dueDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            daysUntilDue: daysUntilDue,
            status: billData.status
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Finance Genie" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `⏰ Reminder: ${billData.name} due in ${daysUntilDue} day${daysUntilDue !== 1 ? 's' : ''}`,
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Bill reminder email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending bill reminder email:', error.message);
        return false;
    }
};

// Send bill overdue email
const sendBillOverdueEmail = async (userEmail, billData) => {
    try {
        if (!transporter) {
            console.warn('⚠️ Email service not initialized. Skipping email.');
            return false;
        }

        const dueDate = new Date(billData.dueDate);
        const today = new Date();
        const daysOverdue = Math.ceil((today - dueDate) / (1000 * 60 * 60 * 24));

        const templatePath = path.join(__dirname, '../views/emails/billOverdueEmail.ejs');
        const html = await ejs.renderFile(templatePath, {
            billName: billData.name,
            billAmount: billData.amount,
            dueDate: dueDate.toLocaleDateString('en-US', {
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            }),
            daysOverdue: daysOverdue,
            status: billData.status
        });

        const mailOptions = {
            from: process.env.EMAIL_FROM || `"Finance Genie" <${process.env.EMAIL_USER}>`,
            to: userEmail,
            subject: `🚨 OVERDUE: ${billData.name} - ${daysOverdue} day${daysOverdue !== 1 ? 's' : ''} past due`,
            html: html
        };

        await transporter.sendMail(mailOptions);
        console.log(`📧 Bill overdue email sent to ${userEmail}`);
        return true;
    } catch (error) {
        console.error('❌ Error sending bill overdue email:', error.message);
        return false;
    }
};

module.exports = {
    initializeEmailService,
    sendBillCreatedEmail,
    sendBillReminderEmail,
    sendBillOverdueEmail
};
