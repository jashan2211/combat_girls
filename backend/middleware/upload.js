const multer = require('multer');

// ---------------------------------------------------------------------------
// Video upload -- memory storage, 500 MB limit
// ---------------------------------------------------------------------------
const videoStorage = multer.memoryStorage();

const videoFileFilter = (_req, file, cb) => {
  const allowedMimes = [
    'video/mp4',
    'video/quicktime',
    'video/x-msvideo',
    'video/x-matroska',
    'video/webm',
    'video/mpeg',
    'video/x-flv',
    'video/3gpp',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed (mp4, mov, avi, mkv, webm, mpeg, flv, 3gpp)'), false);
  }
};

const videoUpload = multer({
  storage: videoStorage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500 MB
  fileFilter: videoFileFilter,
});

// ---------------------------------------------------------------------------
// Image upload -- memory storage, 10 MB limit
// ---------------------------------------------------------------------------
const imageStorage = multer.memoryStorage();

const imageFileFilter = (_req, file, cb) => {
  const allowedMimes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, gif, webp, svg)'), false);
  }
};

const imageUpload = multer({
  storage: imageStorage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10 MB
  fileFilter: imageFileFilter,
});

module.exports = { videoUpload, imageUpload };
