# 💰 Finance Genie - Personal Expense Tracker

A comprehensive web-based personal finance management application built with Node.js, Express, MongoDB, and EJS. Track your income, expenses, bills, and get automated email reminders for upcoming payments.

![Finance Genie](https://img.shields.io/badge/version-1.0.0-purple) ![Node.js](https://img.shields.io/badge/node-%3E%3D14.0.0-brightgreen) ![MongoDB](https://img.shields.io/badge/mongodb-required-green) ![License](https://img.shields.io/badge/license-ISC-blue)

---

## ✨ Features

### 📊 Financial Tracking
- **Transaction Management** - Add, view, and categorize income and expenses
- **Bill Management** - Track bills with due dates and payment status
- **Dynamic Dashboard** - Visual analytics with Chart.js graphs
  - Monthly income vs expense trends
  - Daily expense tracking
  - Category-wise spending breakdown
  - Savings rate calculation

### 📧 Email Notifications (NEW!)
- **Bill Creation Confirmations** - Instant email when bills are created
- **Automated Reminders** - Get notified 3 days before bill due dates
- **Overdue Alerts** - Automatic alerts for past-due bills
- **Recurring Bills** - Set up weekly, monthly, or yearly recurring payments
- **Professional Email Templates** - Branded, responsive email designs

### 🎨 Modern UI/UX
- **Glassmorphism Design** - Modern, sleek interface with purple gradient theme
- **Responsive Layout** - Works seamlessly on desktop and mobile
- **Interactive Forms** - Custom-styled radio buttons, inputs, and selects
- **Smooth Animations** - Transitions, hover effects, and micro-interactions
- **Search & Filter** - Find transactions by name or date

### 🔐 User Authentication
- **Secure Login/Signup** - Session-based authentication
- **User Profiles** - Individual user data isolation
- **Email Preferences** - Opt-in/out of email notifications

### 📚 Educational Resources
- **Help Center** - Financial guidance and saving challenges
- **Education Hub** - Learn about budgeting and money management
- **About Page** - Learn about Finance Genie's mission

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v14 or higher)
- **MongoDB** (running locally or cloud instance)
- **Gmail Account** (for email notifications)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Chaos-Coderz.git
   cd Chaos-Coderz
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create/edit `.env` file in the root directory:
   ```env
   MONGO_URI=mongodb://localhost:27017/expense-tracker
   PORT=8080
   
   # Email Configuration
   EMAIL_SERVICE=gmail
   EMAIL_USER=your-email@gmail.com
   EMAIL_PASSWORD=your-gmail-app-password
   EMAIL_FROM=Finance Genie <noreply@financegenie.com>
   ```

