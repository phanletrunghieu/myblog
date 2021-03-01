---
author: Hieu Phan
date: '2021-03-01T07:00:00.000Z'
image: /images/10-deploy-multi-region-applications-with-k8s/cover.jpg
title: 'Deploy multi-region applications with k8s'
readDuration: 30 min
categories:
    - K8s
---

## 1. Run 2 K8S clusters locally for practicing

Create 2 clusters with 1 master for each cluster. Image clusters put in different regions.

See [this post](/post/9-run-multi-node-k8s-cluster-locally).

## 2. Solution

In my case, I use MariaDB with `replication` architecture.

![Solution](/images/10-deploy-multi-region-applications-with-k8s/1-solution.jpg)

I use `bitnami/mariadb` 9.3.4 chart.

I need run mariadb with primary & secondary in different nodes, but `bitnami/mariadb` allow run 1 primary and many secondary nodes. So I need run some customization.

## 3. Customize `bitnami/mariadb` chart

See my final custom chart on [Github](https://github.com/phanletrunghieu/multi-region-k8s)