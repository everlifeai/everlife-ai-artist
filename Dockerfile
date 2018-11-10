FROM ubuntu:16.04 

WORKDIR /

RUN apt-get update && apt-get install -y \
    python \
    python-pip \
    wget \
    unzip

RUN pip install tensorflow scipy moviepy 
RUN imageio_download_bin ffmpeg

RUN wget https://github.com/lengstrom/fast-style-transfer/archive/master.zip && unzip -q master.zip  && rm -rf master.zip

ADD ./*.ckpt /fast-style-transfer-master/

RUN apt-get remove -y \
    wget \
    unzip

WORKDIR /fast-style-transfer-master
