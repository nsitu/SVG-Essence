FROM nikolaik/python-nodejs:latest
# See also https://github.com/nikolaik/docker-python-nodejs
# All images have a default user pn with uid 1000 and gid 1000.
USER pn
WORKDIR /home/pn/app 
COPY . /home/pn/app/
USER root
# install dependencies for with Alpine Package Keeper 
RUN apk add libgeos-dev
RUN pip install --no-cache-dir -r requirements.txt

USER pn
RUN npm install --production && npm cache clean --force

ENV NODE_ENV production
ENV PORT 80
EXPOSE 80

CMD [ "npm", "start"]