# Auction Polling System
This document explains the auction system in PubliShelf, with a focus on the **client-server polling architecture** used to keep ongoing auctions in sync.

## High-Level Overview
- **Domain model**: Antique auctions are represented by the `AntiqueBook` model on the server.
- **Key client pages**:
  - Auction listing page (`client/src/pages/buyer/auction/AuctionPage.jsx`) → [AuctionPage.jsx](/client/src/pages/buyer/auction/AuctionPage.jsx)
  - Auction item detail page (`client/src/pages/buyer/auction/AuctionItemDetail.jsx`) → [AuctionItemDetail.jsx](/client/src/pages/buyer/auction/AuctionItemDetail.jsx)
  - Live auction page (`client/src/pages/buyer/auction/AuctionOngoing.jsx`) → [AuctionOngoing.jsx](/client/src/pages/buyer/auction/AuctionOngoing.jsx)
- **Key client service module**:
  - Auction HTTP service (`client/src/services/antiqueBook.services.js`) → [antiqueBook.services.js](/client/src/services/antiqueBook.services.js)
- **Key backend components**:
  - Model (`server/models/AntiqueBook.model.js`) → [AntiqueBook.model.js](/server/models/AntiqueBook.model.js)
  - Services (`server/services/antiqueBook.services.js`) → [antiqueBook.services.js](/server/services/antiqueBook.services.js)
  - Controller (`server/controllers/buyer.controller.js`) → [buyer.controller.js](/server/controllers/buyer.controller.js)
  - Routes (`server/routes/buyer.routes.js`) → [buyer.routes.js](/server/routes/buyer.routes.js)

- **Polling focus**: [AuctionOngoing.jsx](/client/src/pages/buyer/auction/AuctionOngoing.jsx) on the client and `getAuctionPollingData` in [antiqueBook.services.js](/server/services/antiqueBook.services.js) on the server.

The system is built around **REST endpoints** and **client-side polling** (no websockets). The polling is adaptive: the closer the auction is to ending, the more frequently the client polls.

---
## Data Model
### `AntiqueBook` schema ([AntiqueBook.model.js](/server/models/AntiqueBook.model.js))
Key fields for auctions:
- `basePrice: Number` – initial price.
- `currentPrice: Number` – latest winning bid amount.
- `biddingHistory: [biddingHistorySchema]`:
  - `bidder: ObjectId ref Buyer`
  - `bidAmount: Number`
  - `bidTime: Date` (default: `Date.now`)
- `auctionStart: Date` / `auctionEnd: Date` – auction window.
- `status: 'pending' | 'approved' | 'rejected'` – only **approved** items participate in auctions and accept bids.

The `biddingHistory` array stores a chronological log of all bids, which is used both for computing the current price and for exposing an ordered bidding history to the client.

---

## Backend: Services and API

### Service: [antiqueBook.services.js](/server/services/antiqueBook.services.js)

#### 1. `addBid(bookId, bidderId, bidAmount)`
Core behaviour (simplified):
- Adds a new bid to `biddingHistory` and updates `currentPrice`.
- Persists the auction and populates the new bid’s `bidder` details.
- Updates the in-memory `auctionBidTimeCache` with the latest `bidTime`.

This is the single write path that feeds all read-side polling.

#### 2. Listing auctions
- `getOngoingAuctions()`
- `getFutureAuctions()`
- `getEndedAuctions()`

These functions back the non-polling auction listing views.

#### 3. `getAuctionItemById(bookId)`
- Fetches a single `AntiqueBook` by id.
- Populates `biddingHistory.bidder` (firstname, lastname, email).
- Throws if not found or `status !== 'approved'`.

Used by:
- `getAuctionItemDetail` (single auction overview page).
- `getAuctionOngoing` (full data for the ongoing/live auction view).

#### 4. `getAuctionPollingData(bookId, lastBidTime)`
This is the **core polling endpoint** implementation.

