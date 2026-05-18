import logger from "../../config/logger.js";
import { socketAuthMiddleware } from "./auction.middleware.js";
import { addBid } from "../../services/antiqueBook.services.js";
import AntiqueBook from "../../models/AntiqueBook.model.js";

const auctionEndTimers = new Map();

export const initializeAuctionSocket = (io) => {
  const auctionNamespace = io.of("/auction");
  auctionNamespace.use(socketAuthMiddleware);

  auctionNamespace.on("connection", (socket) => {
    logger.debug(`Client connected to auction namespace: socketId=${socket.id}, userId=${socket.user.id}`);
    socket.currentAuctionId = null;

    socket.on("joinAuction", async (data) => {
      try {
        const { auctionId } = data;
        if (!auctionId) {
          socket.emit("auctionError", { message: "Auction ID is required" });
          return;
        }

        const room = `auction:${auctionId}`;
        await socket.join(room);
        socket.currentAuctionId = auctionId;
        logger.debug(`User ${socket.user.id} joined auction room: ${room}`);

        socket.emit("joinedAuction", { success: true, auctionId, message: "Successfully joined auction room" });

        const audienceCount = auctionNamespace.adapter.rooms.get(room)?.size || 0;
        auctionNamespace.to(room).emit("audienceUpdate", { auctionId, audienceCount });

        if (!auctionEndTimers.has(auctionId)) {
          scheduleAuctionEnd(auctionNamespace, auctionId);
        }
      } catch (error) {
        logger.error(`Error joining auction: ${error.message}`);
        socket.emit("auctionError", { message: "Failed to join auction" });
      }
    });

    socket.on("leaveAuction", async (data) => {
      try {
        const { auctionId } = data;
        if (!auctionId) {
          socket.emit("auctionError", { message: "Auction ID is required" });
          return;
        }

        const room = `auction:${auctionId}`;
        await socket.leave(room);
        socket.currentAuctionId = null;
        logger.debug(`User ${socket.user.id} left auction room: ${room}`);

        socket.emit("leftAuction", { success: true, auctionId, message: "Successfully left auction room" });

        const audienceCount = auctionNamespace.adapter.rooms.get(room)?.size || 0;
        auctionNamespace.to(room).emit("audienceUpdate", { auctionId, audienceCount });
      } catch (error) {
        logger.error(`Error leaving auction: ${error.message}`);
        socket.emit("auctionError", { message: "Failed to leave auction" });
      }
    });

    socket.on("placeBid", async (data) => {
      try {
        const { auctionId, bidAmount } = data;

        if (!auctionId) {
          socket.emit("auctionError", { message: "Auction ID is required", field: "auctionId" });
          return;
        }

        if (typeof bidAmount !== "number" || isNaN(bidAmount)) {
          socket.emit("auctionError", { message: "Bid amount is required", field: "bidAmount" });
          return;
        }

        logger.info(`User ${socket.user.id} attempting to place bid on auction ${auctionId}: amount=${bidAmount}`);

        const updatedBook = await addBid(auctionId, socket.user.id, bidAmount);
        
        if (!updatedBook) {
          socket.emit("auctionError", { message: "Bid failed" });
          return; 
        }

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

        const room = `auction:${auctionId}`;
        auctionNamespace.to(room).emit("newBid", payload);
        logger.info(`Bid placed successfully: user=${socket.user.id}, auction=${auctionId}, amount=${bidAmount}`);
      } catch (error) {
        logger.error(`Error placing bid via socket: ${error.message}`);
        socket.emit("auctionError", { message: error.message || "Bid failed" });
      }
    });

    socket.on("disconnect", (reason) => {
      logger.debug(`Client disconnected from auction namespace: socketId=${socket.id}, reason=${reason}`);

      if (socket.currentAuctionId) {
        setImmediate(() => {
          const room = `auction:${socket.currentAuctionId}`;
          const audienceCount = auctionNamespace.adapter.rooms.get(room)?.size || 0;
          auctionNamespace.to(room).emit("audienceUpdate", { auctionId: socket.currentAuctionId, audienceCount });
        });
      }
    });
  });

  logger.debug("Auction namespace initialized at /auction");
};

const scheduleAuctionEnd = async (auctionNamespace, auctionId) => {
  try {
    const book = await AntiqueBook.findById(auctionId).select("auctionEnd").lean();
    if (!book) return;

    const now = new Date();
    const endTime = new Date(book.auctionEnd);
    const delay = endTime - now;

    if (delay <= 0) {
      emitAuctionEnded(auctionNamespace, auctionId);
      return;
    }

    const timer = setTimeout(() => {
      emitAuctionEnded(auctionNamespace, auctionId);
      auctionEndTimers.delete(auctionId);
    }, delay);

    auctionEndTimers.set(auctionId, timer);
    logger.debug(`Scheduled auction end for ${auctionId} in ${delay}ms`);
  } catch (error) {
    logger.error(`Error scheduling auction end: ${error.message}`);
  }
};

const emitAuctionEnded = (auctionNamespace, auctionId) => {
  const room = `auction:${auctionId}`;
  auctionNamespace.to(room).emit("auctionEnded", { auctionId, serverTime: new Date() });
  logger.debug(`Emitted auctionEnded for ${auctionId}`);
};
