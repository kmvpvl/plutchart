FROM node:22-alpine
RUN mkdir -p /usr/src/plutchart_landing
WORKDIR /usr/src/plutchart_landing
COPY . .
RUN npm i
RUN npm run build
RUN npm install -g serve
RUN chown -R node /usr/src/plutchart_landing
USER node
EXPOSE ${PORT}
CMD ["serve", "-s", "build"]