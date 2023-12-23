FROM nikolaik/python-nodejs:python3.12-nodejs20-alpine
# See also https://github.com/nikolaik/docker-python-nodejs
# All images have a default user pn with uid 1000 and gid 1000. 
USER root
# install dependencies for with Alpine Package Keeper 
RUN apk update && apk upgrade
RUN apk add --no-cache make g++ bash git openssh curl geos 
USER pn
WORKDIR /home/pn/app 
COPY . /home/pn/app/  
RUN pip install --no-cache-dir -r requirements.txt 
RUN npm install --production && npm cache clean --force 
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80 
CMD [ "npm", "start"]