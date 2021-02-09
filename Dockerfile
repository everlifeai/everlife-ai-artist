FROM ubuntu:20.04

WORKDIR /

RUN DEBIAN_FRONTEND="noninteractive" apt-get update && DEBIAN_FRONTEND="noninteractive" apt-get install -y \
    tzdata \
    python3 \
    python3-pip \
    wget \
    unzip \
    ffmpeg

RUN pip3 install tensorflow scipy moviepy 

RUN wget https://codeload.github.com/lengstrom/fast-style-transfer/zip/master && mv master master.zip && unzip -q master.zip  && rm -rf master.zip

ADD ./checkpoints/*.ckpt /fast-style-transfer-master/

RUN apt-get remove -y \
    wget \
    unzip

WORKDIR /fast-style-transfer-master