Internal pieces:
- `auctionBidTimeCache: Map<string, string>`
  - Maps `auctionId` to the latest known `bidTime` (ISO string).

Steps:
1. **Cache short-circuit**
   - If `lastBidTime` is provided and matches the cached last bid time for the auction, return:
     - `hasNewBids: false`
     - `newBids: []`
     - `timestamp: Date`
     - `cached: true`
   - This avoids any DB query if the client is already up to date.

2. **Validate auction** (cache miss or first poll)
   - Load the auction (selecting `status` and `currentPrice`).
   - Throw if not found or `status !== 'approved'`.

3. **Compute `newBids`**
   - If `lastBidTime` is defined:
     - Query for the same document with `biddingHistory.bidTime > lastBidTime`.
     - Populate `biddingHistory.bidder`.
     - Filter `biddingHistory` in memory to keep only bids with `bidTime > lastBidTime`.
   - If `lastBidTime` is **not** defined (first poll for this client):
     - Fetch the document with `biddingHistory` and populate bidders.
     - Sort all bids by `bidTime` descending.
     - Take the most recent **5** bids and set them as `newBids`.

4. **Update cache**
   - If `newBids.length > 0`, compute the latest `bidTime` and store it in `auctionBidTimeCache` for this `bookId`.
   - Else, if `lastBidTime` is provided and there was no cached value yet, store `lastBidTime` into the cache.

5. **Return payload**
   The returned object is intentionally minimal:
   - `currentPrice: number | undefined`
   - `newBids: Bid[]` (only bids more recent than the client’s last known `bidTime`, or last 5 on first poll)
   - `hasNewBids: boolean`
   - `timestamp: Date`
   - `cached: boolean`

---
# Auction Polling System
This document explains how the live auction page keeps itself in sync with the server using **manual and automatic polling** on the frontend and a **lightweight incremental polling endpoint** on the backend.

The goal is to:
- Avoid refetching the full auction document on every poll.
- Only send new bids and essential fields.
- Keep DB load low under many concurrent clients.

---
## 1. Frontend polling ([AuctionOngoing.jsx](/client/src/pages/buyer/auction/AuctionOngoing.jsx), [antiqueBook.services.js](/client/src/services/antiqueBook.services.js))

### 1.1 Initial load (full auction fetch)
On mount, the component calls `getAuctionOngoing(id)` once:
- Stores `response.data.book` in `book`.
- Computes the latest `bidTime` from `book.biddingHistory`.
- Sets both `lastBidTimeRef.current` and `lastBidTime` to that value.
- Marks `fullDataLoaded = true` so polling can start.

This gives the page a complete, consistent snapshot before any polling.

### 1.2 Shared incremental sync function
All polling (manual and automatic) goes through a single function:
- `syncAuctionData(isManual = false)`
  - Short-circuits if `isBidding` is `true` (do not poll while placing a bid).
  - Calls `getAuctionPollData(id, lastBidTimeRef.current || lastBidTime)`.
  - On success:
    - If `pollData.hasNewBids && pollData.newBids.length > 0`:
      - Finds the most recent bid by `bidTime`.
      - Updates `book`:
        - `currentPrice = pollData.currentPrice`.
        - `biddingHistory = [...pollData.newBids, ...prev.biddingHistory]` (prepend new bids).
      - Updates `lastBidTimeRef.current` and `lastBidTime` to the latest `bidTime`.
    - Else if `!pollData.cached && pollData.currentPrice !== undefined`:
      - Updates `book.currentPrice` only, in case the price changed without new bids (edge case).
  - For manual syncs (`isManual === true`), shows success or error toasts and toggles `isSyncing`.

Helpers:
- `fetchIncrementalUpdate = () => syncAuctionData(false)` (used by automatic polling).
- `handleManualSync = () => syncAuctionData(true)` (used by the manual "Sync now" button).

### 1.3 Automatic polling (adaptive interval)
The main polling `useEffect` depends on `[book?.auctionEnd, fullDataLoaded, isBidding]`:

