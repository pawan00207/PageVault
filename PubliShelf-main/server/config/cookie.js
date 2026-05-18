const getTokenExpiry = () => {
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  const match = expiresIn.match(/^(\d+)([dhms])$/);
  
  if (!match) return 24 * 60 * 60 * 1000;
  
  const value = parseInt(match[1]);
  const unit = match[2];
  
  const multipliers = {
    's': 1000,
    'm': 60 * 1000,
    'h': 60 * 60 * 1000,
    'd': 24 * 60 * 60 * 1000
  };
  
  return value * multipliers[unit];
};

export const getCookieOptions = () => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
  maxAge: getTokenExpiry()
});
