---
author: Hieu Phan
date: '2020-06-14T11:56:00.000Z'
image: /images/4-gitlab-cac-tinh-nang-hay-nhung-it-duoc-chu-y/cover.jpg
title: 'Gitlab: Các tính năng hay nhưng ít được chú ý'
readDuration: 15 min
categories:
    - Gitlab
---

Có thể nói Gitlab là 1 hệ sinh thái bao gồm các công cụ khá đầy đủ cho việc phát triển phần mềm, bao gồm: git registry, docker registry, CI/CD, task management,... Mĩnh sẽ giới thiệu thêm 1 vài tính năng nhỏ, nhưng rất hay

## 1. Gitlab CI Template

**Template trong cùng 1 file `.gitlab-ci.yml`**

```yaml
variables:
  GIT_CLEAN_FLAGS: none
  IMAGE_NAME: registry.domain.com/app/payment_service
  
.build:
  image: docker:stable
  stage: build
  services:
    - docker:dind
  script:
    - mkdir -p ~/.docker
    - echo $DOCKER_AUTH_CONFIG > ~/.docker/config.json
    - docker build -t $IMAGE_NAME:$IMAGE_TAG .
    - docker push $IMAGE_NAME:$IMAGE_TAG

build-stagging:
  extends: .build
  variables:
    IMAGE_TAG: latest-dev
  only:
    - master

build-prod-version:
  extends: .build
  variables:
    IMAGE_TAG: $CI_COMMIT_TAG
  only:
    - tag
  except:
    - branches

build-prod-latest:
  extends: .build
  variables:
    IMAGE_TAG: latest
  only:
    - tag
  except:
    - branches
```

Ta sẽ định nghĩa những phần chung của tác vụ build vào `.build`. Trong `.build`, phần script mình có dùng 2 biến môi trường `IMAGE_NAME` và `IMAGE_TAG`. `IMAGE_NAME` thì mình có định nghĩa ở global `variables`. Còn `IMAGE_TAG` được định nghĩa ở đâu?

Sau đó ta sẽ định nghĩa những job build khác cho riêng từng môi trường, và extends lại `.build`. Ở đoạn trước mình còn câu hỏi `IMAGE_TAG` được định nghĩa ở đâu, thì ở từng môi trường mình sẽ build ra 1 docker image với 1 tag khác nhau. Vậy ở mỗi job extend từ `.build` ta sẽ thêm `IMAGE_TAG` vào `variables`, nó sẽ tự động gắn vào scripts trước đó để chạy.

**Template từ 1 repo khác**

Ví dụ ta có 2 project được đặt ở 2 repo. 2 repo này ta có nhu cậu chạy những job giống nhau. Ta có thể tạo 1 repo `gitlab-ci-template` chứa 1 file `template.yml` có nội dung:

```yaml
variables:
  GO111MODULE: on
  GIT_CLEAN_FLAGS: none

stages:
  - test

test:
  stage: test
  retry:
    max: 1
  only:
    - master
    - merge_requests
  script:
    - make lint
    - make test
```


Ở 2 repo kia, ta tạo file `.gitlab-ci.yml` như sau:

```yaml
include:
  - project: 'example-group/gitlab-ci-template'
    ref: master
    file: '/template.yml'

image: golang:1.14.4-alpine
```

Vậy 2 repo đã có job `test`

## 2. Coverage

![Coverage example](/images/4-gitlab-cac-tinh-nang-hay-nhung-it-duoc-chu-y/coverage-example.png)

Ví dụ đối với 1 project sử dụng golang, khi test mình sẽ dùng lệnh

```bash
go test -race -v -coverprofile=coverage/coverage.txt.tmp -count=1  ./...
```

Trong 1 đống kết quả trả về thì có 1 dòng hiển thị test đã coverage bao nhiêu phần trăm

```
total:					(statements)	93.6%
```

Dùng regex để lấy đoạn này ra là `/total:\s+\(statements\)\s+(\d+.\d+\%)/`

Cuối cùng là gắn regex trên vào `.gitlab-ci.yml` như sau:

```yaml
unit-test:
  image: golang:1.14.4-alpine
  stage: test
  only:
    - merge_requests
  script:
    - make unit-test
  coverage: '/total:\s+\(statements\)\s+(\d+.\d+\%)/'
```

## 3. Tự động retry job khi fail

[Gitlab document](https://docs.gitlab.com/ee/ci/yaml/#retry)

```yaml
unit-test:
  image: golang:1.14.4-alpine
  stage: test
  only:
    - merge_requests
  script:
    - make unit-test
  retry:
    max: 2
    when:
      - runner_system_failure
      - stuck_or_timeout_failure
      - stuck_or_timeout_failure
      - scheduler_failure
      - api_failure
```
