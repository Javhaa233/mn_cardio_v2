const crypto = require('crypto');
const xypSign = crypto.createSign('SHA256');
const fs = require('fs');
const path = require('path');

class Sign {
  /**
   * ХУР системийг ашиглаж буй байгууллага өөрийн тоон гарын үсгийг зурах модуль
   * @param keyPath ҮДТ-өөс олгогдсон key мэдээллийг агуулж буй .key файлын зам
   * @param accessToken ҮДТ-өөс олгогдсон аccesstoken ийн мэдээлэл
   * @param time timestamp мэдээлэл
   *
   * @author buyandelger
   * @since 2023-05-17
   */
  constructor(keyPath, accessToken, time) {
    this.KeyPath = keyPath;
    this.AccessToken = accessToken;
    this.Timestamp = time.toString();
  }

  /**
   *
   * @returns {{timeStamp, signature: string, accessToken}}
   */
  sign() {
    var signData = this.AccessToken + '.' + this.Timestamp;
    xypSign.write(signData);
    xypSign.end();

    const key = fs.readFileSync(path.join(__dirname, this.KeyPath));
    var signature_b64 = xypSign.sign(key, 'base64');

    return {
      accessToken: this.AccessToken,
      timeStamp: this.Timestamp,
      signature: signature_b64,
    };
  }
}

module.exports = Sign;