4. **Set up Gmail App Password** (for email notifications)
   - Go to [Google Account App Passwords](https://myaccount.google.com/apppasswords)
   - Enable 2-Factor Authentication if not already enabled
   - Generate an App Password for "Mail"
   - Copy the 16-character password to `EMAIL_PASSWORD` in `.env`

5. **Start MongoDB**
   ```bash
   # If using local MongoDB
   mongod
   ```

6. **Run the application**
   ```bash
   npm run dev
   ```

7. **Open in browser**
   ```
   http://localhost:8080
   ```

---

## 📁 Project Structure

```
Chaos-Coderz/
├── backend/
│   ├── middleware/
│   │   └── authMiddleware.js       # Authentication middleware
│   ├── modules/
│   │   ├── Bill.js                 # Bill model (with recurring support)
│   │   ├── Transaction.js          # Transaction model
│   │   └── User.js                 # User model (with email preferences)
│   ├── routes/
│   │   ├── auth.js                 # Authentication routes
│   │   ├── index.js                # Main routes (dashboard, home)
│   │   └── transactions.js         # Transaction & bill routes
│   ├── utils/
│   │   ├── emailService.js         # Nodemailer email service
│   │   └── billScheduler.js        # Automated bill reminder scheduler
│   └── views/
│       ├── emails/                 # Email templates
│       │   ├── billCreatedEmail.ejs
│       │   ├── billReminderEmail.ejs
│       │   └── billOverdueEmail.ejs
│       ├── includes/               # Reusable components
│       │   ├── navbar.ejs
│       │   └── footer.ejs
│       ├── layouts/
│       │   └── boilerplate.ejs     # Main layout
│       ├── bills.ejs               # Bill creation form
│       ├── transaction.ejs         # Transaction form
│       ├── dashboard.ejs           # Analytics dashboard
│       ├── index.ejs               # Home page
│       ├── login.ejs               # Login page
│       ├── signup.ejs              # Signup page
│       ├── help.ejs                # Help center
│       ├── education.ejs           # Educational content
│       └── about.ejs               # About page
├── frontend/
│   ├── CSS/
│   │   └── style.css               # Main stylesheet
│   └── public/                     # Static assets
├── .env                            # Environment variables
├── .gitignore                      # Git ignore file
├── package.json                    # Dependencies
├── server.js                       # Express server entry point
└── README.md                       # This file
```

---

## 💻 Usage

### Creating a Transaction
1. Navigate to **Transactions** from the navbar
2. Select transaction type (Income/Expense)
3. Choose category (Shopping, Bills, Food, etc.)
4. Enter amount and date
5. Click **Add Transaction**

### Managing Bills
1. Go to **Bills** section
2. Fill in bill details:
   - Bill name
   - Amount
   - Status (Pending/Paid)
   - Due date
3. **Optional**: Enable recurring bill (weekly/monthly/yearly)
4. **Optional**: Check "Send email notification"
5. Click **Generate Bill**

### Email Notifications
- **Creation Email**: Sent immediately when bill is created
- **Reminder Email**: Sent automatically 3 days before due date
- **Overdue Email**: Sent when bill passes due date
- **Manage Preferences**: Update email settings in user profile

### Viewing Dashboard
- Access real-time analytics at `/dashboard`
- View monthly income vs expense trends
- Analyze spending by category
- Track daily expenses
- Monitor savings rate

---

## 🛠️ Technologies Used

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **EJS** - Templating engine
- **Nodemailer** - Email sending service
- **express-session** - Session management
- **dotenv** - Environment variable management

### Frontend
- **HTML5** - Structure
- **CSS3** - Styling (Glassmorphism, gradients, animations)
- **Bootstrap 5** - Responsive framework
- **JavaScript** - Client-side logic
- **Chart.js** - Data visualization
- **Font Awesome** - Icons
- **Google Fonts** - Typography

---

## 📧 Email System

### How It Works
1. **Email Service** (`emailService.js`) - Configures Nodemailer with Gmail SMTP
2. **Bill Scheduler** (`billScheduler.js`) - Runs every 24 hours to check bills
3. **Email Templates** - Professional EJS templates with branding
4. **Automated Sending** - Non-blocking email delivery

### Email Types

| Email Type | Trigger | Subject | Theme |
|------------|---------|---------|-------|
| **Creation** | Bill created | ✅ Bill Created: [Name] | Purple gradient |
| **Reminder** | 3 days before due | ⏰ Reminder: [Name] due in 3 days | Orange gradient |
| **Overdue** | Past due date | 🚨 OVERDUE: [Name] - X days past due | Red gradient |

### Customization
- Update templates in `backend/views/emails/`
- Modify scheduler interval in `billScheduler.js`
- Change reminder days in `REMINDER_DAYS_BEFORE` constant

---

## 🎨 Design Features

- **Purple Gradient Theme** - Primary brand color (#8b5cf6 to #7c3aed)
- **Glassmorphism Effects** - Blurred, semi-transparent backgrounds
- **Custom Form Elements** - Styled radio buttons, checkboxes, inputs
- **Smooth Transitions** - 0.3s cubic-bezier animations
- **Responsive Design** - Mobile-first approach
- **Accessibility** - ARIA labels, semantic HTML

---

## 🔒 Security

- **Session-based Authentication** - Secure user sessions
- **Password Hashing** - (Recommended: Add bcrypt for production)
- **Environment Variables** - Sensitive data in `.env` (not committed)
- **Input Validation** - Server-side validation for all forms
- **HTTPS** - (Recommended for production deployment)

---

## 📝 API Routes

### Authentication
- `GET /signup` - Signup page
- `POST /signup` - Create new user
- `GET /login` - Login page
- `POST /login` - Authenticate user
- `GET /logout` - Logout user

### Transactions
- `GET /transaction` - Transaction form
- `POST /transaction` - Create transaction

### Bills
- `GET /add-bill` - Bill creation form
- `POST /add-bill` - Create bill (with email notification)

### Dashboard & Pages
- `GET /` - Home page (transaction list)
- `GET /dashboard` - Analytics dashboard
- `GET /help` - Help center
- `GET /education` - Educational resources
- `GET /about` - About page

---

## 🚧 Future Enhancements

- [ ] Budget planning and tracking
- [ ] Expense categories customization
- [ ] Export data to CSV/PDF
- [ ] Multi-currency support
- [ ] Mobile app (React Native)
- [ ] SMS notifications (Twilio integration)
- [ ] Bank account integration
- [ ] AI-powered spending insights
- [ ] Social features (shared budgets)
- [ ] Dark mode toggle

---

## 🐛 Known Issues

- Email scheduler runs every 24 hours (consider cron jobs for production)
- No password hashing (add bcrypt before production)
- Limited error handling on frontend
- No rate limiting on API endpoints

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📄 License

This project is licensed under the ISC License.


## 🙏 Acknowledgments

- Bootstrap for responsive framework
- Chart.js for beautiful visualizations
- Font Awesome for icons
- Nodemailer for email functionality
- MongoDB for flexible data storage

---

## 📞 Support

For support, email shubhangbhatia595@gmail.com or open an issue on GitHub.

---

## 🌟 Show Your Support

Give a ⭐️ if this project helped you!

---

**Made with 💜 by Finance Genie Team**
