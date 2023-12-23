FROM nikolaik/python-nodejs:python3.12-nodejs20-alpine
# See also https://github.com/nikolaik/docker-python-nodejs
# All images have a default user pn with uid 1000 and gid 1000. 
WORKDIR /home/pn/app 
COPY . /home/pn/app  
# install dependencies with Alpine Package Keeper  
RUN apk add --no-cache geos 
RUN pipx install "vpype[all]"
# RUN pip install --no-cache-dir -r requirements.txt 
RUN npm install --production && npm cache clean --force 
ENV NODE_ENV production
ENV PORT 80
EXPOSE 80 
CMD [ "npm", "start"]