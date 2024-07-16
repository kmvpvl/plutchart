FROM nginx:latest
RUN mkdir -p /var/log/nginx/services/port443
RUN mkdir -p /var/log/nginx/services/port80
RUN mkdir -p /var/log/nginx/services/plutchart/api
RUN mkdir -p /var/log/nginx/services/plutchart/landing
RUN mkdir -p /var/log/nginx/services/plutchart/tool
COPY nginx.conf /etc/nginx/nginx.conf
