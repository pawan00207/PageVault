# PubliShelf API Documentation

This document provides an overview of the main APIs, request/response schemas, and service functions for the PubliShelf platform.

---

## Table of Contents

- [Schemas](#schemas)
- [Routes / APIs](#routes--apis)
  - [Authentication APIs](#authentication-apis)
  - [Buyer APIs](#buyer-apis)
  - [Publisher APIs](#publisher-apis)
  - [Admin APIs](#admin-apis)
  - [Auction APIs](#auction-apis)
  - [Book APIs](#book-apis)
- [Service Functions](#service-functions)

---

## Schemas

### User (Buyer/Publisher/Admin)
```json
{
  "_id": "ObjectId",
  "firstname": "string",
  "lastname": "string",
  "email": "string",
  "password": "hashed string",
  "role": "buyer | publisher | admin",
  // Publisher only:
  "publishingHouse": "string",
  "books": ["BookId"],
  // Buyer only:
  "cart": [{ "book": "BookId", "quantity": "number" }],
  "wishlist": ["BookId"],
  "orders": [{
    "book": "BookId",
    "quantity": "number",
    "orderDate": "date",
    "delivered": "boolean"
  }]
}
```

### Book
```json
{
  "_id": "ObjectId",
  "title": "string",
  "author": "string",
  "description": "string",
  "genre": "string",
  "price": "number",
  "quantity": "number",
  "image": "string (Cloudinary URL)",
  "rating": "number",
  "publisher": "PublisherId",
  "reviews": ["ReviewId"],
  "condition": "string",
  "createdAt": "date"
}
```

### Review
```json
{
  "_id": "ObjectId",
  "buyer": "BuyerId",
  "rating": "number",
  "comment": "string",
  "createdAt": "date"
}
```

### AntiqueBook (Auction)
```json
{
  "_id": "ObjectId",
  "title": "string",
  "author": "string",
  "description": "string",
  "genre": "string",
  "condition": "string",
  "basePrice": "number",
  "auctionStart": "date",
  "auctionEnd": "date",
  "image": "string (Cloudinary URL)",
  "authenticationImage": "string (Cloudinary URL)",
  "publisher": "PublisherId",
  "publishedAt": "date",
  "biddingHistory": [
    {
      "bidder": "BuyerId",
      "amount": "number",
      "timestamp": "date"
    }
  ],
  "currentPrice": "number"
}
```

---

## Routes / APIs

### Authentication APIs

- `POST /auth/login` — Login for all user roles.
- `GET /auth/logout` — Logout user (clears JWT cookie).

---

### Buyer APIs

- `GET /buyer/dashboard` — Buyer dashboard (recommended, trending, most sold).
- `GET /buyer/search?q=QUERY` — Search books by title, author, or genre.
- `GET /buyer/filter` — Filter and sort books (`category`, `sort`, `condition`, `priceRange`).
- `GET /buyer/search-page` — Render search page with all books.
- `GET /buyer/product-detail/:id` — Get details of a specific book.
- `POST /buyer/review/:bookId` — Add a review to a book.
- `GET /buyer/cart` — View cart.
- `POST /buyer/cart/add` — Add book to cart.
- `PATCH /buyer/cart/update-quantity` — Update quantity of a cart item.
- `DELETE /buyer/cart/remove` — Remove item from cart.
- `GET /buyer/checkout` — View checkout page.
- `POST /buyer/checkout/place-order` — Place an order.
- `GET /buyer/wishlist` — View wishlist.
- `POST /buyer/wishlist/add` — Add book to wishlist.
- `DELETE /buyer/wishlist/remove` — Remove book from wishlist.
- `GET /buyer/profile` — View buyer profile.
- `PUT /buyer/profile` — Update buyer profile.
- `POST /buyer/update-profile/:id` — Update buyer profile (alternate).
- `GET /buyer/orders` — View all orders.
- `GET /buyer/auction-page` — View auction page.
- `GET /buyer/auction-ongoing/:id` — View ongoing auction item.
- `POST /buyer/auctions/:id/bid` — Place a bid on an auction item.
- `GET /buyer/auction-item-detail/:id` — View auction item details.

---

### Publisher APIs

- `GET /publisher/dashboard` — Publisher dashboard.
- `GET /publisher/signup` — Publisher signup page.
- `POST /publisher/signup` — Register a new publisher.
- `GET /publisher/publish-book` — Render publish book page.
- `POST /publisher/publish-book` — Publish a new book.
- `GET /publisher/sell-antique` — Render sell antique book page.
- `POST /publisher/sell-antique` — List an antique book for auction.
- `GET /publisher/books` — List all books by publisher.
- `GET /publisher/book/:id` — Get a specific book by publisher.
- `PUT /publisher/book/:id` — Update a book.
- `DELETE /publisher/book/:id` — Delete a book.

---

### Admin APIs

- `GET /admin/dashboard/:key` — Admin dashboard with stats.
- `GET /admin/users` — List all users.
- `DELETE /admin/user/:id` — Delete a user.
- `GET /admin/publishers` — List all publishers.
- `DELETE /admin/publishers/:id/ban` — Ban a publisher.

---

### Auction APIs

- `GET /auction` — Get current auction items.
- `GET /auction/:id` — Get auction item details.
- `POST /auction/bid` — Place a bid (real-time via Socket.io).

---

### Book APIs

- `GET /books` — Get all books.
- `GET /books/:id` — Get a single book by ID.

---

## Service Functions

### `authService.js`
- `loginUser(email, password)`
- `registerUser(userData)`

### `bookService.js`
- `getAllBooks()`
- `getBookById(bookId)`
- `searchBooks(query)`
- `filterBooks({ category, sort, condition, priceRange })`
- `addBook(bookData)`
- `updateBook(bookId, bookData)`
- `deleteBook(bookId)`
- `addReviewToBook(bookId, review)`

### `publisherService.js`
- `createPublisher(data)`
- `getPublisherByEmail(email)`
- `getPublisherById(id)`
- `addBookToPublisher(publisherId, bookId)`
- `deletePublisherById(publisherId)`

### `buyerService.js`
- `createBuyer(data)`
- `getBuyerByEmail(email)`
- `getBuyerById(id)`
- `deleteBuyerById(buyerId)`
- `updateBuyerCart(buyerId, cart)`
- `updateBuyerWishlist(buyerId, wishlist)`
- `addOrderToBuyer(buyerId, order)`
- `getAllBuyers()`
- `getAllOrders()`
- `updateCartItemQuantity(buyerId, bookId, quantity)`
- `placeOrder(buyerId, cart)`
- `updateBuyerDetails(buyerId, currentPassword, updatedData)`
- `getTopSoldBooks()`
- `getTrendingBooks()`
- `getMetrics()`

### `reviewService.js`
- `addReview(bookId, reviewData)`
- `getReviewsByBook(bookId)`

### `antiqueBookService.js`
- `createAntiqueBook(data)`
- `getOngoingAuctions()`
- `getFutureAuctions()`
- `getEndedAuctions()`
- `getAuctionItemById(id)`
- `addBid(auctionId, bidderId, bidAmount)`

---

## Notes

- All protected routes require a valid JWT token (sent via HTTP-only cookie).
- Image uploads are handled via Cloudinary.
- Real-time auction events are handled via Socket.io.