export type CustomMongoObjectWithTimestamps = {
  createdAt?: string;
  _id?: string;
  __v?: number;
  updatedAt?: string;
  [prop: string]: any; // Add this line to accept nested objects
};

export const removeStaticFieldsFromObject = (
  obj: CustomMongoObjectWithTimestamps,
) => {
  for (const key in obj) {
    if (
      key === '_id' ||
      key === 'createdAt' ||
      key === '__v' ||
      key === 'updatedAt'
    ) {
      delete obj[key];
    } else if (typeof obj[key] === 'object' && obj[key] !== null) {
      removeStaticFieldsFromObject(obj[key]);
    }
  }
  return obj;
};
