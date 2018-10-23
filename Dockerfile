FROM node:8
COPY . /root/project
WORKDIR /root/project
RUN apt update && npm install
ENV PORT=2800
ENV STATIC_DATA_PATH=/tmp
ENV STATIC_URL_PREFIX=http://localhost:2800
ENV COUCHDB_URL=http://localhost:8840
CMD ["node", "index.js"]