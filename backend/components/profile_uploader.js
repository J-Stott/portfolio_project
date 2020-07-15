const multer = require('multer');
const settings = require("../../settings");
const path = require("path");

var storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, settings.PROJECT_DIR + '/public/profileImages');
    },
    filename: function (req, file, cb) {
        
        const user = req.user;
        console.log(user);

        const filename = user.username + "_profile." + file.originalname.split(".").pop();

        cb(null, filename);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: function(req, file, cb){
        var ext = path.extname(file.originalname);
        ext = ext.toLowerCase();

        if(ext !== '.png' && ext !== '.jpg' && ext !== '.jpeg'){
            return cb(null, false);
        }

        cb(null, true);
    }
});


module.exports = upload;