1. **Guard conditions**
   - Do nothing until `book?.auctionEnd` exists and `fullDataLoaded` is `true`.

2. **Determine interval**
   - Calls `getPollingInterval(book.auctionEnd)` which returns a **millisecond** interval based on time remaining:
     - Auction already ended: return `null` (stop polling).
     - `timeLeftMin > 30`  → `30000` ms (30 s).
     - `10 < timeLeftMin ≤ 30` → `10000` ms (10 s).
     - `1 < timeLeftMin ≤ 10` → `1000` ms (1 s).
     - `timeLeftMin ≤ 1` → `500` ms.
   - If result is `null`, sets `currentPollInterval = 0` and returns.
   - Otherwise, converts to seconds (`pollIntervalSec`) and sets:
     - `currentPollInterval = pollIntervalSec`.
     - `nextSyncIn = pollIntervalSec`.

3. **Intervals used for auto polling**
   The effect sets up **three intervals** and cleans them up on unmount/dependency change:
   - **Polling interval (`pollIntervalId`)**
     - Runs every `pollIntervalMs`.
     - If `!isBidding`, calls `fetchIncrementalUpdate()` and resets `nextSyncIn` to `pollIntervalSec`.
   - **Countdown interval (`countdownId`)**
     - Runs every 1 second.
     - If `isBidding`, no-op.
     - Otherwise, decrements `nextSyncIn` by 1.
     - When `nextSyncIn <= 1`, triggers `fetchIncrementalUpdate()` and resets to `pollIntervalSec`.
     - This drives the "Next sync in Xs" countdown in the UI.
   - **Re-evaluation interval (`reevaluateIntervalId`)**
     - Runs every 60 seconds.
     - Recomputes `newMs = getPollingInterval(book.auctionEnd)`.
     - If `newMs` is non-null and its seconds differ from the current `pollIntervalSec`:
       - Clears the existing `pollIntervalId`.
       - Creates a new polling interval with the new cadence.
       - Updates `currentPollInterval` and `nextSyncIn` accordingly.

4. **Bidding-aware behaviour**
   - All automatic polling checks `isBidding` before syncing.
   - This avoids racing the UI update from a just-placed bid with a poll that might arrive at the same time.

### 1.4 Manual polling ("Sync now" button)
Manual polling uses the same core logic but is **user-triggered**:
- `handleManualSync` calls `syncAuctionData(true)`.
- `syncAuctionData(true)`:
  - Sets `isSyncing = true` before the request.
  - Calls the same `getAuctionPollData` endpoint with the current `lastBidTime`.
  - Merges `pollData.newBids` and `currentPrice` into state exactly as in automatic polling.
  - Shows a toast on success/failure.
  - Finally sets `isSyncing = false`.

The UI disables the button and shows a spinner while `isSyncing` is true, guaranteeing that repeated clicks do not spam the server.

### 1.5 Bidding and last-bid tracking
Bids are placed via `placeBidApi({ auctionId: id, bidAmount })`:
- `handlePlaceBid` enforces a minimum increment of `₹100` over the current price.
- `confirmBid`:
  - Sets `isBidding = true` (pausing auto polling and countdown updates).
  - Calls the backend `POST /api/buyer/auctions/:id/bid`.
  - On success:
    - Updates `book.currentPrice` and prepends `newBid` to `book.biddingHistory`.
    - Sets both `lastBidTimeRef.current` and `lastBidTime` to `newBid.bidTime`.
  - Finally sets `isBidding = false`, which allows automatic polling to resume.

This ensures the local UI is immediately up to date after a bid, and the next poll will use the new `lastBidTime` so the server does not resend already-known bids.

---
## 2. Backend polling implementation
Main backend files involved:
- [antiqueBook.services.js](/server/services/antiqueBook.services.js)
- [buyer.controller.js](/server/controllers/buyer.controller.js)
- [buyer.routes.js](/server/routes/buyer.routes.js)

