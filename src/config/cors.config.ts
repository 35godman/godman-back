const allowedOrigins = ['https://vd.fitvend.fit', 'https://mvd.fitvend.fit'];
const testAllowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://localhost:3002',
  'http://localhost:3003',
];

export const corsOptions = {
  origin: (origin, callback) => {
    if (allowedOrigins.includes(origin) || origin === undefined) {
      callback(null, origin);
    } else {
      callback(new Error(`Not allowed by CORS ${origin}`));
    }
  },
  credentials: true,
};

export const testCorsOptions = {
  origin: (origin, callback) => {
    if (testAllowedOrigins.includes(origin) || origin === undefined) {
      callback(null, origin);
    } else {
      callback(new Error(`Not allowed by CORS ${origin}`));
    }
  },
  credentials: true,
};
