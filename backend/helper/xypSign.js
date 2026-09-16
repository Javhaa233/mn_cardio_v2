const crypto = require('crypto');
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
    // The Sign object MUST be created per call. It was a module-level
    // `crypto.createSign('SHA256')` shared by every caller: .write()/.end()
    // finalise that stream, so the FIRST signature in a process was correct and
    // every one after it threw ERR_STREAM_WRITE_AFTER_END. That is why XYP
    // appeared to "work until it didn't" and came back after a restart.
    const xypSign = crypto.createSign('SHA256');
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
