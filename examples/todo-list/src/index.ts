// Copyright IBM Corp. 2018. All Rights Reserved.
// Node module: @loopback/example-todo-list
// This file is licensed under the MIT License.
// License text available at https://opensource.org/licenses/MIT

import {TodoListApplication} from './application';
import {ApplicationConfig} from '@loopback/core';
import express = require('express');
import request = require('request-promise-native');
import graphqlHTTP = require('express-graphql');

const {createGraphQlSchema} = require('oasgraph');

export {TodoListApplication};

export async function main(options: ApplicationConfig = {}) {
  const app = new TodoListApplication(options);
  await app.boot();
  await app.start();

  const url = app.restServer.url;
  console.log(`Server is running at ${url}`);

  /**
   * RUN OASGRAPH
   */
  let oas = await request.get(`${app.restServer.url}/openapi.json`);

  const {schema, report} = await createGraphQlSchema(JSON.parse(oas), {
    addSubOperations: true,
  });
  const graphqlServer = express();
  graphqlServer.use(
    '/graphql',
    graphqlHTTP({
      schema,
      graphiql: true,
    }),
  );
  graphqlServer.listen(3001);
  console.log(`OASGraph server is running at port 3001/graphql`);

  return app;
}
