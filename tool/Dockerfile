FROM node:22-alpine
RUN mkdir -p /usr/src/plutchart_tool
WORKDIR /usr/src/plutchart_tool
COPY . .
RUN npm i
RUN npm run build
RUN npm install -g serve
RUN chown -R node /usr/src/plutchart_tool
USER node
EXPOSE ${PORT}
CMD ["serve", "-s", "build"]