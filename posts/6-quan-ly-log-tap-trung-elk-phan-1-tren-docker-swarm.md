---
author: Hieu Phan
date: '2020-06-22T15:22:00.000Z'
image: /images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/cover.jpg
title: 'Quản lý log tập trung trong microservice với ELK. Phần 1: trên docker swarm'
readDuration: 30 min
categories:
    - Docker
    - Microservice
---

## 1. Khởi tạo docker swarm

Bạn có thể dùng nhiều server có cài sẵn docker để tạo thành 1 cluster. Tốt nhất là docker cùng version để tránh gặp những lỗi tào lao. Trong bài viết này mình dùng docker-machine để giả lập 3 node để demo.

### 1.1. Tạo 1 cluster với 3 node

```bash
docker-machine create -d virtualbox node1
docker-machine create -d virtualbox node2
docker-machine create -d virtualbox node3
```

Kiểm tra các node đã tạo

```bash
docker-machine ls
```

![List node](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/1-list-node.png)

### 1.2. Cho `node1` làm node manager.

```bash
docker-machine ssh node1
docker swarm init --advertise-addr 192.168.99.104
```

`192.168.99.104` là ip của node 1, đã kiểm tra ở trên.

![List node](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/2-init-swarm.png)

Kết quả ở trên cho ta 1 command để các node khác có thể join vào cluster.

### 1.3. Join các node còn lại vào cluster

Ta lần lượt ssh vào từng node và chạy lệnh join ở trên.

```bash
docker-machine ssh node2
docker swarm join --token SWMTKN-1-5dk4ysohsctxbifjmb6x8xa5i6qps81au5k4fmzzqmne3l3oz0-ac99bh5vrw8zm3lychgpu3cwh 192.168.99.104:2377
```

```bash
docker-machine ssh node3
docker swarm join --token SWMTKN-1-5dk4ysohsctxbifjmb6x8xa5i6qps81au5k4fmzzqmne3l3oz0-ac99bh5vrw8zm3lychgpu3cwh 192.168.99.104:2377
```

> Chú ý: `token` trong lệnh `docker swarm join` sẽ khác nhau ở mỗi lần chạy. Nên chỗ này đừng copy của mình nhé. Lỗi đấy!
