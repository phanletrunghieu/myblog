---
author: Hieu Phan
date: '2021-02-25T07:00:00.000Z'
image: /images/9-run-multi-node-k8s-cluster-locally/cover.jpg
title: 'Run multi-node kubernetes cluster locally within 15 minutes'
readDuration: 15 min
categories:
    - K8s
---

## 1. Prepare tools

- multipass 1.6.2: `brew install --cask multipass`
- virtualbox 6.1.18: `brew install --cask virtualbox`

> Note: You can install tools with other tools.

## 2. Create 2 VMs

Create 2 nodes Ubuntu 20.04, 1G RAM, 1 CPU, 8GB disk.

```bash
multipass launch -vvv -n node-1 -m 1G -d 8GB -c 1 20.04
multipass launch -vvv -n node-2 -m 1G -d 8GB -c 1 20.04
```

Check in VirtualBox: `sudo VirtualBox`
> Note: Open VirtualBox with sudo

![Nodes in the cluster](/images/9-run-multi-node-k8s-cluster-locally/1-nodes-in-cluster.png)

## 3. Configure the network

Because 2 VMs use network NAT, it has no a special ip. So we need to create 2 new networks: Host-only (nodes will communicate to each other with this network), NAT network (to allow nodes be able to access the internet) and disable the current NAT.


3.1. In **VirtualBox**, open **Preferences**, create a new NatNetwork and enable DHCP

![Create NAT network](/images/9-run-multi-node-k8s-cluster-locally/2-create-nat-network.png)

![NAT network with DHCP](/images/9-run-multi-node-k8s-cluster-locally/3-nat-network-dhcp.png)

3.2. Shutdown nodes

![Shutdown nodes](/images/9-run-multi-node-k8s-cluster-locally/4-shutdown-nodes.png)

3.3. Add new networks

![Add new networks](/images/9-run-multi-node-k8s-cluster-locally/5-add-new-network-1.png)

![Add new networks](/images/9-run-multi-node-k8s-cluster-locally/5-add-new-network-2.png)

3.4. Start nodes

![Start nodes](/images/9-run-multi-node-k8s-cluster-locally/6-start-nodes.png)

3.5. If the `~/.ssh/id_rsa` file is not exist, generate a pair of ssh keys.

```bash
ssh-keygen -C "hieu@deptrai"
cat ~/.ssh/id_rsa.pub
```

3.6. SSH to node 1:

```bash
multipass shell node-1
```

3.7. Write your ssh public key to node-1
```bash
echo "your_ssh_public_key" | tee -a ~/.ssh/authorized_keys
```

Replace `your_ssh_public_key` with `~/.ssh/id_rsa.pub` file's content.

Example:

```bash
echo "ssh-rsa AAAAB3NzaC1yc2E..... hieu@deptrai" | tee -a ~/.ssh/authorized_keys
```

3.8. Enable 2 networks that we enabled

```bash
ip link | grep DOWN
```

They are usually `enp0s8` and `enp0s9`
![Start nodes](/images/9-run-multi-node-k8s-cluster-locally/7-network-down.png)

Run this command with `sudo`. Notice `enp0s8` and `enp0s9`.

```bash
sudo bash -c "cat > /etc/netplan/60-bridge.yaml" <<EOF
network:
  ethernets:
    enp0s8:
      dhcp4: true
      dhcp4-overrides:
        route-metric: 200
    enp0s9:
      dhcp4: true
      dhcp4-overrides:
        route-metric: 200
  version: 2
EOF
```
```bash
sudo netplan apply
ip addr show
```

The `enp0s9`'s ip is `192.168.56.108`

3.9. Exit ssh:
```
exit
```

3.10. Shutdown node-1 -> disable `NAT` at `Adapter 1` -> Start node-1

![Disable network at adapter 1](/images/9-run-multi-node-k8s-cluster-locally/8-disable-network-adapter-1.png)

3.11. Repeat steps `3.6`-`3.10` with `node-2`

Finally, we have IPs:
- Node-1: 192.168.56.108
- Node-2: 192.168.56.109

## 4. Setup a k8s cluster

4.1. Install k3sup

```bash
curl -sLS https://get.k3sup.dev | sh
sudo install k3sup /usr/local/bin/
```

4.2. Install Kubernetes in `node-1` with `master` role.

```bash
k3sup install --ip 192.168.56.108 --user ubuntu --context k3s-1 --k3s-version v1.19.8+k3s1
```

4.3. Install Kubernetes in `node-2` with `worker` role.

```bash
k3sup join --ip 192.168.56.109 --server-ip 192.168.56.108 --user ubuntu --k3s-version v1.19.8+k3s1
```

It will create `kubeconfig` file in your current directory.

## 5. Test

```bash
export KUBECONFIG=/Users/hieudeptrai/kubeconfig
kubectl get node -o wide
```

Done!