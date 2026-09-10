const fs = require('fs');
const path = require('path');
const imageThumbnail = require('image-thumbnail');

class ImageHelper {
  getType(filePath) {
    return path.extname(filePath).replace('.', '');
  }

  encodeBase64(filePath, Type) {
    try {
      const bitmap = fs.readFileSync(filePath);
      //this.getType(filePath)
      return 'data:image/' + Type + ';base64, ' + new Buffer(bitmap).toString('base64');
    } catch (ex) {
      console.log(ex);
      return '';
    }
  }

  encodeBase64NotType(filePath) {
    const bitmap = fs.readFileSync(filePath);
    return new Buffer(bitmap).toString('base64');
  }

  thumbnailBase64(filePath, callback) {
    imageThumbnail(filePath)
      .then((thumbnail) => {
        callback &&
          callback(
            'data:image/' +
              this.getType(filePath) +
              ';base64, ' +
              new Buffer(thumbnail).toString('base64')
          );
      })
      .catch((err) => {
        callback && callback('');
      });
  }

  async thumbnailBase64Sync(filePath, Type, Percentage) {
    try {
      const options = {
        percentage: Percentage ? Percentage : 25,
        responseType: 'base64',
      };
      const thumbnail = await imageThumbnail(filePath, options);
      // var str = new Buffer(thumbnail).toString("base64");
      // this.getType(filePath)
      return 'data:image/' + Type + ';base64, ' + thumbnail;
    } catch (ex) {
      console.log(ex);
      return '';
    }
  }
}

module.exports = new ImageHelper();
