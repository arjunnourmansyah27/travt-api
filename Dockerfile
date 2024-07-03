FROM node:18

RUN apt-get update && \
    apt-get install -y python3 python3-pip python3-venv build-essential

WORKDIR /usr/src/app

RUN python3 -m venv venv
RUN . venv/bin/activate

RUN /bin/bash -c "source venv/bin/activate && pip install --upgrade pip && pip install numpy h5py tensorflow"

COPY package.json package-lock.json ./

RUN npm install

COPY . .

ENV TF_FORCE_GPU_ALLOW_GROWTH=true

ENV PORT=3000

ENV HOST=0.0.0.0

ENV DATABASE_URL=https://project_id-default-rtdb.region.firebasedatabase.app

CMD ["/bin/bash", "-c", "source venv/bin/activate && npm start"]