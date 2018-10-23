FROM node:8
COPY . /root/project
WORKDIR /root/project
RUN apt update && npm install
ENV PORT=2800
ENV STATIC_REF_DATA_PATH=/home/4T/usr/landy/grading_data/reference_scan
ENV STATIC_SOL_DATA_PATH=/home/4T/usr/landy/grading_data/student_solution_scan
ENV STATIC_URL_PREFIX=http://localhost:2800
ENV COUCHDB_URL=http://localhost:8840
CMD ["node", "index.js"]