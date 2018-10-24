FROM node:8
COPY . /root/project
WORKDIR /root/project
RUN apt update && npm install && npm install -g nodemon
ENV PORT=2800
# ENV STATIC_REF_DATA_PATH=/home/4T/usr/landy/grading_data/reference_scan
ENV STATIC_REF_DATA_PATH=/data/reference
# ENV STATIC_SOL_DATA_PATH=/home/4T/usr/landy/grading_data/student_solution_scan
ENV STATIC_SOL_DATA_PATH=/data/solution
ENV STATIC_REF_URL_PREFIX=http://127.0.0.1:2800
ENV STATIC_SOL_URL_PREFIX=http://127.0.0.1:2800
ENV COUCHDB_URL=http://127.0.0.1:8840
CMD ["nodemon"]