# WHATSAPP GATEWAY

> **WhatsApp Gateway** is a lightweight RESTful API built with Node.js that bridges your application with WhatsApp Web (multi-device). Designed for sending and receiving messages, automating replies, managing sessions, and integrating WhatsApp into external systems.

## ⚙️ Configuration: Setup Phone Number in `config.json`

The `config.json` file contains essential settings for your WhatsApp Gateway, including owner info, database, limits, and pairing settings.

| Field     | Type       | Description                                                             |
| --------- | ---------- | ----------------------------------------------------------------------- |
| `state`   | `boolean`  | Indicates whether pairing mode is active (`true`) or inactive (`false`) |
| `number`  | `number`   | The WhatsApp bot's phone number in international format                 |
| `version` | `number[]` | Array representing the client version info for pairing                  |

## ⚙️ Apache2 Virtual Host Setup with `setup.sh`

This project includes a shell script (`setup.sh`) that automates the configuration of an Apache virtual host for your domain.

### 📁 Requirements

- A Linux-based server (e.g., Ubuntu or Debian)
- Apache2 installed and enabled
- `sudo` or root access
- Your project directory placed under `/root/project`

### 📝 Configuration Overview

The script will:

- Create a virtual host configuration file in `/etc/apache2/sites-available/`
- Set the `DocumentRoot` to the `public` folder of your project directory
- Define access rules to allow traffic
- Log errors and access attempts in the appropriate Apache log directory

### 🚀 Usage Instructions

1. Edit the `setup.sh` file and replace the placeholder domain (e.g., `your-domain.com`) with your actual domain name.
2. Run the script using `sudo` to allow changes to Apache configuration.
3. The script will automatically enable the new site and reload Apache.
4. Ensure your DNS is correctly pointed to your server's IP address.
5. Once complete, your domain should be accessible via HTTP.

### ✅ Notes

- You can customize the script further to support HTTPS using Let's Encrypt (`certbot`).
- Make sure the `public` directory contains your frontend files (e.g., from a Vue or React build).

## MESSAGING API

Below are the currently supported messaging API endpoints available for use.

To access these endpoints, an `x-neoxr-token` is required for authentication.  
You can obtain your token by sending the command `.token` to your connected WhatsApp number.

The bot will respond with a unique token that you can include in your request headers like this:


```Javascript
const axios = require('axios')

(async () => {
  const json = await (await axios.post('http://your-domain.com/v1/text', {
    number: 62850000000,
    text: 'Hi there!'
  }, {
    headers: {
      'x-neoxr-token': '28ae8wxxxxxxxxxxxxx'
    }
  })).data
  console.log(json)
})()
```

> [!WARNING]
> Keep your token secure. Treat it like a password and avoid exposing it publicly or in client-side code.

### SEND TEXT MESSAGE

> POST : **/v1/text**

| Field    | Type     | Required | Description                                                  |
| -------- | -------- | -------- | ------------------------------------------------------------ |
| `number` | `number` | ✅ Yes    | Target WhatsApp number in international format (without `+`) |
| `text`   | `string` | ✅ Yes    | Message text to send                                          |

### SEND MEDIA MESSAGE

> POST : **/v1/media**

| Field     | Type     | Required | Description                                                                 |
|-----------|----------|----------|-----------------------------------------------------------------------------|
| `number`  | `number` | ✅ Yes   | Target WhatsApp number in international format (without `+`)               |
| `url`     | `string` | ✅ Yes   | Direct URL of the media to send (image, video, or audio)                   |
| `caption` | `string` | ❌ No    | Optional caption (only applicable to images and videos)                    |

### SEND DOCUMENT MESSAGE

> POST : **/v1/file**

| Field      | Type     | Required | Description                                                   |
|------------|----------|----------|---------------------------------------------------------------|
| `number`   | `number` | ✅ Yes   | Target WhatsApp number in international format (without `+`) |
| `url`      | `string` | ✅ Yes   | Direct URL of the file to send                                |
| `filename` | `string` | ✅ Yes   | Desired filename for the sent file                            |
| `caption`  | `string` | ❌ No    | Optional caption to display along with the file               |

### SEND VOICE MESSAGE

> POST : **/v1/voice**

| Field     | Type     | Required | Description                                                                 |
|-----------|----------|----------|-----------------------------------------------------------------------------|
| `number`  | `number` | ✅ Yes   | Target WhatsApp number in international format (without `+`)               |
| `url`     | `string` | ✅ Yes   | Direct URL of the voice message file (must be audio format, e.g. `.ogg`, `.mp3`) |

### SEND BUTTON MESSAGE

> POST : **/v1/button**

| Field    | Type     | Required | Description                                                  |
| -------- | -------- | -------- | ------------------------------------------------------------ |
| `number` | `number` | ✅ Yes    | Target WhatsApp number in international format (without `+`) |
| `media`  | `string` | ❌ No     | Optional URL of image or video to include                    |
| `text`   | `string` | ✅ Yes    | Message text to display above the buttons                    |
| `button` | `string` | ✅ Yes    | `JSON.stringify` of an array of buttons (see format below)   |

```JSON
[
  { "text": "Promo", "command": ".promo" },
  { "text": "Clain", "command": ".claim" }
]
```
Each button must include :

- `text` : Label shown on the button
- `command` : Text sent back to the bot when clicked

> [!WARNING]
> This project does **not** use the official WhatsApp Business API. It works by WhatsApp Web Socket (multi-device). Using this software may violate WhatsApp's Terms of Service, and could result in your number being **permanently banned**. **Use at your own risk. The author is not responsible for any consequences, including account bans or data loss.**