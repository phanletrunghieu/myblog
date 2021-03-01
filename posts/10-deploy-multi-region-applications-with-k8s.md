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

3.1. Add primary.enabled to `values.yaml`

```yaml
primary:
  enabled: true
```

3.2. Add condition `.Values.primary.enabled` to all file in `templates/primary`

3.3. Add master's information to secondary in `values.yaml`.

```yaml
secondary:
  master:
    host:
    port:
```

3.4. Update env in `templates/secondary/statefulset.yaml`

```yaml
env:
  - name: MARIADB_MASTER_HOST
    value: {{ default (include "mariadb.primary.fullname" .) .Values.secondary.master.host }}
  - name: MARIADB_MASTER_PORT_NUMBER
    value: {{ default .Values.primary.service.port .Values.secondary.master.port | quote }}
```

See my final custom chart on [Github](https://github.com/phanletrunghieu/multi-region-k8s)

## 4. Deploy

Switch `kubectl` to cluster 1 and run

```yaml
helm -n app  upgrade --install app . --create-namespace -f values.region-1.yaml
```

Switch `kubectl` to cluster 2 and run
```yaml
helm -n app  upgrade --install app . --create-namespace -f values.region-2.yaml
```