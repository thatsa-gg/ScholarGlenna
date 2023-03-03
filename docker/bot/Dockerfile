FROM node:lts-alpine
COPY . /app/
RUN /usr/local/bin/node /app/create-links.js create
CMD [ "/usr/local/bin/node", "/app/src/bot" ]
