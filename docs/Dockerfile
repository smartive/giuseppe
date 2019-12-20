FROM node:12 as build-api
WORKDIR /app
COPY package* ./
RUN npm ci
COPY ./ ./
RUN npm run typedoc

FROM starefossen/github-pages as final
COPY --from=build-api /app/docs/ /usr/src/app/
CMD jekyll serve -d /_site --watch --force_polling -H 0.0.0.0 -P 8080
