FROM node:19.5.0
ENV OPENAI_API_KEY=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
ENV PINECONE_API_KEY=f033f75b-013e-4aa5-8f00-fdb0832f4e02
ENV PINECONE_ENVIRONMENT=asia-southeast1-gcp-free
ENV PINECONE_INDEX_NAME=test
ENV MONGO_URL=mongodb+srv://wealthmand:qDB5rlPbM0sgf4Te@godman.igh4em1.mongodb.net/?retryWrites=true&w=majority
ENV JWT_SECRET=V430mgicSdqJ
ENV UNSTRUCTURED_API_KEY=sgGjaUb0KkAz8LdHxqHFL7LDj9hwpZ

ENV TEXT_DATASOURCE_NAME=godman_text-main.txt
ENV QNA_DATASOURCE_NAME=godman_qna-main.txt

ENV DOMAIN_NAME=https://godman.tech
ENV BACKEND_DOMAIN_NAME=https://godman.tech

ENV NODE_ENV=production
ENV CRAWL_LIMIT=2000
ENV MAX_CONCURRENCIES=5
#run dir of dockerfile
WORKDIR /app
COPY package*.json .
RUN npm i
RUN npm i -g @nestjs/cli
# first dot is location second is all files
COPY . .
EXPOSE 5050
RUN npm run build
#final command
CMD  ["npm","run","start:prod"]
