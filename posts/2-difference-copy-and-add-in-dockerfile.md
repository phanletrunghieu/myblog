---
author: Hieu Phan
date: '2020-06-11T14:55:00.000Z'
image: /images/2-difference-copy-and-add-in-dockerfile/cover.jpg
title: 'Dockerfile: COPY khác ADD?'
readDuration: 10 min
categories:
    - Docker
---

Nếu bạn thường build docker image hoặc đọc các tài liệu về docker, thỉnh thoảng bạn sẽ gặp `COPY` và `ADD`. Vậy `COPY` khác `ADD` có gì khác nhau? Nên sử dụng cái nào?

Cả `COPY` và `ADD` có một chức năng chung là chép file từ 1 nơi nào đó vào bên trong docker image. Còn điểm khác nhau?

## COPY

`COPY` cho phép bạn chép 1 file từ đĩa cứng vào docker image.

## ADD

`ADD`ngoài chức năng chép file từ đĩa cứng, còn hỗ trợ chép file từ 2 nguồn khác là:
- Chép file từ 1 URL
- Giải nén file tar vào docker image. Ví dụ `ADD http://abc.com/app.tar.xz /app/`, các file bên trong file `app.tar.xz` sẽ được chép vào `/app/` trong docker image.

## Khi nào nên dùng `COPY`, khi nào nên dùng `ADD`?
Riêng cá nhân mình, thì mình đa số dùng `COPY`, và rất ít dùng `ADD`. Vậy có phải mình đã bỏ qua 1 tính của docker là chép file từ url hay giải nén.

> Docker image khi build sẽ tạo ra nhiều layer. Ứng với mỗi lệnh trong Dockerfile, sẽ có 1 layer được sinh ra. Khi dùng lệnh `ADD` để download file, và file đó sẽ được lưu mãi mãi tại layer của lệnh `ADD` đó. Trường hợp file cần download có dung lượng khoảng vài GB, nhưng chỉ dùng tạm để build app, và có thể xoá cũng không thể ảnh hưởng đến app, thì dùng `ADD` kích thước docker image sẽ rất lớn.

**Tip:** Với việc download file mình sẽ `curl` thay thế cho `ADD`.
Ví dụ

```Dockerfile
RUN curl -O https://example.com/files/abc.tar.gz && \
    tar -xzf abc.tar.gz && \
    echo "do something" && \
    rm -rf abc && \
    rm abc.tar.gz
```

Như vậy docker sẽ lưu lại 1 layer, layer này không có file `abc.tar.gz`