### 2.1 HTTP endpoints
Under the buyer router (`/api/buyer`):
- `GET /auction-ongoing/:id`
  - Returns the full auction document (including `biddingHistory`) for the initial page load.
- `GET /auction-poll/:id?lastBidTime=...`
  - Returns only **incremental updates** for polling clients.
- `POST /auctions/:id/bid`
  - Places a bid and returns the updated `currentPrice` and the new bid entry.

Controller methods:
- `getAuctionOngoing` → uses `getAuctionItemById` to fetch the full auction.
- `getAuctionPollData` → calls `getAuctionPollingData(bookId, lastBidTime)`.
- `placeBid` → calls `addBid(bookId, bidderId, bidAmount)` and returns `{ currentPrice, newBid }`.

All are wrapped in the standard `{ success, message, data }` response format.

### 2.2 `addBid` (write path)
Function: `addBid(bookId, bidderId, bidAmount)` in [antiqueBook.services.js](/server/services/antiqueBook.services.js):
- Loads the `AntiqueBook` by id.
- Validates that:
  - `status === 'approved'`.
  - Current time is between `auctionStart` and `auctionEnd`.
- Enforces minimum bid:
  - `minAllowed = max(basePrice, currentPrice)`.
  - Rejects if `bidAmount <= minAllowed`.
- Appends a new `biddingHistory` entry and updates `currentPrice`.
- Saves the document and populates `biddingHistory.bidder`.
- Updates the in-memory cache (section 2.3) with the latest `bidTime` for this auction.

This write path is separate from polling reads but feeds them by keeping `currentPrice` and `biddingHistory` consistent and up to date.

### 2.3 `getAuctionPollingData` (read path)
Function: `getAuctionPollingData(bookId, lastBidTime)` in [antiqueBook.services.js](/server/services/antiqueBook.services.js).

Internal cache:
- `auctionBidTimeCache: Map<string, string>`
  - Maps `auctionId` → latest known `bidTime` (ISO string).

Steps:
1. **Cache short-circuit**
   - If a `lastBidTime` is provided and equals the cached last bid time for this auction:
     - Returns immediately without hitting the database:
       - `hasNewBids: false`
       - `newBids: []`
       - `currentPrice: undefined`
       - `timestamp: new Date()`
       - `cached: true`
   - This is the most common case when many clients are polling but no new bids have arrived.

2. **Validate auction**
   - Loads the auction document (at least `status` and `currentPrice`).
   - Throws if it does not exist or `status !== 'approved'`.

3. **Compute new bids**
   - If `lastBidTime` is defined (client has seen some bids):
     - Queries for this auction with `biddingHistory.bidTime > lastBidTime`.
     - Populates `biddingHistory.bidder`.
     - Filters `biddingHistory` in memory to keep only bids with `bidTime > lastBidTime`.
   - If `lastBidTime` is **not** defined (first poll for this client):
     - Fetches the document with full `biddingHistory`.
     - Sorts bids by `bidTime` descending.
     - Returns only the most recent 5 bids as `newBids`.

4. **Update cache**
   - If there are `newBids`:
     - Computes the latest `bidTime` across all `newBids`.
     - Stores that value in `auctionBidTimeCache` for this `bookId`.
   - Else, if there is no cached value yet but `lastBidTime` is provided:
     - Seeds the cache with `lastBidTime`.

5. **Return minimal payload**
   The function returns a small object optimised for polling:
   - `currentPrice: number` (current highest bid or base price).
   - `newBids: Bid[]` (only bids newer than the client’s `lastBidTime`, or last 5 on first poll).
   - `hasNewBids: boolean`.
   - `timestamp: Date` (server time).
   - `cached: boolean` (whether the response was served purely from cache).

The frontend then merges `newBids` into its local `biddingHistory` and updates `lastBidTime`.

### 2.4 Summary of behaviour
End-to-end, the system behaves as follows:
1. The live auction page loads once via `GET /auction-ongoing/:id`.
2. It starts an adaptive polling loop that calls `GET /auction-poll/:id?lastBidTime=...`:
   - Frequently near auction end.
   - Less frequently when the auction has plenty of time left.
