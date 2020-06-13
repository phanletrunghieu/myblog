---
author: Hieu Phan
date: '2020-06-13T16:11:00.000Z'
image: /images/3-how-to-trigger-ci/cover.jpg
title: 'Làm thế nào để trigger ci bằng commandline?'
readDuration: 5 min
categories:
    - GI/CD
    - Tip
---

Đôi lúc bạn sẽ có nhu cần trigger CI cho 1 repo.

Làm thế nào nhỉ?

## Thử cách 1: Vào web ui để tạo 1 pipeline.

Với cách này sẽ tốn khá nhiều thời gian, nào là truy cập web, nào là chuyển vào trang pipeline của repo,...

=> Mất thời gian

## Thử cách 2: Change code > commit -> push

Còn với cách này sẽ nhanh hơn cách thứ 1, nhưng phải change code, và sẽ có 2 trường hợp:
- 1 commit để change code, thêm 1 commit nữa để restore code về như cũ.
- Tìm 1 chỗ nào đó không ảnh hưởng đến code khi chạy để thay đổi, ví dụ là comment.

=> Hơi phức tạp

## 1 solution có tiện hơn chăng?

Theo nguyên lý hoạt động thì CI sẽ trigger khi có 1 commit mới.

> Vậy ta chỉ cần commit mà không change code

```bash
git commit --allow-empty -m "Trigger ci"
```