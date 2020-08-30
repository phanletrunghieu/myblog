---
author: Hieu Phan
date: '2020-08-30T06:24:00.000Z'
image: /images/7-install-k3s-in-digitalocean/cover.jpg
title: 'Setup K3s on Digitalocean'
readDuration: 10 min
categories:
    - K8s
---

## 1. Create a Droplet

![Create a Droplet](/images/7-install-k3s-in-digitalocean/1-create-a-droplet.png)

Result:

![Result Droplet](/images/7-install-k3s-in-digitalocean/2-result-droplet.jpg)

Try to ssh to droplet.

```bash
ssh root@123.456.789.012
```

Install somethings:

```bash
apt install curl
```

If success, go to step 2.

## 2. Install `k3sup` on your computer

```bash
curl -sLS https://get.k3sup.dev | sh
```

## 3. Install k3s

```bash
k3sup install --ip 123.456.789.012 --user root
```

![Result 3-k3sup](/images/7-install-k3s-in-digitalocean/3-k3sup.png)

## 4. Test

After installing successfully, we have `kubeconfig` file.

```bash
export KUBECONFIG=/Users/hieudeptrai/kubeconfig
kubectl get node -o wide
```

Done!