import path, { join } from 'path';
import { diskStorage } from 'multer';
import { v4 } from 'uuid';
// export const multerConfig = {
//   dest: join(__dirname, '..', 'photos'),
// };

export const multerOptions = {
  storage: diskStorage({
    destination: './photos',
    filename: (req, file, cb) => {
      const filename: string = v4() + '-' + Date.now();
      const extension: string = path.parse(file.originalname).ext;
      cb(null, `${filename}${extension}`);
    },
  }),
  limits: {
    fileSize: 1024 * 1024 * 10, // Limits file size to 10MB
  },
};