3. The server uses `lastBidTime` and `auctionBidTimeCache` to avoid unnecessary DB reads and only returns new bids.
4. The client merges `newBids` into local state and advances its `lastBidTime`.
5. Manual sync and bidding re-use the same incremental update path, with safeguards to avoid conflicting updates during an in-flight bid.

This design keeps network and database usage low while still giving buyers a near-real-time view of ongoing auctions.

---
## 3. Performance metrics (k6)
Load tests in [auction_test_results.txt](/tests/auction_test_results.txt) compare:
- The **pre-split** detail endpoint (`GET /auction-item-detail/:id`).
- The **post-split** polling endpoint (`GET /auction-poll/:id`) before and after adding the in-memory `auctionBidTimeCache`.

**Baseline (200 VUs, GET /auction-item-detail/:id, pre-split)**
- ~724 ms avg latency, ~105 req/s, 0% errors.
- Bandwidth over 10s: ~552 kB sent, ~1.48 MB received.
- Per request: ~450 B sent, ~1.2 KB received (full auction detail payload).

**At 100 VUs (GET /auction-poll/:id)**
- Before cache: ~691 ms avg latency, ~55.8 req/s, 0% errors.
  - Bandwidth: ~297 kB sent, ~316 kB received over 10s (~480 B sent, ~510 B received per request).
- After cache: ~22.1 ms avg latency, ~96.2 req/s, 0% errors.
  - Bandwidth: ~479 kB sent, ~503 kB received over 10s (~480 B sent, ~500 B received per request).
- Approximate improvement vs **no-cache poll**: ~31× lower latency, ~1.7× higher throughput, with similar per-request payload.

**At 200 VUs (GET /auction-poll/:id)**
- Before cache: ~2672 ms avg latency, ~47.9 req/s, 0% errors.
  - Bandwidth: ~302 kB sent, ~321 kB received (~480 B sent, ~510 B received per request).
- After cache: ~31.7 ms avg latency, ~188.1 req/s, 0% errors.
  - Bandwidth: ~958 kB sent, ~1006 kB received over 10s (~480 B sent, ~500 B received per request).
- Approximate improvement vs **no-cache poll**: ~84× lower latency, ~3.9× higher throughput.

**At 500 VUs (GET /auction-poll/:id, cached)**
- After cache: ~68.4 ms avg latency, ~445.2 req/s, ~5.8% failed requests.
  - Bandwidth: ~2.21 MB sent, ~2.32 MB received over 10s (~450–475 B per request each way).

### Quick comparison table
| Scenario                            | Endpoint                     | VUs | Avg latency (ms) | Req/s | Sent / request | Received / request |
|-------------------------------------|------------------------------|-----|------------------|-------|----------------|--------------------|
| Baseline (pre-split detail)         | `GET /auction-item-detail`   | 200 | ~724             | ~105  | ~450 B         | ~1.2 KB            |
| Poll (no cache)                     | `GET /auction-poll`          | 100 | ~691             | ~56   | ~480 B         | ~510 B             |
| Poll (cached)                       | `GET /auction-poll`          | 100 | ~22              | ~96   | ~480 B         | ~500 B             |
| Poll (no cache)                     | `GET /auction-poll`          | 200 | ~2672            | ~48   | ~480 B         | ~510 B             |
| Poll (cached)                       | `GET /auction-poll`          | 200 | ~32              | ~188  | ~480 B         | ~500 B             |
| Poll (cached, higher load)          | `GET /auction-poll`          | 500 | ~68              | ~445  | ~450–475 B     | ~450–475 B         |

Overall:
- **Splitting the endpoints** (detail vs poll) is where the biggest **payload** reduction happens: from ~1.2 KB per response down to ~0.5 KB for polling.
- **Caching and incremental responses** then improve **latency and throughput** on top of that, while keeping the per-request payload for polling roughly constant.