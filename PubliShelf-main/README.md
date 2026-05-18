# PubliShelf

PubliShelf is an online platform for book and magazine transactions, including antique auctions. It provides a seamless interface for buyers, publishers, and administrators to interact and manage their respective functionalities.

---

## Features

- **Buyer Dashboard**: View and purchase books, manage profiles, and participate in auctions.
- **Publisher Dashboard**: Publish books, manage inventory, and track sales.
- **Admin Dashboard**: Oversee platform activities and manage users.
- **Antique Auctions**: Bid on rare and antique items in real time.
- **Real-time Auction with Socket.io**: Participate in live auctions with instant updates using Socket.io.
- **Responsive Design**: Optimized for both desktop and mobile devices.
- **Cloudinary Integration**: Secure image uploads and hosting for book covers and user avatars.
- **JWT Cookie Authentication**: Secure authentication using JSON Web Tokens stored in HTTP-only cookies.
- **MongoDB Atlas**: Cloud-hosted NoSQL database for scalable and reliable data storage.

---

## Prerequisites

Before starting the application, ensure you have the following installed:

- [Node.js](https://nodejs.org/) (v14 or higher)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [MongoDB Atlas](https://www.mongodb.com/atlas/database) account (for cloud database)
- [Cloudinary](https://cloudinary.com/) account (for image uploads)
- [Socket.io](https://socket.io/) for Real-Time Auction

---

## Installation

1. **Clone the repository:**

   ```bash
   git clone https://github.com/vitesh-reddy/PubliShelf.git
   cd PubliShelf
   ```

2. **Install dependencies:**

   ```bash
   npm install
   ```

3. **Set up the environment variables:**
```bash
   Included the .env file in Repo for Better Experience
```
## Starting the Application

1. **Run the application:**

   ```bash
   npm start
   ```

2. **Open your browser and navigate to:**

   ```
   http://localhost:3000
   ```

---

## Folder Structure

```
PubliShelf/
├── public/
│   ├── assets/          # Images and static assets
│   ├── css/             # Stylesheets
│   ├── js/              # Client-side JavaScript
├── config/              # Server and third-party configuration files
├── controllers/         # Route controllers
├── middleware/          # Express middleware (e.g., authentication)
├── models/              # Mongoose models
├── routes/              # API and page routes
├── services/            # Business logic and database services
├── utils/               # Utility functions (e.g., JWT helpers)
├── views/               # EJS templates for rendering pages
├── .env                 # Environment variables
├── package.json         # Project metadata and dependencies
├── server.js            # Main server file
```

---

## Authentication

- **JWT Cookie Authentication**:  
  Users are authenticated using JSON Web Tokens (JWT) stored in HTTP-only cookies for enhanced security.  
  The token is generated on login and verified for protected routes.

---

## Image Uploads

- **Cloudinary**:  
  All book cover images and user avatars are uploaded and stored securely using Cloudinary.  
  Configure your Cloudinary credentials in the `.env` file.

---

## Database

- **MongoDB Atlas**:  
  The application uses MongoDB Atlas for cloud-hosted NoSQL data storage.  
  Update your `MONGODB_URI` in the `.env` file with your Atlas connection string.

---

## Real-time Auction

- **Socket.io**:  
  Real-time bidding and auction updates are powered by [Socket.io](https://socket.io/), allowing users to participate in live auctions with instant feedback and updates.

---

## Scripts

- **Start the server**: `npm start`
- **Run in development mode**: `npm run dev`
- **Lint the code**: `npm run lint`

---

## Contributing

1. Fork the repository.
2. Create a new branch: `git checkout -b feature-name`.
3. Commit your changes: `git commit -m "Add feature"`.
4. Push to the branch: `git push origin feature-name`.
5. Open a pull request.
