import logger from "../../config/logger.js";
import { addBid } from "../../services/antiqueBook.services.js";
import { emitNewBid } from "./auction.emitter.js";

export const registerAuctionHandlers = (socket, io) => {
  socket.on("placeBid", async (data) => {
    try {
      const { auctionId, bidAmount } = data;

      if (!auctionId) {
        socket.emit("auctionError", { 
          message: "Auction ID is required",
          field: "auctionId"
        });
        return;
      }

      if (!bidAmount) {
        socket.emit("auctionError", { 
          message: "Bid amount is required",
          field: "bidAmount"
        });
        return;
      }

      logger.info(`User ${socket.user.id} attempting to place bid on auction ${auctionId}: amount=${bidAmount}`);

      const updatedBook = await addBid(auctionId, socket.user.id, bidAmount);

      const newBid = updatedBook.biddingHistory[updatedBook.biddingHistory.length - 1];

      const payload = {
        auctionId,
        currentPrice: updatedBook.currentPrice,
        bid: {
          _id: newBid._id,
          bidder: newBid.bidder,
          bidAmount: newBid.bidAmount,
          bidTime: newBid.bidTime
        },
        serverTime: new Date()
      };

      emitNewBid(io, auctionId, payload);

      logger.info(`Bid placed successfully: user=${socket.user.id}, auction=${auctionId}, amount=${bidAmount}`);
    } catch (error) {
      logger.error(`Error placing bid via socket: ${error.message}`);
      
      if (error.message === "Bid no longer valid. Price may have changed.") {
        socket.emit("auctionError", { message: error.message });
      } else if (error.message && error.message.includes("ended")) {
        socket.emit("auctionError", { message: "Auction has ended." });
      } else {
        socket.emit("auctionError", { 
          message: error.message || "Failed to place bid"
        });
      }
    }
  });
};
