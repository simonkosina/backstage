/*
 * Copyright 2024 The Backstage Authors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { MiddlewareFactory } from '@backstage/backend-defaults/rootHttpRouter';
import {
  LoggerService,
  RootConfigService,
} from '@backstage/backend-plugin-api';
import express from 'express';
import Router from 'express-promise-router';

import { OpenShiftService } from './openshift.service';
import { PartialSecret, Template } from './types';

export interface RouterOptions {
  logger: LoggerService;
  config: RootConfigService;
}

// TODO: Improve error handling
// TODO: Authentication
// TODO: Documentation of the API endpoints
export async function createRouter(
  options: RouterOptions,
): Promise<express.Router> {
  const { logger, config } = options;

  const baseUrl = config.getString('catalogInfo.baseUrl');
  const authToken = config.getString('catalogInfo.authToken');

  const openShiftService = new OpenShiftService(baseUrl, authToken);

  const router = Router();
  router.use(express.json());

  router.get('/health', (_, response) => {
    logger.info('PONG!');
    response.json({ status: 'ok' });
  });

  // Greedy routing, more specific routes need to be registered before the general routes to not get consumed.
  router.get('/templates/:namespace/:name', async (request, response) => {
    const { namespace, name } = request.params;

    try {
      const templates = await openShiftService.getTemplate(namespace, name);
      response.send(templates);
    } catch (e) {
      const endpoint = `/templates/${namespace}/${name}`;
      if (e instanceof Error) {
        logger.error(`GET '${endpoint}' ERROR:\n${e.message}\n${e.stack}`);
      } else {
        logger.error(`GET '${endpoint}' ERROR:\n${e}`);
      }

      response.status(500).send(e);
    }
  });

  router.get('/templates', async (_, response) => {
    try {
      const templates = await openShiftService.getTemplates();
      response.send(templates);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`GET '/templates' ERROR:\n${e.message}\n${e.stack}`);
      } else {
        logger.error(`GET '/templates' ERROR:\n${e}`);
      }

      response.status(500).send(e);
    }
  });

  router.get('/deploymentconfigs/:namespace', async (request, response) => {
    const { namespace } = request.params;

    try {
      const deploymentConfigs = await openShiftService.getDeploymentConfigs(
        namespace,
      );
      response.send(deploymentConfigs);
    } catch (e) {
      const endpoint = `/deploymentconfigs/${namespace}`;
      if (e instanceof Error) {
        logger.error(`GET '${endpoint}' ERROR:\n${e.message}\n${e.stack}`);
      } else {
        logger.error(`GET '${endpoint}' ERROR:\n${e}`);
      }

      response.status(500).send(e);
    }
  });

  router.post('/templateinstances/:namespace', async (request, response) => {
    const { namespace } = request.params;
    const endpoint = `/templateInstances/${namespace}`;

    try {
      const template: Template = request.body;
      logger.info(
        `POST '${endpoint}' request.body:\n${JSON.stringify(template)}\n`,
      );

      const templateInstance = await openShiftService.createTemplateInstance(
        namespace,
        template,
      );

      response.send(templateInstance);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`POST '${endpoint}' ERROR:\n${e.message}\n${e.stack}`);
      } else {
        logger.error(`POST '${endpoint}' ERROR:\n${e}`);
      }

      response.status(500).send(e);
    }
  });

  router.post('/secrets/:namespace', async (request, response) => {
    const { namespace } = request.params;
    const endpoint = `/templateInstances/${namespace}`;

    try {
      const partialSecret: PartialSecret = request.body;
      logger.info(
        `POST '${endpoint}' request.body:\n${JSON.stringify(partialSecret)}\n`,
      );

      const secret = await openShiftService.createSecret(
        namespace,
        partialSecret,
      );

      response.send(secret);
    } catch (e) {
      if (e instanceof Error) {
        logger.error(`POST '${endpoint}' ERROR:\n${e.message}\n${e.stack}`);
      } else {
        logger.error(`POST '${endpoint}' ERROR:\n${e}`);
      }

      response.status(500).send(e);
    }
  });

  const middleware = MiddlewareFactory.create({ logger, config });

  router.use(middleware.error());
  return router;
}
