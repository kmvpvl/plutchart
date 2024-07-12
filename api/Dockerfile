FROM node:22-alpine
RUN mkdir -p /usr/src/plutchart_server
WORKDIR /usr/src/plutchart_server
COPY . .
RUN npm i
RUN npm run build
RUN chown -R node /usr/src/plutchart_server
USER node
EXPOSE ${PORT}
CMD ["npm", "run", "start"]