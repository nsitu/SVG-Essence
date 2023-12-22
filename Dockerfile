FROM nikolaik/python-nodejs:latest

USER pn
WORKDIR /home/pn/app
COPY . /home/pn/app/

RUN pip install --no-cache-dir -r requirements.txt

RUN npm install --production && npm cache clean --force

ENV NODE_ENV production
ENV PORT 80
EXPOSE 80

CMD [ "npm", "start"]