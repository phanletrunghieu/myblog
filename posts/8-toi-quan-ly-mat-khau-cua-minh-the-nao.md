---
author: Hieu Phan
date: '2020-10-07T08:00:00.000Z'
image: /images/8-toi-quan-ly-mat-khau-cua-minh-the-nao/cover.jpg
title: 'Tôi quản lý 1 nùi mật khẩu thế nào?'
readDuration: 15 min
categories:
    - Tip
---

## 1. Nhu cầu

- Lưu được mật khẩu an toàn nhất có thể
- Đồng bộ trên các nền tảng: Android, iOS, browser,..
- Không giới hạn thiết bị
- Hỗ trợ đăng nhập 2 lớp
- Free càng tốt

## 2. Tool mình đã từng sử dụng

**Lastpass**

Tool khá xịn, đầy đủ các chức năng:

- Đồng bộ trên các nền tảng: Android, iOS, browser,..
- Không giới hạn thiết bị
- Đặt biệt là free

**1password**

Có đầy đủ các tính năng xịn xò, nhưng không miễn phí.

## 3. Giải pháp hiện tại mình đang dùng

Dạo 1 vòng tìm kiếm thì thấy những app có tính đăng nhập 2 lớp đều là gói premium hết.

Chuyển hướng qua tìm opensource thì thấy có thằng Bitwarden. App này có đủ tính năng mình cần và hỗ trợ self host.

### Tìm 1 con server free:

- EC2 t2.micro của Amazon
- f1-micro của Google Cloud

### Chuẩn bị 1 domain

Ví dụ `bws.example.com`

### Chuẩn bị thêm

- docker 19.03+
- docker-compose 1.26+
- nginx 1.14+
- certbot

```
sudo add-apt-repository ppa:certbot/certbot
sudo apt-get update
sudo apt-get install python-certbot-nginx
```

- 1 SMTP account: có thể dùng `smtp.gmail.com` với account gmail luôn

### Deploy Bitwarden server

- Official (C#): https://github.com/bitwarden/server
- Non-Official (Rust): https://github.com/dani-garcia/bitwarden_rs

Có 2 option, ở đây mình dùng server Rust cho gọn nhẹ.

Tạo 1 file `docker-compose.yaml`

```yaml
version: '3'

services:
  bitwarden:
    image: bitwardenrs/server:1.16.3
    restart: always
    volumes:
      - ./bw-data:/data
    ports:
      - 8080:80 # web, api, ...
      - 3012:3012 # websockets
    environment:
      WEBSOCKET_ENABLED: 'true'
      SIGNUPS_ALLOWED: 'true'
      SHOW_PASSWORD_HINT: 'true'
      ROCKET_WORKERS: 20
      ADMIN_TOKEN: 'xxxxxxxhieudeptraixxxxxxx'
      DOMAIN: https://bws.example.com
      SMTP_HOST: smtp.gmail.com
      SMTP_FROM: abc@gmail.com
      SMTP_PORT: 587
      SMTP_SSL: 'true'
      SMTP_USERNAME: abc@gmail.com
      SMTP_PASSWORD: xxxxx
```

Chạy file docker-compose `docker-compose up -d`


Tạo 1 file `bitwarden` tại `/etc/nginx/sites-enabled`

```nginx
server {
    listen 80;
    listen [::]:80;

    server_name bws.example.com;

    client_max_body_size 128M;

    location / {
        proxy_pass       http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    location /notifications/hub {
        proxy_pass         http://localhost:3012;
        proxy_set_header   Host $host;
        proxy_http_version 1.1;
        proxy_set_header   Upgrade $http_upgrade;
        proxy_set_header   Connection "Upgrade";
    }

    location /notifications/hub/negotiate {
        proxy_pass http://localhost:8080;
    }

    location /admin {
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;

        proxy_pass http://localhost:8080;
    }
}
```

Apply nginx config: `sudo nginx -s reload`

### Config thêm https cho an toàn hơn

```
sudo certbot --nginx -d bws.example.com
```

### Tạo user

Vào https://bws.example.com/admin, điền admin token trong file docker-compose.yaml vào.

![Đăng ký/đăng nhập Bitwarden](/images/8-toi-quan-ly-mat-khau-cua-minh-the-nao/1-dang-nhap.png)

### Cài extension/app

- Browser extension: https://github.com/bitwarden/browser
- Android: https://play.google.com/store/apps/details?id=com.x8bit.bitwarden
- iOS: https://apps.apple.com/us/app/bitwarden-password-manager/id1137397744

## 4. Một vài hình ảnh nhá hàng

Web

![Web](/images/8-toi-quan-ly-mat-khau-cua-minh-the-nao/2-web.png)

Xem password

![Xem password](/images/8-toi-quan-ly-mat-khau-cua-minh-the-nao/3-add-password.png)

Extension

![Extension](/images/8-toi-quan-ly-mat-khau-cua-minh-the-nao/4-extension.png)

Extension nhận diện mật khẩu

![Extension nhận diện mật khẩu](/images/8-toi-quan-ly-mat-khau-cua-minh-the-nao/5-extension-detect-password.png)