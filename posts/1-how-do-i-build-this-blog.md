---
author: Hieu Phan
date: '2020-05-22T17:06:00.000Z'
image: /images/1-how-do-i-build-this-blog/cover.jpg
title: 'Tôi đã tạo blog với Github và markdown thế nào?'
readDuration: 45 min
categories:
    - ReactJS
---

## Chuẩn bị
- Kiến thức cơ bản về ReactJS, NextJS
- Soạn thảo văn bản với markdown
- Tài khoản Github

## Giới thiệu
Github có 1 chức năng là Github Page, cho phép chúng ta deploy những website tĩnh (HTML, css, javascript). Trước đây khi nhắc đến việc tạo ra 1 website tĩnh thì ta sẽ nghĩ ngay đến [GatsbyJS](https://www.gatsbyjs.org), còn NextJS là framework mạnh về việc hỗ trợ xây dựng ứng dụng React Server Side Render (SSR) và routing. Nhưng tin vui là vừa qua NextJS đã có thêm tính năng **Static Exporting**.

> **Static Exporting** là gì vậy? Khác gì so với SSR?
- SSR: server nhận được request -> server render code react thành html -> trả html về client
- Static: html được tạo ra ngay khi ta build app -> server nhận được request -> trả html về client

## Setup

### Khởi tạo NextJS project

```bash
npx create-next-app
# or
yarn create next-app
```

Blog này sẽ được deploy lên Github Page, và để tiện nhất, nhanh nhất, nên sẽ không có chuyện gọi API và lấy data để hiển thị. Dữ liệu blog sẽ được lưu trong những file markdown, mỗi file chứa một bài post.

Cấu trúc thư mục:
- **assets:** các icon, hình ảnh để import trực tiếp vào React
- **components:** các layout, component của blog (Header, Footer, Meta,...)
- **data:** file `config.json` chứa các thông tin tổng quát của website (title, description, url,...)
- **pages:** folder mặc định của NextJS. Mỗi file trong thư mục này tương ứng với 1 trang web.
- **posts:** chứa các file markdown, nội dung của các bài post trong blog
- **public:** chủ yếu chứa các hình ảnh chèn vào các bài post
- **styles:** chứa các file scss, làm đẹp cho web

### Config NextJS load file *.md

Cài `raw-loader` cho webpack
```bash
yarn add raw-loader
```

Thêm nội dung sau vào file `next.config.js`. (Nếu không có thì tạo)

```js
module.exports = {
    poweredByHeader: false,
    webpack: function(config) {
        config.module.rules.push({
            test: /\.md$/,
            use: 'raw-loader',
        })
        return config
    },
}
```

### Config NextJS load icon svg

Cài `babel-plugin-inline-react-svg`
```bash
yarn add --dev babel-plugin-inline-react-svg
```

Thêm nội dung sau vào file `.babelrc`. (Nếu không có thì tạo)

```json
{
    "presets": [ "next/babel" ],
    "plugins": [ "inline-react-svg" ]
}
```

### Cài scss

Chỉ cần cài module `sass`

```bash
yarn add sass
```

## Code
**Ý tưởng:** NextJS hỗ trợ build static thông qua 2 hàm `getStaticProps` và `getStaticPaths`. 2 hàm này được gọi khi build project. Mỗi file trong thư mục `pages` đều được NextJS hỗ trợ 2 hàm này. 

- getStaticProps: với hàm này, ta sẽ đọc dữ liệu từ file .md và truyền vào props của ReactComponent. Trong hàm này ta sẽ thực hiện:
    - Đối với trang chủ hoặc trang category, ta sẽ đọc nội dung của tất cả file *.md. Truyền data vào props
    - Đối với trang chi tiết, ta chỉ cần đọc đúng 1 file *md. Ví dụ `/post/abc-de` thì ta cần đọc file `abc-de.md`
- getStaticPaths: url của 1 bài post là `/post/[slug]`. Ví dụ ta có 2 bài post là `post 1` và `post 2`, thì url là `/post/post-1` và `/post/post-2`. Như vậy trong hàm này, chúng ta sẽ thực hiện các tác vụ
    - List hết tất cả file *.md trong folder `posts`
    - Chuẩn hoá tên file thành url. `Post 1` thành `/post/post-1`

## Deploy lên Github Page

Bình thường khi export project NextJS thành file html, ta sẽ dùng lệnh

```bash
next export
```

Nhưng Github Page sử dụng Jekyll, mà Jekyll thì không đọc được các file có ký tự "_" ở đầu (`_next`, `_app.js`). NextJS lại export ra rất nhiều file như thế. Nên ta cần disable Jekyll trong project.

Thay đổi các scripts trong file package.json như sau:
```json
"scripts": {
    "dev": "next dev",
    "build": "next build && next export && touch out/.nojekyll",
    "start": "next start"
}
```

Chạy lệnh:
```bash
yarn build
```

NextJS sẽ export file là lưu vào folder `out`. Giờ ta chỉ cần push hết các file trong folder `out` lênn Github.

![out folder](/images/1-how-do-i-build-this-blog/out-folder.png)

URL Github Page sẽ có dạng https://{username}.github.io. Ví dụ: https://phanletrunghieu.github.io.
Vậy làm sao để code trong `out` có thể truy cập được thông qua tên miền trên.
Tạo 1 repo với lên là {username}.github.io (Ví dụ: phanletrunghieu.github.io). Và commit -> push code bên trong `out` lên.

Xong!

## Kết

[Project mẫu](https://github.com/phanletrunghieu/myblog)
