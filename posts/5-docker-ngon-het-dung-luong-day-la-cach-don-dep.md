---
author: Hieu Phan
date: '2020-06-20T09:26:00.000Z'
image: /images/5-docker-ngon-het-dung-luong-day-la-cach-don-dep/cover.jpg
title: 'Docker ngốn hết dung lượng. Đây là cách dọn dẹp?'
readDuration: 15 min
categories:
    - Docker
---


## 1. Container
### 1.1. Stop and remove all containers

```bash
docker stop $(docker ps -aq)
docker rm $(docker ps -aq)
```

### 1.2. Remove idle container

```bash
docker rm $(docker ps -a -f status=exited -f status=created -q)
```

## 2. Volume
### 2.1. Remove dangling volumes
Yêu cầu: Docker 1.9 and later

Dangling volumes là những volumes không liên kết với bất kỳ 1 container nào.

```bash
docker volume prune
```

### 2.2. Remove container & it's volumes

```bash
docker rm -v container_name
```

## 3. Image
### 3.1. Remove unsed images

```bash
docker rmi $(docker images -a -q)
```

### 3.2. Remove dangling images

Dangling images là những images có tag là `<none>`.

Khi bạn dùng multistage để build 1 image thì sẽ xuất hiện những images kiểu thế này. Việc giữ lại những image này sẽ giúp bạn build nhanh hơn trong những lần tới, nhưng thường nó cũng ngốn dung lượng khá lớn. Hãy cân nhắc kỹ trước khi xóa nó.

**List**
```bash
docker images -f dangling=true
```

**Remove**
```bash
docker images purge
```

## 4. Remove Unused/Dangling Images, Containers, Volumes, and Networks

Docker cung cấp 1 command duy nhất để xóa những thứ không cần thiết. Bạn có thể thử. Nhưng nếu 1 ngày bạn chạy lệnh này rồi mà thấy đĩa cứng vẫn bị ngốn dung lượng một cách bí ẩn, hãy thử dùng các lệnh ở trên.

```bash
docker system prune
```

**Include unused images (not just dangling images)**
```bash
docker system prune -a
```

## 5. Giới hạn logs của docker

Khi bạn chạy lệnh `docker logs container_name`, bạn sẽ xem được logs của container đó. Mỗi 1 container sẽ có logs riêng của nó. Mặc định, docker sẽ không giớ hạn số lượng/dung lượng logs của 1 container. Logs quá nhiều dấn đến disk của bạn cũng bị chiếm nhiều dung lượng

> Log là 1 trong những tác nhân gây ngốn dung lượng **một cách thầm lặng** mà bạn sẽ khó mà nghĩ đến

Vì thế, ta cần giới hạn logs của mỗi container.

Tìm đến file `/etc/docker/daemon.json` (nếu không có thì tạo file mới). Thêm vào file đó với nội dung như sau:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

- **max-file:** số lượng file logs tối đa của 1 container
- **max-size:** dung lượng tối đa của 1 file log mà 1 container sở hữu

Từ config trên => 1 container có tối đa 3 file log, 1 file log có dung lượng tối đa 10MB. => Log tối đa 30MB.

Khi log đã ghi hết file thứ 3, thì file thứ 1 (cũ nhất) sẽ bị xoá để ghi log mới.