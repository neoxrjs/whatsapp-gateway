#!/bin/bash
sudo apt update -y
sudo apt upgrade -y
sudo apt install apache2 ffmpeg nano curl --no-install-recommends -y
sudo apt clean

curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.40.1/install.sh | bash
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"  # This loads nvm
[ -s "$NVM_DIR/bash_completion" ] && \. "$NVM_DIR/bash_completion"

nvm install 20.18.1
nvm alias default 20.18.1
nvm use default

mv -f whatsapp.conf /etc/apache2/sites-available
a2ensite whatsapp.conf

a2enmod proxy
a2enmod proxy_http
a2enmod proxy_balancer
a2enmod lbmethod_byrequests

systemctl restart apache2

npm i -g yarn pm2
yarn install
pm2 start pm2.config.cjs && pm2 logs