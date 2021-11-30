FROM node:12

RUN mkdir /usr/local/java
COPY ../jdk-8u311-linux-x64.tar.gz /usr/local/java
WORKDIR /usr/local/java
RUN tar zxvf jre-8u291-linux-x64.tar.gz
RUN sudo update-alternatives --install "/usr/bin/java" "java" "/usr/local/java/jre1.8.0_291/bin/java" 1
RUN java -version

#RUN apt -y install default-jdk

