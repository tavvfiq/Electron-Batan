const crypto = require("crypto");
const path = require("path");
const fs = require("fs");

class Enc {
	constructor( config ) {
		this.config = config;
	}
	encRsa(toEncrypt) {
		var absolutePath = path.resolve(this.config['pubkey']);
		var publicKey = fs.readFileSync(absolutePath, "utf8");
		var buffer = new Buffer.from(toEncrypt);
		var encrypted = crypto.publicEncrypt(publicKey, buffer);
		return encrypted.toString("base64");
	}

	decRsa(toDecrypt){
		var absolutePath = path.resolve(this.config['privkey']);
		var privateKey = fs.readFileSync(absolutePath, "utf8");
		var buffer = new Buffer.from(toDecrypt, "base64");
		var decrypted = crypto.privateDecrypt(privateKey, buffer);
		return decrypted.toString("utf8");
	}

	encrypt(toEncrypt){
		var cipher = crypto.createCipheriv(this.config['algorithm'],this.config['password'],this.config['iv'])
		var crypted = cipher.update(toEncrypt,'utf8','hex')
		crypted += cipher.final('hex');
		return crypted;
	}

	decrypt(toDecrypt){
		var decipher = crypto.createDecipheriv(this.config['algorithm'],this.config['password'],this.config['iv'])
		var dec = decipher.update(toDecrypt,'hex','utf8')
		dec += decipher.final('utf8');
		return dec;
	}

	encB64(toEncode){
		var buffer = new Buffer.from(toEncode, "utf8");
		return buffer.toString("base64");
	}
	decB64(toDecode){
		var buffer = new Buffer.from(toDecode, "base64");
		return buffer.toString("utf8");
	}
}
module.exports = Enc;
