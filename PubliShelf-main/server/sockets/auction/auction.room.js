export const getAuctionRoom = (auctionId) => {
  return `auction:${auctionId}`;
};

export const joinAuctionRoom = async (socket, auctionId) => {
  const room = getAuctionRoom(auctionId);
  await socket.join(room);
  return room;
};

export const leaveAuctionRoom = async (socket, auctionId) => {
  const room = getAuctionRoom(auctionId);
  await socket.leave(room);
  return room;
};
