import { getAuctionRoom } from "./auction.room.js";
import logger from "../../config/logger.js";

export const emitNewBid = (io, auctionId, payload) => {
  const room = getAuctionRoom(auctionId);
  const auctionNamespace = io.of("/auction");
  
  auctionNamespace.to(room).emit("newBid", payload);
  
  logger.info(`Broadcasted newBid to room ${room}: currentPrice=${payload.currentPrice}`);
};

export const emitAudienceUpdate = (io, auctionId) => {
  const room = getAuctionRoom(auctionId);
  const auctionNamespace = io.of("/auction");
  
  const audienceCount = auctionNamespace.adapter.rooms.get(room)?.size || 0;
  
  const payload = {
    auctionId,
    audienceCount
  };
  
  auctionNamespace.to(room).emit("audienceUpdate", payload);
  
  logger.debug(`Broadcasted audienceUpdate to room ${room}: audienceCount=${audienceCount}`);
};
