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

## 1. Kiến trúc

![List node](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/architect.png)

## 2. Khởi tạo docker swarm

Bạn có thể dùng nhiều server có cài sẵn docker để tạo thành 1 cluster. Tốt nhất là docker cùng version để tránh gặp những lỗi tào lao. Trong bài viết này mình dùng docker-machine để giả lập 3 node để demo.

### 2.1. Tạo 1 cluster với 3 node

```bash
docker-machine create -d virtualbox --virtualbox-memory "2048" node1
docker-machine create -d virtualbox --virtualbox-memory "1024" node2
docker-machine create -d virtualbox --virtualbox-memory "1024" node3
```

Fixing `out of memory` error of Elasticsearch

```bash
docker-machine ssh node1 sudo sysctl -w vm.max_map_count=262144
docker-machine ssh node2 sudo sysctl -w vm.max_map_count=262144
docker-machine ssh node3 sudo sysctl -w vm.max_map_count=262144
```

Kiểm tra các node đã tạo

```bash
docker-machine ls
```

![List node](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/1-list-node.png)

### 2.2. Cho `node1` làm node manager.

```bash
docker-machine ssh node1
docker swarm init --advertise-addr 192.168.99.104
```

`192.168.99.104` là ip của node 1, đã kiểm tra ở trên.

![List node](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/2-init-swarm.png)

Kết quả ở trên cho ta 1 command để các node khác có thể join vào cluster.

### 2.3. Join các node còn lại vào cluster

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

## 3. Deploy ELK lên docker swarm

SSH vào node manager `docker-machine ssh node1`.

Tạo 1 file `docker-stack.yml` có nội dung như sau:

```yaml
version: '3'

services:
  elasticsearch:
    image: docker.elastic.co/elasticsearch/elasticsearch:7.8.0
    ports:
      - "9200:9200"
    volumes:
      - esdata:/usr/share/elasticsearch/data
    environment:
      ES_JAVA_OPTS: "-Xmx256m -Xms256m"
      ELASTIC_PASSWORD: "changeme"
      discovery.type: single-node
    deploy:
      placement:
        constraints: [node.role == manager]

  logstash:
    image: docker.elastic.co/logstash/logstash:7.8.0
    volumes:
      - ./logstash.conf:/usr/share/logstash/pipeline/logstash.conf
    depends_on:
      - elasticsearch
    deploy:
      placement:
        constraints: [node.role == manager]

  kibana:
    image: docker.elastic.co/kibana/kibana:7.8.0
    environment:
      ELASTICSEARCH_HOSTS: 'http://elasticsearch:9200'
    ports:
      - "5601:5601"
    depends_on:
      - logstash
    deploy:
      placement:
        constraints: [node.role == manager]

  logspout:
    image: gliderlabs/logspout:v3
    command: 'udp://logstash:5000'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    depends_on:
      - logstash
    deploy:
      mode: global
      restart_policy:
        condition: on-failure
        delay: 30s

  visualizer:
    image: dockersamples/visualizer:stable
    ports:
      - "8081:8080"
    volumes:
      - "/var/run/docker.sock:/var/run/docker.sock"
    labels:
      app: "visualizer"
    deploy:
      placement:
        constraints: [node.role == manager]

volumes:
  esdata:
    driver: local
```

Tạo 1 file `logstash.conf` có nội dung như sau:

```
input {
   udp {
   		port => 5000
   		codec => json
   	}
}

## Add your filters / logstash plugins configuration here

filter {
  if [docker][image] =~ /logstash/ {
    drop { }
  }
}

output {
    elasticsearch {
      hosts => "elasticsearch:9200"
      user => "elastic"
      password => "changeme"
    }

    stdout { codec => rubydebug }
}
```

Tiến hành deploy

```bash
docker stack deploy -c docker-stack.yml elk
```

Thường mình sẽ gặp 1 lỗi là logspout sẽ không kết nối được đến logstash, do logstash chưa init xong. Bạn hãy đợi 1 thời gian rồi chạy `docker service update --force elk_logspout` để restart lại logspout trên các node.

## 4. Xem log từ Kibana

Dùng browser truy cập vào 1 node bất kỳ trong swarm với port `5601`

![List node](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/1-list-node.png)

Trong trường hợp của mình, mình sẽ truy cập vào `http://192.168.99.104:5601`.

![Kibana](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/3-kibana-1.jpg)

Tạo 1 index pattern `logstash*`
![Kibana](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/4-kibana-2.jpg)

![Kibana](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/5-kibana-3.jpg)

![Kibana](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/6-kibana-4.jpg)

![Kibana](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/7-kibana-5.jpg)

![Kibana](/images/6-quan-ly-log-tap-trung-elk-phan-1-tren-docker-swarm/8-kibana-6.png)

Oke! Tới đây giao diện để truy xuất log đã hiện ra. Bạn có thể filter log theo thời gian, theo app,... Chỗ này bạn có thể tự mò nhé, giao diện kibana cũng khá dễ sử dụng.