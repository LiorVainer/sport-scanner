import multer from 'multer';

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        console.log('file', file);
        cb(null, 'public/');
    },
    filename: function (req, file, cb) {
        const ext = file.originalname.split('.').filter(Boolean).slice(1).join('.');
        console.log(ext);
        cb(null, Date.now() + '.' + ext);
    },
});

export const upload = multer({ storage: storage });
