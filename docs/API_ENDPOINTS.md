# API Endpoints

Base URL: `http://localhost:5000/api`

| Method | Endpoint | Use |
|---|---|---|
| POST | `/auth/register` | Create account |
| POST | `/auth/login` | Login and get JWT token |
| GET | `/profile` | Get logged-in user profile |
| GET | `/categories` | Get default categories |
| GET | `/transactions` | List transactions |
| POST | `/transactions` | Add income/expense |
| PUT | `/transactions/:id` | Update transaction |
| DELETE | `/transactions/:id` | Delete transaction |
| GET | `/budgets` | List budgets |
| POST | `/budgets` | Add/update monthly budget |
| DELETE | `/budgets/:id` | Delete budget |
| GET | `/dashboard` | Dashboard summary, charts, alerts |
